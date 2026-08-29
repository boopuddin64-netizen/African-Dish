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
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

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

    // 1. Seed users across all distinct roles
    // Customers
    await setDoc(doc(db, 'users', 'cust_alice'), { role: 'customer', name: 'Alice Customer' });
    await setDoc(doc(db, 'users', 'cust_bob'), { role: 'customer', name: 'Bob Customer' });

    // Restaurant Owners & Staff
    await setDoc(doc(db, 'users', 'owner_sam_a'), { role: 'restaurant_staff', name: 'Sam Owner Alpha' });
    await setDoc(doc(db, 'users', 'owner_ben_b'), { role: 'restaurant_staff', name: 'Ben Owner Beta' });
    await setDoc(doc(db, 'users', 'staff_sally_a'), {
      role: 'restaurant_staff',
      name: 'Sally Staff Alpha',
      kitchenStaff: {
        staffId: 'stf_sally',
        staffName: 'Sally Staff Alpha',
        assignedRestaurantId: 'rest_a'
      }
    });
    await setDoc(doc(db, 'users', 'staff_tim_b'), {
      role: 'restaurant_staff',
      name: 'Tim Staff Beta',
      kitchenStaff: {
        staffId: 'stf_tim',
        staffName: 'Tim Staff Beta',
        assignedRestaurantId: 'rest_b'
      }
    });

    // Couriers
    await setDoc(doc(db, 'users', 'courier_dave_a'), {
      role: 'courier',
      name: 'Dave Courier A',
      courier: { courierId: 'courier_dave_a', riderName: 'Dave' }
    });
    await setDoc(doc(db, 'users', 'courier_carl_b'), {
      role: 'courier',
      name: 'Carl Courier B',
      courier: { courierId: 'courier_carl_b', riderName: 'Carl' }
    });

    // Admin
    await setDoc(doc(db, 'users', 'admin_zack'), { role: 'admin', isAdmin: true, name: 'Zack Admin' });

    // 2. Seed Restaurants
    await setDoc(doc(db, 'restaurants', 'rest_a'), {
      id: 'rest_a',
      ownerId: 'owner_sam_a',
      name: 'Restaurant Alpha (Sam)',
      city: 'London',
      isOpen: true,
      operatingHours: '10am - 10pm',
      prepBufferMinutes: 10
    });

    await setDoc(doc(db, 'restaurants', 'rest_b'), {
      id: 'rest_b',
      ownerId: 'owner_ben_b',
      name: 'Restaurant Beta (Ben)',
      city: 'Manchester',
      isOpen: true,
      operatingHours: '11am - 11pm',
      prepBufferMinutes: 15
    });

    // 3. Seed Meals
    await setDoc(doc(db, 'meals', 'meal_a1'), {
      id: 'meal_a1',
      restaurantId: 'rest_a',
      restaurantName: 'Restaurant Alpha (Sam)',
      name: 'Alpha Smoky Party Jollof',
      priceNGN: 3500,
      priceGBP: 12.00,
      isAvailable: true
    });

    await setDoc(doc(db, 'meals', 'meal_b1'), {
      id: 'meal_b1',
      restaurantId: 'rest_b',
      restaurantName: 'Restaurant Beta (Ben)',
      name: 'Beta Gourmet Egusi & Pounded Yam',
      priceNGN: 4500,
      priceGBP: 15.00,
      isAvailable: true
    });

    // 4. Seed Orders
    // Order 1: Pending order owned by Alice at Restaurant A, assigned to Dave
    await setDoc(doc(db, 'orders', 'ord_round1_pending'), {
      id: 'ord_round1_pending',
      userId: 'cust_alice',
      restaurantId: 'rest_a',
      courierId: 'courier_dave_a',
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

    // Order 2: Paid order ready for restaurant acceptance
    await setDoc(doc(db, 'orders', 'ord_round1_paid'), {
      id: 'ord_round1_paid',
      userId: 'cust_alice',
      restaurantId: 'rest_a',
      courierId: 'courier_dave_a',
      status: 'paid',
      paymentStatus: 'paid',
      subtotal: 30.00,
      deliveryFee: 3.50,
      serviceFee: 1.00,
      total: 34.50,
      createdAt: '2026-08-29T10:00:00Z',
    });

    // Order 3: Accepted order ready for kitchen prep
    await setDoc(doc(db, 'orders', 'ord_round1_accepted'), {
      id: 'ord_round1_accepted',
      userId: 'cust_alice',
      restaurantId: 'rest_a',
      courierId: 'courier_dave_a',
      status: 'accepted',
      paymentStatus: 'paid',
      subtotal: 30.00,
      deliveryFee: 3.50,
      serviceFee: 1.00,
      total: 34.50,
      createdAt: '2026-08-29T10:00:00Z',
    });

    // Order 4: Preparing order
    await setDoc(doc(db, 'orders', 'ord_round1_preparing'), {
      id: 'ord_round1_preparing',
      userId: 'cust_alice',
      restaurantId: 'rest_a',
      courierId: 'courier_dave_a',
      status: 'preparing',
      paymentStatus: 'paid',
      subtotal: 30.00,
      deliveryFee: 3.50,
      serviceFee: 1.00,
      total: 34.50,
      createdAt: '2026-08-29T10:00:00Z',
    });

    // Order 5: Ready order assigned to Dave
    await setDoc(doc(db, 'orders', 'ord_round1_ready'), {
      id: 'ord_round1_ready',
      userId: 'cust_alice',
      restaurantId: 'rest_a',
      courierId: 'courier_dave_a',
      status: 'ready',
      paymentStatus: 'paid',
      subtotal: 30.00,
      deliveryFee: 3.50,
      serviceFee: 1.00,
      total: 34.50,
      createdAt: '2026-08-29T10:00:00Z',
    });

    // Order 6: Out for delivery order assigned to Dave
    await setDoc(doc(db, 'orders', 'ord_round1_out_for_delivery'), {
      id: 'ord_round1_out_for_delivery',
      userId: 'cust_alice',
      restaurantId: 'rest_a',
      courierId: 'courier_dave_a',
      status: 'out_for_delivery',
      paymentStatus: 'paid',
      subtotal: 30.00,
      deliveryFee: 3.50,
      serviceFee: 1.00,
      total: 34.50,
      createdAt: '2026-08-29T10:00:00Z',
    });

    // Order 7: Delivered order
    await setDoc(doc(db, 'orders', 'ord_round1_delivered'), {
      id: 'ord_round1_delivered',
      userId: 'cust_alice',
      restaurantId: 'rest_a',
      courierId: 'courier_dave_a',
      status: 'delivered',
      paymentStatus: 'paid',
      subtotal: 30.00,
      deliveryFee: 3.50,
      serviceFee: 1.00,
      total: 34.50,
      createdAt: '2026-08-29T10:00:00Z',
    });

    // Order 8: Restaurant B order owned by Bob and assigned to Courier Carl
    await setDoc(doc(db, 'orders', 'ord_rest_b_order'), {
      id: 'ord_rest_b_order',
      userId: 'cust_bob',
      restaurantId: 'rest_b',
      courierId: 'courier_carl_b',
      status: 'accepted',
      paymentStatus: 'paid',
      subtotal: 40.00,
      deliveryFee: 4.00,
      serviceFee: 1.00,
      total: 45.00,
      createdAt: '2026-08-29T10:00:00Z',
    });

    // Order 9: Unassigned ready order at Restaurant A
    await setDoc(doc(db, 'orders', 'ord_unassigned_ready'), {
      id: 'ord_unassigned_ready',
      userId: 'cust_alice',
      restaurantId: 'rest_a',
      status: 'ready',
      paymentStatus: 'paid',
      subtotal: 25.00,
      deliveryFee: 3.00,
      serviceFee: 1.00,
      total: 29.00,
      createdAt: '2026-08-29T10:00:00Z',
    });

    // Order 10: Restaurant B ready order assigned to Carl
    await setDoc(doc(db, 'orders', 'ord_courier_b_assigned'), {
      id: 'ord_courier_b_assigned',
      userId: 'cust_bob',
      restaurantId: 'rest_b',
      courierId: 'courier_carl_b',
      status: 'ready',
      paymentStatus: 'paid',
      subtotal: 35.00,
      deliveryFee: 3.50,
      serviceFee: 1.00,
      total: 39.50,
      createdAt: '2026-08-29T10:00:00Z',
    });
  });

  // Client contexts
  const aliceDb = testEnv.authenticatedContext('cust_alice').firestore();
  const bobDb = testEnv.authenticatedContext('cust_bob').firestore();
  const samDb = testEnv.authenticatedContext('owner_sam_a').firestore();
  const benDb = testEnv.authenticatedContext('owner_ben_b').firestore();
  const sallyDb = testEnv.authenticatedContext('staff_sally_a').firestore();
  const timDb = testEnv.authenticatedContext('staff_tim_b').firestore();
  const daveDb = testEnv.authenticatedContext('courier_dave_a').firestore();
  const carlDb = testEnv.authenticatedContext('courier_carl_b').firestore();
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

  console.log('\n====================================================');
  console.log('1. RESTAURANT AUTHORIZATION HARDENING TESTS (1 - 7)');
  console.log('====================================================');

  // 1. Restaurant A owner attempts to modify Restaurant B
  await testAssertFails(1, 'Restaurant A owner attempts to modify Restaurant B document', 
    updateDoc(doc(samDb, 'restaurants', 'rest_b'), {
      name: 'Hacked Restaurant Beta',
      isOpen: false,
    })
  );

  // 2. Restaurant A attempts to modify Restaurant B meal
  await testAssertFails(2, 'Restaurant A attempts to modify Restaurant B meal', 
    updateDoc(doc(samDb, 'meals', 'meal_b1'), {
      priceGBP: 99.99,
      isAvailable: false,
    })
  );

  // 3. Restaurant A attempts to change a meal\'s restaurantId
  await testAssertFails(3, 'Restaurant A attempts to change meal restaurantId to Restaurant B', 
    updateDoc(doc(samDb, 'meals', 'meal_a1'), {
      restaurantId: 'rest_b',
    })
  );

  // 4. Restaurant A attempts to change restaurant ownerId
  await testAssertFails(4, 'Restaurant A owner attempts to change restaurant ownerId (transfer ownership)', 
    updateDoc(doc(samDb, 'restaurants', 'rest_a'), {
      ownerId: 'owner_hacker',
    })
  );

  // 5. Restaurant A attempts to modify Restaurant B order
  await testAssertFails(5, 'Restaurant A owner attempts to modify Restaurant B order status', 
    updateDoc(doc(samDb, 'orders', 'ord_rest_b_order'), {
      status: 'preparing',
    })
  );

  // 6. Restaurant staff attempts to access another restaurant\'s order
  await testAssertFails(6, 'Restaurant A staff (Sally) attempts to read Restaurant B order document', 
    getDoc(doc(sallyDb, 'orders', 'ord_rest_b_order'))
  );

  // 7. Restaurant user attempts privilege escalation
  await testAssertFails(7, 'Restaurant staff user attempts self-promotion to admin role/flag', 
    updateDoc(doc(samDb, 'users', 'owner_sam_a'), {
      role: 'admin',
      isAdmin: true,
    })
  );

  console.log('\n====================================================');
  console.log('2. COURIER AUTHORIZATION HARDENING TESTS (8 - 17)');
  console.log('====================================================');

  // 8. Courier A attempts to read Courier B\'s assigned order
  await testAssertFails(8, 'Courier A attempts to read Courier B assigned order document', 
    getDoc(doc(daveDb, 'orders', 'ord_courier_b_assigned'))
  );

  // 9. Courier A attempts to modify Courier B\'s order
  await testAssertFails(9, 'Courier A attempts to modify Courier B order', 
    updateDoc(doc(daveDb, 'orders', 'ord_courier_b_assigned'), {
      status: 'out_for_delivery',
    })
  );

  // 10. Courier attempts to self-assign to an unassigned order
  await testAssertFails(10, 'Courier attempts to self-assign to an unassigned order', 
    updateDoc(doc(daveDb, 'orders', 'ord_unassigned_ready'), {
      courierId: 'courier_dave_a',
      status: 'out_for_delivery',
    })
  );

  // 11. Courier attempts to replace courierId
  await testAssertFails(11, 'Courier attempts to replace courierId on assigned order', 
    updateDoc(doc(daveDb, 'orders', 'ord_round1_ready'), {
      courierId: 'courier_carl_b',
    })
  );

  // 12. Courier attempts to modify restaurantId
  await testAssertFails(12, 'Courier attempts to modify restaurantId on assigned order', 
    updateDoc(doc(daveDb, 'orders', 'ord_round1_ready'), {
      restaurantId: 'rest_b',
    })
  );

  // 13. Courier attempts to modify customer/userId
  await testAssertFails(13, 'Courier attempts to modify customer userId on assigned order', 
    updateDoc(doc(daveDb, 'orders', 'ord_round1_ready'), {
      userId: 'cust_bob',
    })
  );

  // 14. Courier attempts to modify order total
  await testAssertFails(14, 'Courier attempts to modify order total', 
    updateDoc(doc(daveDb, 'orders', 'ord_round1_ready'), {
      total: 1.00,
    })
  );

  // 15. Courier attempts to modify paymentStatus
  await testAssertFails(15, 'Courier attempts to modify paymentStatus (e.g. to refunded or paid)', 
    updateDoc(doc(daveDb, 'orders', 'ord_round1_ready'), {
      paymentStatus: 'refunded',
    })
  );

  // 16. Courier attempts invalid delivery transition
  await testAssertFails(16, 'Courier attempts invalid delivery transition from preparing to delivered', 
    updateDoc(doc(daveDb, 'orders', 'ord_round1_preparing'), {
      status: 'delivered',
    })
  );

  // 17. Courier attempts to modify an unrelated order
  await testAssertFails(17, 'Courier attempts to modify an unrelated order at another restaurant', 
    updateDoc(doc(daveDb, 'orders', 'ord_rest_b_order'), {
      status: 'cancelled',
    })
  );

  console.log('\n====================================================');
  console.log('3. LEGITIMATE OPERATIONS TESTS (18 - 22)');
  console.log('====================================================');

  // 18. Restaurant owner modifies their own restaurant
  await testAssertSucceeds(18, 'Restaurant owner modifies their own restaurant profile settings', 
    updateDoc(doc(samDb, 'restaurants', 'rest_a'), {
      isOpen: true,
      prepBufferMinutes: 20,
    })
  );

  // 19. Restaurant owner manages their own meal
  await testAssertSucceeds(19, 'Restaurant owner manages their own meal price and availability', 
    updateDoc(doc(samDb, 'meals', 'meal_a1'), {
      priceGBP: 13.50,
      isAvailable: true,
    })
  );

  // 20. Restaurant staff performs an authorized operational order update
  await testAssertSucceeds(20, 'Restaurant staff (Sally) performs authorized accepted -> preparing update with ETA', 
    updateDoc(doc(sallyDb, 'orders', 'ord_round1_accepted'), {
      status: 'preparing',
      estimatedDeliveryTime: '30 mins',
      updatedAt: '2026-08-29T10:15:00Z',
    })
  );

  // 21. Assigned courier performs an authorized delivery update
  await testAssertSucceeds(21, 'Assigned courier (Dave) performs valid ready -> out_for_delivery update with driver info', 
    updateDoc(doc(daveDb, 'orders', 'ord_round1_ready'), {
      status: 'out_for_delivery',
      driverName: 'Dave Courier',
      driverPhone: '+447911123456',
      driverVehicle: 'Yamaha 125cc',
      updatedAt: '2026-08-29T10:35:00Z',
    })
  );

  // 22. Unauthorized cross-restaurant/cross-courier operations are denied
  await testAssertFails(22, 'Staff of Restaurant B (Tim) attempting to operate on Restaurant A order is DENIED', 
    updateDoc(doc(timDb, 'orders', 'ord_round1_accepted'), {
      status: 'ready',
    })
  );

  console.log('\n====================================================');
  console.log('4. PRESERVED ROUND 1 FINANCIAL, CUSTOMER & SYSTEM INTEGRITY TESTS (23 - 40)');
  console.log('====================================================');

  // 23. Customer changes total
  await testAssertFails(23, 'Customer attempts to change order total', 
    updateDoc(doc(aliceDb, 'orders', 'ord_round1_pending'), { total: 0.50 })
  );

  // 24. Customer changes subtotal
  await testAssertFails(24, 'Customer attempts to change order subtotal', 
    updateDoc(doc(aliceDb, 'orders', 'ord_round1_pending'), { subtotal: 1.00 })
  );

  // 25. Customer changes deliveryFee
  await testAssertFails(25, 'Customer attempts to change deliveryFee', 
    updateDoc(doc(aliceDb, 'orders', 'ord_round1_pending'), { deliveryFee: 0.00 })
  );

  // 26. Customer changes serviceFee
  await testAssertFails(26, 'Customer attempts to change serviceFee', 
    updateDoc(doc(aliceDb, 'orders', 'ord_round1_pending'), { serviceFee: 0.00 })
  );

  // 27. Customer changes paymentStatus
  await testAssertFails(27, 'Customer attempts to change paymentStatus to paid', 
    updateDoc(doc(aliceDb, 'orders', 'ord_round1_pending'), { paymentStatus: 'paid' })
  );

  // 28. Customer changes paymentReference
  await testAssertFails(28, 'Customer attempts to change paymentReference', 
    updateDoc(doc(aliceDb, 'orders', 'ord_round1_pending'), { paymentReference: 'FORGED_REF_999' })
  );

  // 29. Customer changes paymentMethod
  await testAssertFails(29, 'Customer attempts to change paymentMethod', 
    updateDoc(doc(aliceDb, 'orders', 'ord_round1_pending'), { paymentMethod: 'crypto' })
  );

  // 30. Customer changes restaurantId
  await testAssertFails(30, 'Customer attempts to change restaurantId', 
    updateDoc(doc(aliceDb, 'orders', 'ord_round1_pending'), { restaurantId: 'rest_other' })
  );

  // 31. Customer changes courierId
  await testAssertFails(31, 'Customer attempts to change courierId', 
    updateDoc(doc(aliceDb, 'orders', 'ord_round1_pending'), { courierId: 'courier_fake' })
  );

  // 32. Customer changes userId
  await testAssertFails(32, 'Customer attempts to change userId to steal/reassign order', 
    updateDoc(doc(aliceDb, 'orders', 'ord_round1_pending'), { userId: 'cust_bob' })
  );

  // 33. Customer invalid state transition
  await testAssertFails(33, 'Customer performs invalid transition payment_pending -> delivered', 
    updateDoc(doc(aliceDb, 'orders', 'ord_round1_pending'), { status: 'delivered' })
  );

  // 34. Unauthorized user modifies Alice\'s order
  await testAssertFails(34, 'Unauthorized user (Bob) attempts to cancel Alice order', 
    updateDoc(doc(bobDb, 'orders', 'ord_round1_pending'), { status: 'cancelled' })
  );

  // 35. Anonymous user modifies an order
  await testAssertFails(35, 'Anonymous unauthenticated user attempts to modify an order', 
    updateDoc(doc(unauthDb, 'orders', 'ord_round1_pending'), { status: 'cancelled' })
  );

  // 36. Restaurant staff modifies protected financial fields
  await testAssertFails(36, 'Restaurant staff modifies protected total during preparation', 
    updateDoc(doc(samDb, 'orders', 'ord_round1_accepted'), {
      status: 'preparing',
      total: 999.00,
    })
  );

  // 37. Courier modifies protected financial fields
  await testAssertFails(37, 'Courier modifies protected total during delivery', 
    updateDoc(doc(daveDb, 'orders', 'ord_round1_ready'), {
      status: 'out_for_delivery',
      total: 999.00,
    })
  );

  // 38. Customer legitimate cancellation
  await testAssertSucceeds(38, 'Customer performs legitimate permitted cancellation from payment_pending', 
    updateDoc(doc(aliceDb, 'orders', 'ord_round1_pending'), {
      status: 'cancelled',
      updatedAt: '2026-08-29T10:05:00Z',
    })
  );

  // 39. Customer legitimately updates ratings
  await testAssertSucceeds(39, 'Customer updates rating fields on delivered order', 
    updateDoc(doc(aliceDb, 'orders', 'ord_round1_delivered'), {
      ratingSubmitted: {
        foodRating: 5,
        restaurantRating: 5,
        deliveryRating: 5,
        feedbackTags: ['Authentic taste', 'Hot & fresh'],
        timestamp: '2026-08-29T11:00:00Z',
      },
      updatedAt: '2026-08-29T11:00:00Z',
    })
  );

  // 40. Admin performs legitimate administrative order transition
  await testAssertSucceeds(40, 'Admin performs legitimately permitted administrative operation', 
    updateDoc(doc(adminDb, 'orders', 'ord_round1_paid'), {
      status: 'accepted',
      updatedAt: '2026-08-29T10:05:00Z',
    })
  );

  console.log('\n====================================================');
  console.log(`REAL FIRESTORE RULES ENGINE RESULTS:`);
  console.log(`TOTAL REAL ASSERTIONS: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('====================================================');

  await testEnv.cleanup();
}
