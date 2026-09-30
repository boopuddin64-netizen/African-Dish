/**
 * Unit tests for the pure logic used by Cloud Functions (server-side pricing + Paystack signature verification).
 * These modules have no firebase imports so they run without the Functions runtime.
 */
import { computeOrderPricing, PricingError, MealDoc, RestaurantDoc } from '../../functions/src/pricing';
import { verifyPaystackSignature, signPaystackPayload } from '../../functions/src/paystack';

let passed = 0;
function check(name: string, cond: boolean) {
  if (!cond) throw new Error(`FAIL: ${name}`);
  passed++;
  console.log(`✅ PASS: [functions] ${name}`);
}
function throws(name: string, fn: () => unknown, code?: string) {
  try {
    fn();
  } catch (e) {
    check(name, e instanceof PricingError && (!code || e.code === code));
    return;
  }
  throw new Error(`FAIL: ${name} (did not throw)`);
}

export function runFunctionsLogicTests(): number {
  console.log('====================================================');
  console.log('STARTING CLOUD FUNCTIONS LOGIC TESTS (pricing + Paystack signature)');
  console.log('====================================================');

  const restaurant: RestaurantDoc = {
    isOpen: true, acceptingOrders: true, verified: true,
    deliveryFeeNGN: 1000, deliveryFeeGBP: 3.5, minimumOrderNGN: 2000, minimumOrderGBP: 5, fulfillmentOptions: ['delivery', 'pickup'],
  };
  const meals: Record<string, MealDoc> = {
    m1: { restaurantId: 'r1', name: 'Jollof', priceNGN: 3500, priceGBP: 12, isAvailable: true,
      customizationOptions: [{ id: 'plantain', name: 'Plantain', priceDelta: 500 }] },
    m_other: { restaurantId: 'r2', name: 'Other', priceNGN: 100, priceGBP: 1, isAvailable: true },
    m_off: { restaurantId: 'r1', name: 'Sold out', priceNGN: 100, priceGBP: 1, isAvailable: false },
  };
  const base = { meals, restaurantId: 'r1', restaurant, currency: 'NGN' as const, fulfillmentMethod: 'delivery' as const };

  const p = computeOrderPricing({ ...base, lines: [{ mealId: 'm1', quantity: 2, customizationIds: ['plantain'] }] });
  check('subtotal = (3500+500)*2 = 8000', p.subtotal === 8000);
  check('service fee 5% = 400', p.serviceFee === 400);
  check('delivery fee comes from restaurant doc (1000)', p.deliveryFee === 1000);
  check('total = 8000+1000+400 = 9400', p.total === 9400);

  const pk = computeOrderPricing({ ...base, fulfillmentMethod: 'pickup', lines: [{ mealId: 'm1', quantity: 1 }] });
  check('pickup has no delivery fee', pk.deliveryFee === 0 && pk.total === 3500 + 175);

  throws('unknown meal rejected', () => computeOrderPricing({ ...base, lines: [{ mealId: 'nope', quantity: 1 }] }), 'not-found');
  throws('meal from another restaurant rejected', () => computeOrderPricing({ ...base, lines: [{ mealId: 'm_other', quantity: 1 }] }), 'invalid-argument');
  throws('unavailable meal rejected', () => computeOrderPricing({ ...base, lines: [{ mealId: 'm_off', quantity: 1 }] }), 'failed-precondition');
  throws('unknown customization rejected', () => computeOrderPricing({ ...base, lines: [{ mealId: 'm1', quantity: 1, customizationIds: ['free_gold'] }] }), 'invalid-argument');
  throws('zero/negative/fractional quantity rejected', () => computeOrderPricing({ ...base, lines: [{ mealId: 'm1', quantity: -1 }] }), 'invalid-argument');
  throws('fractional quantity rejected', () => computeOrderPricing({ ...base, lines: [{ mealId: 'm1', quantity: 1.5 }] }), 'invalid-argument');
  throws('empty order rejected', () => computeOrderPricing({ ...base, lines: [] }), 'invalid-argument');
  throws('below minimum order rejected', () => computeOrderPricing({ ...base, meals: { m1: { ...meals.m1, priceNGN: 100, customizationOptions: [] } }, lines: [{ mealId: 'm1', quantity: 1 }] }), 'failed-precondition');
  throws('unverified restaurant rejected', () => computeOrderPricing({ ...base, restaurant: { ...restaurant, verified: false }, lines: [{ mealId: 'm1', quantity: 1 }] }), 'failed-precondition');
  throws('closed restaurant rejected', () => computeOrderPricing({ ...base, restaurant: { ...restaurant, isOpen: false }, lines: [{ mealId: 'm1', quantity: 1 }] }), 'failed-precondition');

  const body = JSON.stringify({ event: 'charge.success', data: { reference: 'TX_1', amount: 940000 } });
  const sig = signPaystackPayload(body, 'sk_test_secret');
  check('valid Paystack signature accepted', verifyPaystackSignature(body, sig, 'sk_test_secret'));
  check('wrong secret rejected', !verifyPaystackSignature(body, sig, 'sk_test_other'));
  check('tampered body rejected', !verifyPaystackSignature(body.replace('940000', '1'), sig, 'sk_test_secret'));
  check('missing signature rejected', !verifyPaystackSignature(body, undefined, 'sk_test_secret'));
  check('missing secret rejected', !verifyPaystackSignature(body, sig, undefined));
  check('garbage signature rejected', !verifyPaystackSignature(body, 'abc', 'sk_test_secret'));

  console.log(`FUNCTIONS LOGIC TESTS PASSED: ${passed}`);
  return passed;
}
