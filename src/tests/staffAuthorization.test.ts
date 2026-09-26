import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import * as fs from 'node:fs';
import * as path from 'node:path';

const PROJECT_ID = 'african-dish-staff-assignment-test';

/** Regression coverage for staff assignment being authorization data. */
export async function runStaffAssignmentAuthorizationTests(): Promise<void> {
  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');
  const hostPort = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8888';
  const [host, portText] = hostPort.split(':');
  const port = Number.parseInt(portText, 10) || 8888;

  const testEnv: RulesTestEnvironment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules, host, port },
  });

  try {
    await testEnv.clearFirestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'users', 'staff_alice'), {
        role: 'restaurant_staff',
        name: 'Alice Staff',
        kitchenStaff: { assignedRestaurantId: 'rest_a' },
      });
      await setDoc(doc(db, 'restaurants', 'rest_a'), {
        ownerId: 'owner_a',
        staffIds: [],
      });
      await setDoc(doc(db, 'restaurants', 'rest_b'), {
        ownerId: 'owner_b',
        staffIds: [],
      });
      await setDoc(doc(db, 'orders', 'order_b'), {
        userId: 'customer_b',
        restaurantId: 'rest_b',
        status: 'paid',
      });
    });

    const staffDb = testEnv.authenticatedContext('staff_alice').firestore();
    const staffProfile = doc(staffDb, 'users', 'staff_alice');

    await assertFails(updateDoc(staffProfile, {
      'kitchenStaff.assignedRestaurantId': 'rest_b',
    }));

    // A denied assignment change must not grant access to another restaurant's order.
    await assertFails(getDoc(doc(staffDb, 'orders', 'order_b')));

    // Staff may still update ordinary profile data without changing their assignment.
    await assertSucceeds(updateDoc(staffProfile, { name: 'Alice Updated' }));

    console.log('PASS: staff cannot self-assign to another restaurant');
  } finally {
    await testEnv.cleanup();
  }
}
