/**
 * Real Firestore Security Rules Unit Tests
 * Executes authentic database operations against the actual Firestore Rules Engine using @firebase/rules-unit-testing.
 */
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

const PROJECT_ID = 'african-dish-security-test';

export async function runRealFirestoreRulesTests() {
  console.log('====================================================');
  console.log('STARTING REAL FIRESTORE SECURITY RULES ENGINE TESTS');
  console.log('Loading actual firestore.rules into Firestore Rules Engine...');
  console.log('====================================================');

  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');

  const hostPort = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8888';
  const [host, portStr] = hostPort.split(':');
  const port = parseInt(portStr, 10) || 8888;

  const testEnv: RulesTestEnvironment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host,
      port,
    },
  });

  // Clear Firestore data before seeding
  await testEnv.clearFirestore();

  // Setup seed data with security rules disabled
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    // 1. Seed users
    await setDoc(doc(db, 'users', 'cust_alice'), { role: 'customer', name: 'Alice' });
    await setDoc(doc(db, 'users', 'cust_bob'), { role: 'customer', name: 'Bob' });
    await setDoc(doc(db, 'users', 'owner_sam'), { role: 'restaurant_staff', name: 'Sam' });
    await setDoc(doc(db, 'users', 'courier_dave'), { role: 'courier', name: 'Dave' });
    await setDoc(doc(db, 'users', 'admin_zack'), { role: 'admin', isAdmin: true, name: 'Zack' });

    // 2. Seed restaurant
    await setDoc(doc(db, 'restaurants', 'rest_buka'), {
      ownerId: 'owner_sam',
      name: 'Mama Put Buka',
      city: 'London',
    });

    // 3. Seed orders with various initial statuses for testing
    // Order 1: pending order owned by Alice
    await setDoc(doc(db, 'orders', 'ord_pending'), {
      id: 'ord_pending',
      userId: 'cust_alice',
      restaurantId: 'rest_buka',
      courierId: 'courier_dave',
      status: 'payment_pending',
      paymentStatus: 'pending',
      paymentReference: 'REF_ORIGINAL_123',
      paymentMethod: 'card',
      subtotal: 30.00,
      deliveryFee: 3.50,
      serviceFee: 1.00,
      total: 34.50,
      createdAt: '2026-08-29T10:00:00Z',
    });

    // Order 2: paid order ready for restaurant acceptance
    await setDoc(doc(db, 'orders', 'ord_paid'), {
      id: 'ord_paid',
      userId: 'cust_alice',
      restaurantId: 'rest_buka',
      courierId: 'courier_dave',
      status: 'paid',
      paymentStatus: 'paid',
      subtotal: 30.00,
      deliveryFee: 3.50,
      serviceFee: 1.00,
      total: 34.50,
      createdAt: '2026-08-29T10:00:00Z',
    });

    // Order 3: accepted order ready for kitchen prep
    await setDoc(doc(db, 'orders', 'ord_accepted'), {
      id: 'ord_accepted',
      userId: 'cust_alice',
      restaurantId: 'rest_buka',
      courierId: 'courier_dave',
      status: 'accepted',
      paymentStatus: 'paid',
      subtotal: 30.00,
      deliveryFee: 3.50,
      serviceFee: 1.00,
      total: 34.50,
      createdAt: '2026-08-29T10:00:00Z',
    });

    // Order 4: preparing order ready to be marked ready
    await setDoc(doc(db, 'orders', 'ord_preparing'), {
      id: 'ord_preparing',
      userId: 'cust_alice',
      restaurantId: 'rest_buka',
      courierId: 'courier_dave',
      status: 'preparing',
      paymentStatus: 'paid',
      subtotal: 30.00,
      deliveryFee: 3.50,
      serviceFee: 1.00,
      total: 34.50,
      createdAt: '2026-08-29T10:00:00Z',
    });

    // Order 5: ready order ready for courier pickup
    await setDoc(doc(db, 'orders', 'ord_ready'), {
      id: 'ord_ready',
      userId: 'cust_alice',
      restaurantId: 'rest_buka',
      courierId: 'courier_dave',
      status: 'ready',
      paymentStatus: 'paid',
      subtotal: 30.00,
      deliveryFee: 3.50,
      serviceFee: 1.00,
      total: 34.50,
      createdAt: '2026-08-29T10:00:00Z',
    });

    // Order 6: out_for_delivery order ready for courier delivery confirmation
    await setDoc(doc(db, 'orders', 'ord_out_for_delivery'), {
      id: 'ord_out_for_delivery',
      userId: 'cust_alice',
      restaurantId: 'rest_buka',
      courierId: 'courier_dave',
      status: 'out_for_delivery',
      paymentStatus: 'paid',
      subtotal: 30.00,
      deliveryFee: 3.50,
      serviceFee: 1.00,
      total: 34.50,
      createdAt: '2026-08-29T10:00:00Z',
    });

    // Order 7: delivered order ready for rating submission
    await setDoc(doc(db, 'orders', 'ord_delivered'), {
      id: 'ord_delivered',
      userId: 'cust_alice',
      restaurantId: 'rest_buka',
      courierId: 'courier_dave',
      status: 'delivered',
      paymentStatus: 'paid',
      subtotal: 30.00,
      deliveryFee: 3.50,
      serviceFee: 1.00,
      total: 34.50,
      createdAt: '2026-08-29T10:00:00Z',
    });
  });

  // Client contexts
  const aliceDb = testEnv.authenticatedContext('cust_alice').firestore();
  const bobDb = testEnv.authenticatedContext('cust_bob').firestore();
  const samDb = testEnv.authenticatedContext('owner_sam').firestore();
  const daveDb = testEnv.authenticatedContext('courier_dave').firestore();
  const adminDb = testEnv.authenticatedContext('admin_zack').firestore();
  const unauthDb = testEnv.unauthenticatedContext().firestore();

  let passCount = 0;
  let failCount = 0;

  async function testAssertFails(testNum: number, desc: string, promise: Promise<any>) {
    try {
      await assertFails(promise);
      console.log(`✅ PASS: [TEST ${testNum}] DENIED - ${desc}`);
      passCount++;
    } catch (err: any) {
      console.error(`❌ FAIL: [TEST ${testNum}] ${desc} - Expected DENIAL, but operation succeeded or threw unexpected error:`, err);
      failCount++;
      throw err;
    }
  }

  async function testAssertSucceeds(testNum: number, desc: string, promise: Promise<any>) {
    try {
      await assertSucceeds(promise);
      console.log(`✅ PASS: [TEST ${testNum}] ALLOWED - ${desc}`);
      passCount++;
    } catch (err: any) {
      console.error(`❌ FAIL: [TEST ${testNum}] ${desc} - Expected SUCCESS, but operation was DENIED:`, err);
      failCount++;
      throw err;
    }
  }

  console.log('\n--- EXECUTING MANDATED DENIAL TESTS AGAINST REAL FIRESTORE RULES ENGINE ---');

  // 1. Customer changes total
  await testAssertFails(1, 'Customer changes total', updateDoc(doc(aliceDb, 'orders', 'ord_pending'), {
    total: 0.50,
  }));

  // 2. Customer changes subtotal
  await testAssertFails(2, 'Customer changes subtotal', updateDoc(doc(aliceDb, 'orders', 'ord_pending'), {
    subtotal: 1.00,
  }));

  // 3. Customer changes deliveryFee
  await testAssertFails(3, 'Customer changes deliveryFee', updateDoc(doc(aliceDb, 'orders', 'ord_pending'), {
    deliveryFee: 0.00,
  }));

  // 4. Customer changes serviceFee
  await testAssertFails(4, 'Customer changes serviceFee', updateDoc(doc(aliceDb, 'orders', 'ord_pending'), {
    serviceFee: 0.00,
  }));

  // 5. Customer changes paymentStatus
  await testAssertFails(5, 'Customer changes paymentStatus to paid', updateDoc(doc(aliceDb, 'orders', 'ord_pending'), {
    paymentStatus: 'paid',
  }));

  // 6. Customer changes paymentReference
  await testAssertFails(6, 'Customer changes paymentReference', updateDoc(doc(aliceDb, 'orders', 'ord_pending'), {
    paymentReference: 'FORGED_REF_999',
  }));

  // 7. Customer changes paymentMethod
  await testAssertFails(7, 'Customer changes paymentMethod', updateDoc(doc(aliceDb, 'orders', 'ord_pending'), {
    paymentMethod: 'crypto',
  }));

  // 8. Customer changes restaurantId
  await testAssertFails(8, 'Customer changes restaurantId', updateDoc(doc(aliceDb, 'orders', 'ord_pending'), {
    restaurantId: 'rest_other',
  }));

  // 9. Customer changes courierId
  await testAssertFails(9, 'Customer changes courierId', updateDoc(doc(aliceDb, 'orders', 'ord_pending'), {
    courierId: 'courier_fake',
  }));

  // 10. Customer changes userId
  await testAssertFails(10, 'Customer changes userId to steal/reassign order', updateDoc(doc(aliceDb, 'orders', 'ord_pending'), {
    userId: 'cust_bob',
  }));

  // 11. Customer performs payment_pending -> delivered
  await testAssertFails(11, 'Customer performs invalid transition payment_pending -> delivered', updateDoc(doc(aliceDb, 'orders', 'ord_pending'), {
    status: 'delivered',
  }));

  // 12. Unauthorized user modifies another user's order
  await testAssertFails(12, 'Unauthorized user (Bob) modifies Alice order', updateDoc(doc(bobDb, 'orders', 'ord_pending'), {
    status: 'cancelled',
  }));

  // 13. Anonymous user modifies an order
  await testAssertFails(13, 'Anonymous user modifies an order', updateDoc(doc(unauthDb, 'orders', 'ord_pending'), {
    status: 'cancelled',
  }));

  // 14. Restaurant staff modifies protected financial fields
  await testAssertFails(14, 'Restaurant staff modifies protected total during preparation', updateDoc(doc(samDb, 'orders', 'ord_accepted'), {
    status: 'preparing',
    total: 999.00,
  }));

  // 15. Courier modifies protected financial fields
  await testAssertFails(15, 'Courier modifies protected total during delivery', updateDoc(doc(daveDb, 'orders', 'ord_ready'), {
    status: 'out_for_delivery',
    total: 999.00,
  }));

  console.log('\n--- EXECUTING MANDATED ALLOW TESTS AGAINST REAL FIRESTORE RULES ENGINE ---');

  // 16. Customer performs a legitimate permitted cancellation
  await testAssertSucceeds(16, 'Customer performs legitimate permitted cancellation from payment_pending', updateDoc(doc(aliceDb, 'orders', 'ord_pending'), {
    status: 'cancelled',
    updatedAt: '2026-08-29T10:05:00Z',
  }));

  // 17. Customer updates legitimately permitted rating fields
  await testAssertSucceeds(17, 'Customer updates legitimately permitted rating fields on delivered order', updateDoc(doc(aliceDb, 'orders', 'ord_delivered'), {
    ratingSubmitted: {
      foodRating: 5,
      restaurantRating: 5,
      deliveryRating: 5,
      feedbackTags: ['Authentic taste', 'Hot & fresh'],
      timestamp: '2026-08-29T11:00:00Z',
    },
    updatedAt: '2026-08-29T11:00:00Z',
  }));

  // 18. Restaurant staff performs a valid accepted -> preparing transition
  await testAssertSucceeds(18, 'Restaurant staff performs valid accepted -> preparing transition', updateDoc(doc(samDb, 'orders', 'ord_accepted'), {
    status: 'preparing',
    updatedAt: '2026-08-29T10:15:00Z',
  }));

  // 19. Restaurant staff performs preparing -> ready
  await testAssertSucceeds(19, 'Restaurant staff performs valid preparing -> ready transition', updateDoc(doc(samDb, 'orders', 'ord_preparing'), {
    status: 'ready',
    updatedAt: '2026-08-29T10:30:00Z',
  }));

  // 20. Assigned courier performs ready -> out_for_delivery
  await testAssertSucceeds(20, 'Assigned courier performs valid ready -> out_for_delivery transition', updateDoc(doc(daveDb, 'orders', 'ord_ready'), {
    status: 'out_for_delivery',
    driverName: 'Dave K.',
    driverPhone: '+447000000000',
    driverVehicle: 'Honda Motorcycle',
    updatedAt: '2026-08-29T10:35:00Z',
  }));

  // 21. Assigned courier performs out_for_delivery -> delivered
  await testAssertSucceeds(21, 'Assigned courier performs valid out_for_delivery -> delivered transition', updateDoc(doc(daveDb, 'orders', 'ord_out_for_delivery'), {
    status: 'delivered',
    deliveredAt: '2026-08-29T10:55:00Z',
    updatedAt: '2026-08-29T10:55:00Z',
  }));

  // 22. Admin performs its legitimately permitted administrative operation
  await testAssertSucceeds(22, 'Admin performs legitimately permitted administrative operation', updateDoc(doc(adminDb, 'orders', 'ord_paid'), {
    status: 'accepted',
    updatedAt: '2026-08-29T10:05:00Z',
  }));

  console.log('\n====================================================');
  console.log(`REAL FIRESTORE RULES ENGINE RESULTS:`);
  console.log(`TOTAL REAL ASSERTIONS: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('====================================================');

  await testEnv.cleanup();
}
