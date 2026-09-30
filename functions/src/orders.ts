import { FieldValue, Firestore, Transaction } from 'firebase-admin/firestore';

export interface PaymentConfirmation {
  reference: string;
  /** Amount actually charged, in minor units (kobo / pence). Omit only for the dev simulator. */
  amountMinor?: number;
  currency?: string;
  source: 'paystack_webhook' | 'dev_simulation';
}

export type MarkPaidOutcome =
  | { ok: true; alreadyProcessed: boolean; orderId: string }
  | { ok: false; reason: 'not_found' | 'amount_mismatch' | 'not_server_priced' | 'invalid_state'; orderId?: string };

/**
 * Trusted transition payment_pending -> paid -> restaurant_pending, executed with the Admin SDK (which bypasses
 * Firestore rules). This is the ONLY code path that may set paymentStatus = 'paid'.
 *
 * Mirrors VALID_ORDER_TRANSITIONS in src/services/orderService.ts and isValidOrderTransition in firestore.rules.
 * Idempotent: replays of the same webhook are acknowledged without changing the order.
 */
export async function markOrderPaid(db: Firestore, orderId: string, conf: PaymentConfirmation): Promise<MarkPaidOutcome> {
  const ref = db.collection('orders').doc(orderId);
  return db.runTransaction<MarkPaidOutcome>(async (tx: Transaction) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return { ok: false, reason: 'not_found', orderId };
    const order = snap.data() as Record<string, any>;

    if (order.paymentReference !== conf.reference) return { ok: false, reason: 'invalid_state', orderId };
    if (order.paymentStatus === 'paid') return { ok: true, alreadyProcessed: true, orderId };
    if (order.status !== 'payment_pending') return { ok: false, reason: 'invalid_state', orderId };
    // Only orders priced by the placeOrder function may be paid; client-created drafts are never payable.
    if (order.serverPriced !== true) return { ok: false, reason: 'not_server_priced', orderId };

    if (conf.amountMinor !== undefined) {
      const expectedMinor = Math.round(Number(order.total) * 100);
      if (conf.amountMinor !== expectedMinor || (conf.currency && conf.currency !== order.currency)) {
        return { ok: false, reason: 'amount_mismatch', orderId };
      }
    }

    const now = new Date().toISOString();
    tx.update(ref, {
      status: 'restaurant_pending', // payment_pending -> paid -> restaurant_pending (paid is recorded in paymentStatus/paidAt)
      paymentStatus: 'paid',
      paidAt: now,
      paymentVerifiedBy: conf.source,
      updatedAt: now,
      statusHistory: FieldValue.arrayUnion({ status: 'paid', at: now, by: conf.source }, { status: 'restaurant_pending', at: now, by: conf.source }),
    });
    return { ok: true, alreadyProcessed: false, orderId };
  });
}
