/**
 * Master Test Runner for African-Dish Integrity & Security Rules
 */
import { runFirestoreRulesSecurityTests } from './firestoreRules.test';
import { runOrderIntegrityTests } from './orderIntegrity.test';

async function main() {
  console.log('Running African-Dish Security and Integrity Test Suite...\n');
  try {
    runOrderIntegrityTests();
    console.log('\n');
    runFirestoreRulesSecurityTests();
    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY (0 FAILURES)');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

main();
