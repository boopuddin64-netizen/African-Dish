/**
 * Multi-role end-to-end lifecycle test (Firestore emulator + the REAL firestore.rules file).
 *
 * Actors:  customer (alice) · restaurant owner (owner_a) · courier (dave) · admin (zack)
 *          + bystanders: random user (bob), other restaurant (owner_b), unassigned courier (carl)
 *          + the trusted server (Admin SDK, bypasses rules) running the REAL Cloud Function logic from functions/src
 *
 * Lifecycle:  cart -> checkout -> payment_pending  (customer)
 *          -> paid -> restaurant_pending           (trusted server / simulated Paystack webhook)
 *          -> accepted -> preparing -> ready, courier assigned  (restaurant owner)
 *          -> out_for_delivery -> delivered        (courier)
 *          -> rating                               (customer, only allowed fields)
 *          -> read / override / refund             (admin)
 * Also: the client-side state machine (src/lib/orderStateMachine.ts) is cross-checked against firestore.rules, both by
 * parsing the rules text and by exhaustively exercising every from->to pair per actor against the emulator.
 */
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';
import { doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where } from 'firebase/firestore';
import {
  VALID_ORDER_TRANSITIONS,
  isValidOrderStatusTransition,
  canActorTransition,
  OrderActor,
} from '../lib/orderStateMachine';
import type { OrderStatus } from '../types';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyPaystackSignature, signPaystackPayload } from '../../functions/src/paystack';

const PROJECT_ID = 'african-dish-roleflow-test';
const ALL_STATUSES = Object.keys(VALID_ORDER_TRANSITIONS) as OrderStatus[];

export async function runRoleFlowTests(): Promise<{ passed: number; failed: number }> {
  console.log('====================================================');
  console.log('STARTING MULTI-ROLE END-TO-END FLOW TEST (customer / restaurant / courier / admin)');
  console.log('====================================================');

  const rules = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf8');
  const hostPort = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8888';
  const [host, portStr] = hostPort.split(':');
  const port = parseInt(portStr, 10) || 8888;

  const testEnv: RulesTestEnvironment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules, host, port },
  });
  await testEnv.clearFirestore();

  // ---- trusted server: REAL Cloud Function logic through the Admin SDK (bypasses rules, like production) ----
  process.env.FIRESTORE_EMULATOR_HOST = `${host}:${port}`;
  const adminApp = getApps().length ? getApps()[0] : initializeApp({ projectId: PROJECT_ID });
  const adminDb = getFirestore(adminApp);
  const { markOrderPaid } = await import('../../functions/src/orders');
  const { createPricedOrder } = await import('../../functions/src/placeOrder');

  // ---- seed (rules disabled) ----
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users', 'cust_alice'), { role: 'customer', name: 'Alice', phone: '+2348000000001' });
    await setDoc(doc(db, 'users', 'rando_bob'), { role: 'customer', name: 'Bob' });
    await setDoc(doc(db, 'users', 'owner_a'), { role: 'restaurant_staff', name: 'Owner A' });
    await setDoc(doc(db, 'users', 'owner_b'), { role: 'restaurant_staff', name: 'Owner B' });
    await setDoc(doc(db, 'users', 'courier_dave'), { role: 'courier', name: 'Dave' });
    await setDoc(doc(db, 'users', 'courier_carl'), { role: 'courier', name: 'Carl' });
    await setDoc(doc(db, 'users', 'admin_zack'), { role: 'admin', name: 'Zack' });
    const rest = (id: string, owner: string) => ({
      id, name: `Rest ${id}`, ownerId: owner, city: 'Port Harcourt', isOpen: true, acceptingOrders: true,
      verified: true, verificationStatus: 'verified', deliveryFeeNGN: 1000, deliveryFeeGBP: 3.5,
      minimumOrderNGN: 2000, minimumOrderGBP: 5, fulfillmentOptions: ['delivery', 'pickup'],
      estimatedDeliveryMin: 25, estimatedDeliveryMax: 40,
    });
    await setDoc(doc(db, 'restaurants', 'rest_a'), rest('rest_a', 'owner_a'));
    await setDoc(doc(db, 'restaurants', 'rest_b'), rest('rest_b', 'owner_b'));
    await setDoc(doc(db, 'meals', 'meal_jollof'), {
      id: 'meal_jollof', restaurantId: 'rest_a', name: 'Party Jollof', priceNGN: 3500, priceGBP: 12, isAvailable: true,
      customizationOptions: [{ id: 'plantain', name: 'Fried plantain', priceDelta: 500 }],
    });
  });

  const alice = testEnv.authenticatedContext('cust_alice').firestore();
  const bob = testEnv.authenticatedContext('rando_bob').firestore();
  const ownerA = testEnv.authenticatedContext('owner_a').firestore();
  const ownerB = testEnv.authenticatedContext('owner_b').firestore();
  const dave = testEnv.authenticatedContext('courier_dave').firestore();
  const carl = testEnv.authenticatedContext('courier_carl').firestore();
  const zack = testEnv.authenticatedContext('admin_zack').firestore();

  let passed = 0;
  let failed = 0;
  let stepNo = 0;
  const failures: string[] = [];
  const record = (ok: boolean, label: string, detail?: unknown) => {
    stepNo++;
    const tag = String(stepNo).padStart(2, '0');
    if (ok) {
      passed++;
      console.log(`✅ PASS [STEP ${tag}] ${label}`);
    } else {
      failed++;
      failures.push(label);
      console.log(`❌ FAIL [STEP ${tag}] ${label}${detail ? ` -- ${detail instanceof Error ? detail.message : String(detail)}` : ''}`);
    }
  };
  const allowed = async (label: string, p: Promise<unknown>) => {
    try { await assertSucceeds(p); record(true, `ALLOWED  ${label}`); } catch (e) { record(false, `ALLOWED  ${label}`, e); }
  };
  const denied = async (label: string, p: Promise<unknown>) => {
    try { await assertFails(p); record(true, `DENIED   ${label}`); } catch (e) { record(false, `DENIED   ${label}`, e); }
  };
  const check = (label: string, cond: boolean, detail?: unknown) => record(cond, `CHECK    ${label}`, cond ? undefined : detail ?? 'condition was false');
  const section = (t: string) => console.log(`\n--- ${t} ---`);
  const now = () => new Date().toISOString();

  // ===================================================================
  section('A. CUSTOMER: cart -> checkout -> payment_pending (client draft)');
  const draftId = 'ord_flow_draft';
  const draft = {
    id: draftId, orderNumber: 'ORD-DRAFT', userId: 'cust_alice', restaurantId: 'rest_a', restaurantName: 'Rest rest_a',
    items: [{ id: 'i1', quantity: 2, itemPrice: 4000 }], subtotal: 8000, deliveryFee: 1000, serviceFee: 400, total: 9400,
    currency: 'NGN', status: 'cart', paymentStatus: 'pending', createdAt: now(),
  };
  await allowed('customer creates own order in status "cart"', setDoc(doc(alice, 'orders', draftId), draft));
  await allowed('customer moves cart -> checkout', updateDoc(doc(alice, 'orders', draftId), { status: 'checkout', updatedAt: now() }));
  await allowed('customer moves checkout -> payment_pending', updateDoc(doc(alice, 'orders', draftId), { status: 'payment_pending', updatedAt: now() }));
  check('client helper agrees: cart->checkout->payment_pending valid',
    isValidOrderStatusTransition('cart', 'checkout') && isValidOrderStatusTransition('checkout', 'payment_pending'));

  section('B. NEGATIVE: customer cannot pay / self-promote / forge');
  await denied('customer marks own order status=paid', updateDoc(doc(alice, 'orders', draftId), { status: 'paid', updatedAt: now() }));
  await denied('customer sets paymentStatus=paid', updateDoc(doc(alice, 'orders', draftId), { paymentStatus: 'paid', updatedAt: now() }));
  await denied('customer sets status=paid AND paymentStatus=paid together', updateDoc(doc(alice, 'orders', draftId), { status: 'paid', paymentStatus: 'paid' }));
  await denied('customer forges serverPriced=true on existing order', updateDoc(doc(alice, 'orders', draftId), { serverPriced: true }));
  await denied('customer lowers order total', updateDoc(doc(alice, 'orders', draftId), { total: 1 }));
  await denied('customer self-promotes users/{uid}.role -> admin', updateDoc(doc(alice, 'users', 'cust_alice'), { role: 'admin' }));
  await denied('customer self-promotes role -> restaurant_staff', updateDoc(doc(alice, 'users', 'cust_alice'), { role: 'restaurant_staff' }));
  await denied('customer self-promotes role -> courier', updateDoc(doc(alice, 'users', 'cust_alice'), { role: 'courier' }));
  await denied('customer sets isAdmin=true', updateDoc(doc(alice, 'users', 'cust_alice'), { isAdmin: true }));
  await denied('customer creates a users doc for someone else as admin', setDoc(doc(alice, 'users', 'evil_admin'), { role: 'admin' }));
  await allowed('customer may still edit harmless profile fields (theme)', updateDoc(doc(alice, 'users', 'cust_alice'), { theme: 'dark' }));

  // ===================================================================
  section('C. TRUSTED SERVER: server-side pricing (placeOrder) + simulated Paystack webhook');
  const placed = await createPricedOrder(adminDb as never, 'cust_alice', {
    restaurantId: 'rest_a',
    items: [{ mealId: 'meal_jollof', quantity: 2, customizationIds: ['plantain'] }],
    fulfillmentMethod: 'delivery', currency: 'NGN', deliveryAddress: { label: 'Home', address: '14 Tombia St' },
  });
  const orderId = placed.orderId;
  const ref = placed.paymentReference as string;
  check('placeOrder computed server-side total = (3500+500)*2 + 1000 delivery + 5% fee = 9400',
    placed.order.subtotal === 8000 && placed.order.deliveryFee === 1000 && placed.order.serviceFee === 400 && placed.order.total === 9400,
    JSON.stringify({ s: placed.order.subtotal, d: placed.order.deliveryFee, f: placed.order.serviceFee, t: placed.order.total }));
  check('order id is a collision-resistant UUID', /^ord_[0-9a-f-]{36}$/.test(orderId), orderId);
  check('server-priced order starts payment_pending / pending', placed.order.status === 'payment_pending' && placed.order.paymentStatus === 'pending');
  await allowed('customer can read own server-priced order', getDoc(doc(alice, 'orders', orderId)));
  await denied('customer marks server-priced order paid', updateDoc(doc(alice, 'orders', orderId), { status: 'paid', paymentStatus: 'paid' }));

  const webhookBody = JSON.stringify({ event: 'charge.success', data: { reference: ref, amount: 940000, currency: 'NGN', metadata: { orderId } } });
  const secret = 'sk_test_roleflow_secret';
  check('webhook: valid HMAC-SHA512 signature accepted', verifyPaystackSignature(webhookBody, signPaystackPayload(webhookBody, secret), secret));
  check('webhook: forged signature rejected', !verifyPaystackSignature(webhookBody, signPaystackPayload(webhookBody, 'attacker'), secret));
  check('webhook: tampered amount rejected', !verifyPaystackSignature(webhookBody.replace('940000', '100'), signPaystackPayload(webhookBody, secret), secret));

  const draftOutcome = await markOrderPaid(adminDb as never, draftId, { reference: 'anything', source: 'paystack_webhook' });
  check('server refuses to pay a client-created (non-server-priced) draft', !draftOutcome.ok, JSON.stringify(draftOutcome));
  const wrongRef = await markOrderPaid(adminDb as never, orderId, { reference: 'WRONG_REF', amountMinor: 940000, currency: 'NGN', source: 'paystack_webhook' });
  check('server refuses payment with wrong reference', !wrongRef.ok, JSON.stringify(wrongRef));
  const wrongAmt = await markOrderPaid(adminDb as never, orderId, { reference: ref, amountMinor: 100, currency: 'NGN', source: 'paystack_webhook' });
  check('server refuses underpayment (amount mismatch)', !wrongAmt.ok && (wrongAmt as { reason: string }).reason === 'amount_mismatch', JSON.stringify(wrongAmt));
  await denied('restaurant owner cannot accept before payment (payment_pending -> accepted)', updateDoc(doc(ownerA, 'orders', orderId), { status: 'accepted', updatedAt: now() }));

  const paid = await markOrderPaid(adminDb as never, orderId, { reference: ref, amountMinor: 940000, currency: 'NGN', source: 'paystack_webhook' });
  check('webhook (Admin SDK) moves payment_pending -> paid -> restaurant_pending', paid.ok === true, JSON.stringify(paid));
  const replay = await markOrderPaid(adminDb as never, orderId, { reference: ref, amountMinor: 940000, currency: 'NGN', source: 'paystack_webhook' });
  check('webhook replay is idempotent', replay.ok === true && (replay as { alreadyProcessed: boolean }).alreadyProcessed === true, JSON.stringify(replay));
  const afterPay = (await getDoc(doc(alice, 'orders', orderId))).data() as Record<string, unknown>;
  check('order is now paymentStatus=paid, status=restaurant_pending, paidAt set',
    afterPay.paymentStatus === 'paid' && afterPay.status === 'restaurant_pending' && typeof afterPay.paidAt === 'string', JSON.stringify(afterPay));
  check('client state machine agrees: payment_pending->paid and paid->restaurant_pending valid',
    isValidOrderStatusTransition('payment_pending', 'paid') && isValidOrderStatusTransition('paid', 'restaurant_pending'));

  // ===================================================================
  section('D. ISOLATION: outsiders cannot see or touch the paid order');
  await denied('random user (bob) reads the order', getDoc(doc(bob, 'orders', orderId)));
  await denied('other restaurant (owner_b) reads the order', getDoc(doc(ownerB, 'orders', orderId)));
  await denied('other restaurant (owner_b) accepts the order', updateDoc(doc(ownerB, 'orders', orderId), { status: 'accepted', updatedAt: now() }));
  await denied('other restaurant (owner_b) rejects the order', updateDoc(doc(ownerB, 'orders', orderId), { status: 'rejected', updatedAt: now() }));
  await denied('unassigned courier (dave) reads the order', getDoc(doc(dave, 'orders', orderId)));
  await denied('unassigned courier (dave) accepts the order', updateDoc(doc(dave, 'orders', orderId), { status: 'accepted', updatedAt: now() }));
  await denied('unassigned courier (dave) self-assigns via courierId', updateDoc(doc(dave, 'orders', orderId), { courierId: 'courier_dave', updatedAt: now() }));
  await denied('unassigned courier (dave) sets paid', updateDoc(doc(dave, 'orders', orderId), { status: 'paid' }));
  await allowed('admin can read the order', getDoc(doc(zack, 'orders', orderId)));

  // ===================================================================
  section('E. RESTAURANT OWNER: accept -> preparing -> ready, assign courier');
  await denied('restaurant cannot change total', updateDoc(doc(ownerA, 'orders', orderId), { status: 'accepted', total: 1, updatedAt: now() }));
  await denied('restaurant cannot set paymentStatus', updateDoc(doc(ownerA, 'orders', orderId), { paymentStatus: 'refunded', updatedAt: now() }));
  await denied('restaurant cannot skip to ready (restaurant_pending -> ready)', updateDoc(doc(ownerA, 'orders', orderId), { status: 'ready', updatedAt: now() }));
  await allowed('restaurant owner accepts (restaurant_pending -> accepted)', updateDoc(doc(ownerA, 'orders', orderId), { status: 'accepted', updatedAt: now() }));
  await denied('customer cannot cancel after the kitchen accepted', updateDoc(doc(alice, 'orders', orderId), { status: 'cancelled', updatedAt: now() }));
  await allowed('restaurant owner starts preparing', updateDoc(doc(ownerA, 'orders', orderId), { status: 'preparing', updatedAt: now() }));
  await denied('restaurant cannot assign a non-courier user (bob) as courier', updateDoc(doc(ownerA, 'orders', orderId), { courierId: 'rando_bob', updatedAt: now() }));
  await allowed('restaurant assigns real courier (dave)', updateDoc(doc(ownerA, 'orders', orderId), { courierId: 'courier_dave', updatedAt: now() }));
  await allowed('restaurant marks ready', updateDoc(doc(ownerA, 'orders', orderId), { status: 'ready', updatedAt: now() }));
  await denied('restaurant cannot hand over itself (ready -> out_for_delivery)', updateDoc(doc(ownerA, 'orders', orderId), { status: 'out_for_delivery', updatedAt: now() }));

  // ===================================================================
  section('F. COURIER: out_for_delivery -> delivered (only the assigned courier)');
  await denied('other courier (carl) reads the order', getDoc(doc(carl, 'orders', orderId)));
  await denied('other courier (carl) picks up the order', updateDoc(doc(carl, 'orders', orderId), { status: 'out_for_delivery', updatedAt: now() }));
  await allowed('assigned courier (dave) can read the order', getDoc(doc(dave, 'orders', orderId)));
  await denied('assigned courier cannot set status=paid', updateDoc(doc(dave, 'orders', orderId), { status: 'paid', updatedAt: now() }));
  await denied('assigned courier cannot set status=accepted', updateDoc(doc(dave, 'orders', orderId), { status: 'accepted', updatedAt: now() }));
  await denied('assigned courier cannot set paymentStatus', updateDoc(doc(dave, 'orders', orderId), { paymentStatus: 'refunded', updatedAt: now() }));
  await denied('assigned courier cannot reassign courierId', updateDoc(doc(dave, 'orders', orderId), { courierId: 'courier_carl', updatedAt: now() }));
  await allowed('courier picks up (ready -> out_for_delivery)', updateDoc(doc(dave, 'orders', orderId), { status: 'out_for_delivery', updatedAt: now() }));
  await allowed('courier delivers (out_for_delivery -> delivered) with deliveredAt', updateDoc(doc(dave, 'orders', orderId), { status: 'delivered', deliveredAt: now(), updatedAt: now() }));
  await denied('courier cannot change a delivered order afterwards', updateDoc(doc(dave, 'orders', orderId), { status: 'out_for_delivery', updatedAt: now() }));

  // ===================================================================
  section('G. CUSTOMER RATING: only allowed fields, only once, only 1-5');
  const rating = { foodRating: 5, restaurantRating: 4, deliveryRating: 5, feedbackTags: ['Great taste'], timestamp: now() };
  await denied('customer rating that also flips status to cancelled', updateDoc(doc(alice, 'orders', orderId), { ratingSubmitted: rating, status: 'cancelled', updatedAt: now() }));
  await denied('customer rating that also edits total', updateDoc(doc(alice, 'orders', orderId), { ratingSubmitted: rating, total: 1, updatedAt: now() }));
  await denied('customer rating with out-of-range stars (6)', updateDoc(doc(alice, 'orders', orderId), { ratingSubmitted: { ...rating, foodRating: 6 }, updatedAt: now() }));
  await denied('other user (bob) rates the order', updateDoc(doc(bob, 'orders', orderId), { ratingSubmitted: rating, updatedAt: now() }));
  await allowed('customer submits rating (ratingSubmitted + updatedAt only)', updateDoc(doc(alice, 'orders', orderId), { ratingSubmitted: rating, updatedAt: now() }));
  await denied('customer cannot rate a second time', updateDoc(doc(alice, 'orders', orderId), { ratingSubmitted: { ...rating, foodRating: 1 }, updatedAt: now() }));
  await denied('customer cannot cancel a delivered order', updateDoc(doc(alice, 'orders', orderId), { status: 'cancelled', updatedAt: now() }));

  // ===================================================================
  section('H. QUERIES (list rules) per role');
  await allowed('customer lists own orders', getDocs(query(collection(alice, 'orders'), where('userId', '==', 'cust_alice'))));
  await denied('customer lists ALL orders (unfiltered)', getDocs(collection(alice, 'orders')));
  await allowed('restaurant owner lists own restaurant orders', getDocs(query(collection(ownerA, 'orders'), where('restaurantId', '==', 'rest_a'))));
  await denied('restaurant owner lists another restaurant orders', getDocs(query(collection(ownerA, 'orders'), where('restaurantId', '==', 'rest_b'))));
  await allowed('courier lists orders assigned to them', getDocs(query(collection(dave, 'orders'), where('courierId', '==', 'courier_dave'))));
  await denied('courier lists orders assigned to someone else', getDocs(query(collection(dave, 'orders'), where('courierId', '==', 'courier_carl'))));
  await allowed('admin lists all orders', getDocs(collection(zack, 'orders')));

  // ===================================================================
  section('I. ADMIN: read / override / refund');
  await allowed('admin reads the delivered order', getDoc(doc(zack, 'orders', orderId)));
  await allowed('admin refunds (delivered -> refunded, paymentStatus=refunded)', updateDoc(doc(zack, 'orders', orderId), { status: 'refunded', paymentStatus: 'refunded', updatedAt: now() }));
  await denied('admin still bound by state machine (refunded -> preparing)', updateDoc(doc(zack, 'orders', orderId), { status: 'preparing', updatedAt: now() }));
  await allowed('admin overrides the unpaid draft (payment_pending -> cancelled)', updateDoc(doc(zack, 'orders', draftId), { status: 'cancelled', updatedAt: now() }));
  await allowed('admin refunds the cancelled draft (cancelled -> refunded)', updateDoc(doc(zack, 'orders', draftId), { status: 'refunded', paymentStatus: 'refunded', updatedAt: now() }));
  await allowed('admin promotes a user via users/{uid}.role (trusted role grant)', updateDoc(doc(zack, 'users', 'rando_bob'), { role: 'courier' }));
  await denied('the promoted-by-admin path is NOT open to bob himself (role -> admin)', updateDoc(doc(bob, 'users', 'rando_bob'), { role: 'admin' }));

  // ===================================================================
  section('J. STATE-MACHINE SYNC: client helper vs firestore.rules');
  // J1: parse the rules text and compare with VALID_ORDER_TRANSITIONS
  const fn = rules.slice(rules.indexOf('function isValidOrderTransition'), rules.indexOf('// --- Users Collection'));
  const parsed: Record<string, Set<string>> = {};
  const lineRe = /oldStatus == '([a-z_]+)' && newStatus (?:in \[([^\]]*)\]|== '([a-z_]+)')/g;
  for (const m of fn.matchAll(lineRe)) {
    const targets = m[2] ? m[2].split(',').map((x) => x.trim().replace(/'/g, '')) : [m[3]];
    parsed[m[1]] = new Set(targets);
  }
  let syncOk = true;
  const diffs: string[] = [];
  for (const s of ALL_STATUSES) {
    const client = new Set(VALID_ORDER_TRANSITIONS[s]);
    const server = parsed[s] ?? new Set<string>();
    const same = client.size === server.size && [...client].every((x) => server.has(x));
    if (!same) { syncOk = false; diffs.push(`${s}: client=[${[...client]}] rules=[${[...server]}]`); }
  }
  check('rules text `isValidOrderTransition` == client VALID_ORDER_TRANSITIONS for all 16 statuses', syncOk, diffs.join(' | '));

  // J2: exhaustive emulator check as ADMIN (admin has no field limits, so only the state machine applies)
  let adminMismatch: string[] = [];
  let pairs = 0;
  for (const from of ALL_STATUSES) {
    for (const to of ALL_STATUSES) {
      const id = `sm_admin_${from}_${to}`;
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        await setDoc(doc(ctx.firestore(), 'orders', id), { id, userId: 'cust_alice', restaurantId: 'rest_a', courierId: 'courier_dave', status: from, paymentStatus: 'paid', total: 1 });
      });
      let ok = true;
      try { await assertSucceeds(updateDoc(doc(zack, 'orders', id), { status: to, updatedAt: now() })); } catch { ok = false; }
      pairs++;
      if (ok !== isValidOrderStatusTransition(from, to)) adminMismatch.push(`${from}->${to}: rules=${ok} client=${!ok}`);
    }
  }
  check(`exhaustive: all ${pairs} (from,to) pairs as admin behave exactly like isValidOrderStatusTransition`, adminMismatch.length === 0, adminMismatch.slice(0, 5).join(' | '));

  // J3: exhaustive per-actor check against canActorTransition
  const actors: { actor: OrderActor; db: typeof alice }[] = [
    { actor: 'customer', db: alice }, { actor: 'restaurant', db: ownerA }, { actor: 'courier', db: dave },
  ];
  for (const { actor, db } of actors) {
    const mismatches: string[] = [];
    let n = 0;
    for (const from of ALL_STATUSES) {
      for (const to of ALL_STATUSES) {
        if (from === to) continue;
        const id = `sm_${actor}_${from}_${to}`;
        await testEnv.withSecurityRulesDisabled(async (ctx) => {
          await setDoc(doc(ctx.firestore(), 'orders', id), { id, userId: 'cust_alice', restaurantId: 'rest_a', courierId: 'courier_dave', status: from, paymentStatus: 'paid', total: 1 });
        });
        let ok = true;
        try { await assertSucceeds(updateDoc(doc(db, 'orders', id), { status: to, updatedAt: now() })); } catch { ok = false; }
        n++;
        const expected = canActorTransition(actor, from, to);
        if (ok !== expected) mismatches.push(`${from}->${to}: rules=${ok} client=${expected}`);
      }
    }
    check(`exhaustive: ${n} transitions as ${actor.toUpperCase()} match client canActorTransition`, mismatches.length === 0, mismatches.slice(0, 6).join(' | '));
  }

  await testEnv.cleanup();

  console.log('\n====================================================');
  console.log('ROLE FLOW RESULTS');
  console.log(`TOTAL STEPS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  if (failures.length) failures.forEach((f) => console.log(`  ✗ ${f}`));
  console.log('====================================================');
  if (failed > 0) throw new Error(`Role flow test had ${failed} failing step(s)`);
  return { passed, failed };
}
