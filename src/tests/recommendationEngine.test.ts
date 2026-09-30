/**
 * Unit tests for the recommendation engine (pure logic, no Firestore).
 */
import { computeRecommendations, priceSensitivityScore } from '../services/recommendationEngine';
import { getDistanceToRestaurant } from '../services/locationService';
import type { Meal, Restaurant, SavedLocation, UserProfile, Allergen } from '../types';

let passed = 0;
function check(name: string, cond: boolean, detail?: string) {
  if (!cond) throw new Error(`FAIL: [recommendation] ${name}${detail ? ` -- ${detail}` : ''}`);
  passed++;
  console.log(`✅ PASS: [recommendation] ${name}`);
}

const restaurant = (id: string, over: Partial<Restaurant> = {}): Restaurant => ({
  id, name: `R ${id}`, tagline: '', description: '', city: 'Port Harcourt', address: '', rating: 4.5, reviewCount: 200,
  image: '', logo: '', isOpen: true, status: 'open', acceptingOrders: true, orderAcceptanceMode: 'manual', operatingHours: '',
  fulfillmentOptions: ['delivery'], estimatedDeliveryMin: 20, estimatedDeliveryMax: 35, deliveryFeeNGN: 800, deliveryFeeGBP: 2.5,
  minimumOrderNGN: 0, minimumOrderGBP: 0, verified: true, cuisines: ['Nigerian'],
  coordinates: { lat: 4.8156, lng: 7.0498 }, ...over,
});

const meal = (id: string, over: Partial<Meal> = {}): Meal => ({
  id, name: `Meal ${id}`, description: '', priceNGN: 3000, priceGBP: 10, rating: 4.5, reviewCount: 10, prepTimeMinutes: 20, image: '',
  restaurantId: 'r1', restaurantName: 'R r1', restaurantCity: 'Port Harcourt', region: 'West African', cuisine: 'Nigerian',
  category: 'Rice & Grains', ingredients: [], allergens: [], spiceLevel: 'medium', dietaryFlags: [], mealPeriods: ['lunch'],
  isAvailable: true, customizationOptions: [], ...over,
});

const location: SavedLocation = {
  id: 'loc', label: 'Home', address: 'x', city: 'Port Harcourt', postcodeOrArea: '', currency: 'NGN', coordinates: { lat: 4.8156, lng: 7.0498 },
};

const user = (over: { allergies?: Allergen[]; strict?: boolean; diet?: UserProfile['preferences']['dietaryFlags']; price?: 'budget' | 'standard' | 'premium'; rejected?: string[] } = {}): UserProfile => ({
  id: 'u', name: 'U', email: '', phone: '', role: 'customer', theme: 'light', currentLocationId: 'loc', savedLocations: [location],
  preferences: { explicitCuisines: [], preferredSpiceLevel: 'medium', dietaryFlags: over.diet ?? [], dislikedIngredients: [], favoriteMeals: [], priceSensitivity: over.price ?? 'standard' },
  safety: { allergies: over.allergies ?? [], strictSafetyEnforcement: over.strict ?? true, notes: '' },
  behavior: { orderedMealIds: [], ratedMeals: [], rememberedCustomizations: {},
    rejectedMealIds: (over.rejected ?? []).map(mealId => ({ mealId, reason: 'Other' as const, timestamp: '2026-01-01T00:00:00Z' })) },
});

const run = (u: UserProfile, meals: Meal[], extra: { skipCount?: number; count?: number; restaurants?: Restaurant[]; loc?: SavedLocation } = {}) =>
  computeRecommendations({
    meals, restaurants: extra.restaurants ?? [restaurant('r1')], userProfile: u, currentLocation: extra.loc ?? location,
    activeMealPeriod: 'lunch', maxDistanceKm: 15, skipCount: extra.skipCount ?? 0, count: extra.count ?? 3,
  });
const ids = (r: ReturnType<typeof run>) => r.recommendations.map(x => x.meal.id);

export function runRecommendationEngineTests(): number {
  console.log('====================================================');
  console.log('STARTING RECOMMENDATION ENGINE UNIT TESTS');
  console.log('====================================================');

  // --- allergens: always excluded ---
  const peanut = meal('peanut', { allergens: ['peanuts'] });
  const safe = meal('safe');
  check('allergen meal excluded when strict enforcement ON', !ids(run(user({ allergies: ['peanuts'], strict: true }), [peanut, safe])).includes('peanut'));
  check('allergen meal excluded EVEN when strict enforcement OFF', !ids(run(user({ allergies: ['peanuts'], strict: false }), [peanut, safe])).includes('peanut'));
  check('safe meal still recommended for allergic user', ids(run(user({ allergies: ['peanuts'], strict: false }), [peanut, safe])).includes('safe'));
  const multi = meal('multi', { allergens: ['dairy', 'shellfish'] });
  check('any one matching allergen among several excludes the meal', !ids(run(user({ allergies: ['shellfish'], strict: false }), [multi, safe])).includes('multi'));
  check('meal with a different allergen is not excluded', ids(run(user({ allergies: ['peanuts'], strict: false }), [multi, safe])).includes('multi'));
  check('no candidate ever carries an allergen the user declared',
    run(user({ allergies: ['peanuts', 'dairy'], strict: false }), [peanut, multi, safe, meal('m4')])
      .recommendations.every(r => !r.meal.allergens.some(a => a === 'peanuts' || a === 'dairy')));
  check('all meals allergenic => no recommendations (never falls back to unsafe)', run(user({ allergies: ['peanuts'], strict: false }), [peanut]).recommendations.length === 0);

  // --- dietary mismatch: warning, not exclusion ---
  const nonVegan = meal('nv', { dietaryFlags: [] });
  const vegan = meal('vg', { dietaryFlags: ['vegan'] });
  const dietRun = run(user({ diet: ['vegan'] }), [nonVegan, vegan]);
  check('dietary preference mismatch is NOT excluded', ids(dietRun).includes('nv') && ids(dietRun).includes('vg'));
  const nvRec = dietRun.recommendations.find(r => r.meal.id === 'nv')!;
  check('dietary mismatch carries a warning', typeof nvRec.safetyWarning === 'string' && nvRec.safetyWarning.includes('vegan'));
  check('matching meal has no warning and ranks above mismatch', dietRun.recommendations.find(r => r.meal.id === 'vg')!.safetyWarning === undefined && ids(dietRun)[0] === 'vg');

  // --- price sensitivity ---
  check('priceSensitivityScore: standard is neutral', priceSensitivityScore('standard', 5000, 3000) === 0);
  check('priceSensitivityScore: budget rewards cheap', priceSensitivityScore('budget', 2000, 3000) > 0);
  check('priceSensitivityScore: budget penalises expensive', priceSensitivityScore('budget', 5000, 3000) < 0);
  check('priceSensitivityScore: premium rewards expensive', priceSensitivityScore('premium', 5000, 3000) > 0);
  check('priceSensitivityScore: premium penalises cheap', priceSensitivityScore('premium', 1500, 3000) < 0);
  const cheap = meal('cheap', { priceNGN: 1500 });
  const mid = meal('mid', { priceNGN: 3000 });
  const pricey = meal('pricey', { priceNGN: 6000 });
  check('budget user: cheapest meal ranks first', ids(run(user({ price: 'budget' }), [pricey, mid, cheap]))[0] === 'cheap');
  check('premium user: priciest meal ranks first', ids(run(user({ price: 'premium' }), [cheap, mid, pricey]))[0] === 'pricey');

  // --- skipCount excludes (does not rotate) ---
  const many = Array.from({ length: 8 }, (_, i) => meal(`m${i}`, { rating: 4, priceNGN: 3000 + i * 10, category: (['Rice & Grains', 'Soups & Swallows', 'Grills & Suya', 'Street Food'] as const)[i % 4] }));
  const page0 = ids(run(user(), many, { skipCount: 0 }));
  const page1 = ids(run(user(), many, { skipCount: 3 }));
  check('skipCount=0 returns 3 results', page0.length === 3);
  check('skipCount=3 shows none of the previously shown top 3', page1.every(id => !page0.includes(id)), `${page0} vs ${page1}`);
  const full = run(user(), many, { skipCount: 0, count: 8 }).recommendations.map(r => r.meal.id);
  check('skip removes exactly the top-ranked entries (no rotation back to the top)', !page1.includes(full[0]) && !page1.includes(full[1]) && !page1.includes(full[2]));
  const exhausted = run(user(), many, { skipCount: 99 });
  check('skipping past everything restarts from the best match with an explicit warning', exhausted.recommendations.length > 0 && typeof exhausted.weakMatchWarning === 'string' && exhausted.weakMatchWarning.includes('seen every option'));

  // --- rejected meals excluded ---
  const rej = run(user({ rejected: ['m0', 'm1'] }), many);
  check('rejected meals are never recommended', !ids(rej).includes('m0') && !ids(rej).includes('m1'));
  check('totalEligible excludes rejected meals', run(user({ rejected: ['m0', 'm1'] }), many).totalEligible === 6);

  // --- location: no silent Port Harcourt fallback ---
  const londonLoc: SavedLocation = { ...location, city: 'London', currency: 'GBP', coordinates: undefined };
  const noCoordsCity = { ...location, city: 'Atlantis' as never, coordinates: undefined };
  check('getDistanceToRestaurant returns null (not a PH default) when the location is unknown', getDistanceToRestaurant(noCoordsCity, undefined, 'Atlantis') === null);
  check('explicit fallbackCity option is honoured', getDistanceToRestaurant(noCoordsCity, undefined, 'Atlantis', { fallbackCity: 'Port Harcourt' }) === 0);
  check('known cities resolve from the city table', getDistanceToRestaurant(londonLoc, undefined, 'London') === 0);
  const unknownCityRest = restaurant('rx', { city: 'Port Harcourt', coordinates: undefined });
  check('restaurant without coordinates uses its declared city (not a global default)', run(user(), [meal('mx', { restaurantId: 'rx' })], { restaurants: [unknownCityRest] }).recommendations.length === 1);
  const badLoc = { ...location, coordinates: undefined, city: 'Atlantis' as never };
  check('user location that cannot be resolved yields no recommendations', run(user(), [safe], { loc: badLoc, restaurants: [restaurant('r1', { city: 'Atlantis' as never, coordinates: undefined })] }).recommendations.length === 0);

  // --- operational state ---
  check('closed restaurants excluded', run(user(), [safe], { restaurants: [restaurant('r1', { isOpen: false })] }).recommendations.length === 0);
  check('unavailable meals excluded', run(user(), [meal('off', { isAvailable: false })]).recommendations.length === 0);

  console.log(`RECOMMENDATION ENGINE TESTS PASSED: ${passed}`);
  return passed;
}
