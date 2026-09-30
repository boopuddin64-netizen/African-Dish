/**
 * Master Test Runner for African-Dish Integrity & Real Firestore Security Rules
 */
import { runRealFirestoreRulesTests } from './firestoreRulesReal.test';
import { runOrderIntegrityTests } from './orderIntegrity.test';
import { runFunctionsLogicTests } from './functionsLogic.test';
import { runRoleFlowTests } from './roleFlow.test';
import { runRecommendationEngineTests } from './recommendationEngine.test';

async function main() {
  console.log('Running African-Dish Real Firestore Security and Integrity Test Suite...\n');
  try {
    runOrderIntegrityTests();
    console.log('\n');
    runFunctionsLogicTests();
    console.log('\n');
    runRecommendationEngineTests();
    console.log('\n');
    await runRealFirestoreRulesTests();
    console.log('\n');
    await runRoleFlowTests();
    console.log('\n🎉 ALL REAL TESTS PASSED SUCCESSFULLY (0 FAILURES)');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

main();
