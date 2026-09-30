import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { markOrderPaid } from './orders';
import { verifyPaystackSignature } from './paystack';
import { PricingError, toMinorUnits } from './pricing';
import { createPricedOrder, PlaceOrderRequest } from './placeOrder';

initializeApp();
const db = getFirestore();

/** Paystack secret key: `firebase functions:secrets:set PAYSTACK_SECRET_KEY` (or PAYSTACK_SECRET_KEY env var locally). */
const paystackSecret = defineSecret('PAYSTACK_SECRET_KEY');
function getPaystackSecret(): string | undefined {
  try {
    return paystackSecret.value() || process.env.PAYSTACK_SECRET_KEY;
  } catch {
    return process.env.PAYSTACK_SECRET_KEY;
  }
}

function toHttpsError(err: unknown): HttpsError {
  if (err instanceof HttpsError) return err;
  if (err instanceof PricingError) return new HttpsError(err.code, err.message);
  logger.error('Unhandled function error', err);
  return new HttpsError('internal', 'Unexpected server error.');
}

/** Callable: authoritative order pricing + creation (see createPricedOrder). */
export const placeOrder = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Please sign in to place an order.');
  try {
    return await createPricedOrder(db, uid, request.data as PlaceOrderRequest, String(request.auth?.token.name ?? ''));
  } catch (err) {
    throw toHttpsError(err);
  }
});

/**
 * Callable: starts a Paystack transaction for an existing server-priced order owned by the caller.
 * Returns Paystack's hosted checkout URL. Requires PAYSTACK_SECRET_KEY.
 */
export const initializePayment = onCall({ secrets: [paystackSecret] }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Please sign in.');
  const orderId = String(request.data?.orderId ?? '');
  const secret = getPaystackSecret();
  if (!secret) throw new HttpsError('failed-precondition', 'Payments are not configured (PAYSTACK_SECRET_KEY missing).');
  const snap = await db.collection('orders').doc(orderId).get();
  const order = snap.data();
  if (!snap.exists || !order || order.userId !== uid) throw new HttpsError('not-found', 'Order not found.');
  if (order.status !== 'payment_pending' || order.serverPriced !== true) {
    throw new HttpsError('failed-precondition', 'Order is not awaiting payment.');
  }
  const email = request.auth?.token.email;
  if (!email) throw new HttpsError('failed-precondition', 'An email address is required to pay.');
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      amount: toMinorUnits(order.total),
      currency: order.currency,
      reference: order.paymentReference,
      metadata: { orderId },
    }),
  });
  const body = (await res.json()) as { status?: boolean; message?: string; data?: { authorization_url?: string } };
  if (!res.ok || !body.status) {
    logger.error('Paystack initialize failed', body);
    throw new HttpsError('unavailable', 'Could not start payment.');
  }
  return { authorizationUrl: body.data?.authorization_url, paymentReference: order.paymentReference };
});

/**
 * HTTP webhook for Paystack (`charge.success`).
 * 1. verifies x-paystack-signature = HMAC-SHA512(rawBody, PAYSTACK_SECRET_KEY)
 * 2. checks the charged amount/currency against the server-priced order
 * 3. via Admin SDK moves payment_pending -> paid -> restaurant_pending (idempotent)
 * STUB NOTE: for production also confirm with GET /transaction/verify/:reference before trusting the event.
 */
export const paystackWebhook = onRequest({ secrets: [paystackSecret] }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  const raw = req.rawBody;
  if (!verifyPaystackSignature(raw, req.get('x-paystack-signature'), getPaystackSecret())) {
    logger.warn('Rejected webhook with invalid signature');
    res.status(401).send('Invalid signature');
    return;
  }
  const event = req.body as { event?: string; data?: { reference?: string; amount?: number; currency?: string; metadata?: { orderId?: string } } };
  if (event.event !== 'charge.success' || !event.data?.reference) {
    res.status(200).send('Ignored');
    return;
  }
  let orderId = event.data.metadata?.orderId;
  if (!orderId) {
    const q = await db.collection('orders').where('paymentReference', '==', event.data.reference).limit(1).get();
    orderId = q.docs[0]?.id;
  }
  if (!orderId) {
    res.status(200).send('Unknown reference');
    return;
  }
  const outcome = await markOrderPaid(db, orderId, {
    reference: event.data.reference,
    amountMinor: event.data.amount,
    currency: event.data.currency,
    source: 'paystack_webhook',
  });
  if (!outcome.ok) logger.warn('Webhook could not mark order paid', outcome);
  // Always 200 for authentic events so Paystack does not retry forever.
  res.status(200).json({ received: true, ok: outcome.ok });
});

/**
 * DEV / SIMULATION ONLY. Lets the order owner "pay" without a gateway so the full flow can be exercised locally.
 * Hard-gated: only runs inside the Functions emulator or when ALLOW_PAYMENT_SIMULATION=true is explicitly set.
 * Never enable ALLOW_PAYMENT_SIMULATION in production.
 */
export const simulatePayment = onCall(async (request) => {
  const enabled = process.env.FUNCTIONS_EMULATOR === 'true' || process.env.ALLOW_PAYMENT_SIMULATION === 'true';
  if (!enabled) throw new HttpsError('failed-precondition', 'Payment simulation is disabled outside the emulator.');
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Please sign in.');
  const orderId = String(request.data?.orderId ?? '');
  const snap = await db.collection('orders').doc(orderId).get();
  const order = snap.data();
  if (!snap.exists || !order || order.userId !== uid) throw new HttpsError('not-found', 'Order not found.');
  const outcome = await markOrderPaid(db, orderId, { reference: order.paymentReference, source: 'dev_simulation' });
  if (!outcome.ok) throw new HttpsError('failed-precondition', `Could not mark order paid: ${outcome.reason}`);
  return { ok: true, orderId, simulated: true };
});
