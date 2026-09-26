/**
 * Master Test Runner for African-Dish Integrity & Real Firestore Security Rules
 */
import { runRealFirestoreRulesTests } from './firestoreRulesReal.test';
import { runOrderIntegrityTests } from './orderIntegrity.test';
import { runStaffAssignmentAuthorizationTests } from './staffAuthorization.test';

async function main() {
  console.log('Running African-Dish Real Firestore Security and Integrity Test Suite...\n');
  try {
    runOrderIntegrityTests();
    console.log('\n');
    await runRealFirestoreRulesTests();
    await runStaffAssignmentAuthorizationTests();
    console.log('\n🎉 ALL REAL TESTS PASSED SUCCESSFULLY (0 FAILURES)');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

main();
