import { 
  Meal, 
  Restaurant, 
  UserProfile, 
  SavedLocation, 
  ScoredRecommendation, 
  MealPeriod 
} from '../types';
import { getDistanceToRestaurant } from './locationService';

export function getCurrentMealPeriod(currentHour: number = new Date().getHours()): MealPeriod {
  if (currentHour >= 6 && currentHour < 11) return 'breakfast';
  if (currentHour >= 11 && currentHour < 16) return 'lunch';
  if (currentHour >= 16 && currentHour < 18) return 'snack';
  if (currentHour >= 18 && currentHour < 22) return 'dinner';
  return 'late_night';
}

export function getMealPeriodLabel(period: MealPeriod): string {
  switch (period) {
    case 'breakfast': return 'Breakfast';
    case 'lunch': return 'Lunch';
    case 'snack': return 'Afternoon Snack';
    case 'dinner': return 'Dinner';
    case 'late_night': return 'Late Night Bite';
  }
}

export function getGreetingForPeriod(period: MealPeriod): { greeting: string; subtitle: string } {
  switch (period) {
    case 'breakfast':
      return {
        greeting: 'Good morning',
        subtitle: 'Start your day with a warm, satisfying breakfast.'
      };
    case 'lunch':
      return {
        greeting: 'Good afternoon',
        subtitle: 'Lunch looks good today.'
      };
    case 'snack':
      return {
        greeting: 'Good afternoon',
        subtitle: 'A few quick afternoon bites nearby.'
      };
    case 'dinner':
      return {
        greeting: 'Good evening',
        subtitle: 'Dinner is sorted.'
      };
    case 'late_night':
      return {
        greeting: 'Late night cravings',
        subtitle: 'Freshly prepared meals from open kitchens near you.'
      };
  }
}

export function computeRecommendations({
  meals,
  restaurants,
  userProfile,
  currentLocation,
  activeMealPeriod,
  maxDistanceKm = 15,
  skipCount = 0,
  count = 3
}: {
  meals: Meal[];
  restaurants: Restaurant[];
  userProfile: UserProfile;
  currentLocation: SavedLocation;
  activeMealPeriod: MealPeriod;
  maxDistanceKm?: number;
  skipCount?: number;
  count?: number;
}): {
  recommendations: ScoredRecommendation[];
  totalEligible: number;
  weakMatchWarning?: string;
} {
  const restaurantMap = new Map<string, Restaurant>();
  restaurants.forEach(r => restaurantMap.set(r.id, r));

  const scoredCandidates: ScoredRecommendation[] = [];

  for (const meal of meals) {
    const restaurant = restaurantMap.get(meal.restaurantId);
    if (!restaurant) continue;

    // --- LAYER 1: Hard Constraints & Operational State ---
    // 1. City Matching
    if (restaurant.city !== currentLocation.city) {
      continue;
    }

    // 2. Real Operational State (open + accepting orders + meal available)
    const isRestaurantOpen = restaurant.isOpen && (restaurant.status === undefined || restaurant.status === 'open' || restaurant.status === 'busy');
    const isAccepting = restaurant.acceptingOrders !== false;
    
    if (!isRestaurantOpen || !isAccepting || !meal.isAvailable) {
      continue;
    }

    // 3. Safety Layer: Hard Allergen Exclusion
    const userAllergies = userProfile.safety?.allergies || [];
    let safetyViolation = false;
    let safetyWarning = '';

    for (const allergen of userAllergies) {
      if (meal.allergens?.includes(allergen)) {
        safetyViolation = true;
        safetyWarning = `Contains declared allergen: ${allergen}`;
        break;
      }
    }

    // Strict safety rejection: Unsafe meals MUST NOT enter recommendations
    if (safetyViolation && userProfile.safety?.strictSafetyEnforcement) {
      continue;
    }

    // Calculate real Haversine geospatial distance in km
    const distanceKm = getDistanceToRestaurant(currentLocation, restaurant.coordinates, restaurant.city);
    if (distanceKm > maxDistanceKm) {
      continue;
    }

    // --- LAYER 2: Explicit Preference Scoring ---
    let explicitScore = 0;

    if (userProfile.preferences?.explicitCuisines?.includes(meal.cuisine)) {
      explicitScore += 30;
    }

    if (userProfile.preferences?.favoriteMeals?.includes(meal.id)) {
      explicitScore += 25;
    }

    if (meal.spiceLevel === userProfile.preferences?.preferredSpiceLevel) {
      explicitScore += 15;
    }

    // Disliked ingredients penalty
    const hasDisliked = meal.ingredients?.some(ing => 
      userProfile.preferences?.dislikedIngredients?.some(dis => ing.toLowerCase().includes(dis.toLowerCase()))
    );
    if (hasDisliked) {
      explicitScore -= 40;
    }

    // Dietary flags
    const matchesDiet = userProfile.preferences?.dietaryFlags?.every(flag => 
      meal.dietaryFlags?.includes(flag)
    );
    if (matchesDiet && (userProfile.preferences?.dietaryFlags?.length || 0) > 0) {
      explicitScore += 20;
    }

    // --- LAYER 3: Behavioral History & Rejection Learning ---
    let behaviorScore = 0;

    const orderRecord = userProfile.behavior?.orderedMealIds?.find(o => o.mealId === meal.id);
    if (orderRecord) {
      behaviorScore += Math.min(25, orderRecord.count * 8);
    }

    const ratingRecord = userProfile.behavior?.ratedMeals?.find(r => r.mealId === meal.id);
    if (ratingRecord) {
      if (ratingRecord.rating >= 4.5) behaviorScore += 30;
      else if (ratingRecord.rating <= 2.5) behaviorScore -= 45;
    }

    // Rejection penalty (reduces rank, does NOT permanently blacklist)
    const rejectionRecord = userProfile.behavior?.rejectedMealIds?.find(r => r.mealId === meal.id);
    if (rejectionRecord) {
      behaviorScore -= 25;
    }

    // --- LAYER 4: Context & Quality Scoring ---
    let contextScore = 0;
    if (meal.mealPeriods?.includes(activeMealPeriod)) {
      contextScore += 25;
    } else {
      contextScore -= 10;
    }

    let distanceAndPriceScore = 0;
    if (distanceKm <= 2.5) distanceAndPriceScore += 20;
    else if (distanceKm <= 5.0) distanceAndPriceScore += 10;

    const restaurantQualityScore = Math.round(restaurant.rating * 5) + (restaurant.reviewCount > 100 ? 5 : 0);

    const totalScore = 
      explicitScore + 
      behaviorScore + 
      contextScore + 
      distanceAndPriceScore + 
      restaurantQualityScore;

    let lightExplanation = 'Recommended choice nearby';
    if (orderRecord && orderRecord.count > 2) {
      lightExplanation = 'One of your regular orders';
    } else if (ratingRecord && ratingRecord.rating >= 4.8) {
      lightExplanation = 'Matches your high-rated picks';
    } else if (meal.mealPeriods?.includes(activeMealPeriod) && explicitScore > 20) {
      lightExplanation = `Great for ${getMealPeriodLabel(activeMealPeriod).toLowerCase()}`;
    } else if (distanceKm <= 2.2) {
      lightExplanation = `Nearby (${distanceKm} km)`;
    } else if (userProfile.preferences?.explicitCuisines?.includes(meal.cuisine)) {
      lightExplanation = `Fresh ${meal.cuisine} recommendation`;
    }

    const price = currentLocation.currency === 'NGN' ? meal.priceNGN : meal.priceGBP;

    scoredCandidates.push({
      meal,
      restaurant,
      totalScore,
      safetyPassed: !safetyViolation,
      safetyWarning: safetyWarning || undefined,
      reasons: {
        explicitPreferenceScore: explicitScore,
        behaviorScore,
        contextScore,
        distanceAndPriceScore,
        restaurantQualityScore
      },
      lightExplanation,
      distanceKm,
      deliveryMin: restaurant.estimatedDeliveryMin,
      deliveryMax: restaurant.estimatedDeliveryMax,
      price,
      currency: currentLocation.currency
    });
  }

  // Sort descending by total score
  scoredCandidates.sort((a, b) => b.totalScore - a.totalScore);
  const totalEligible = scoredCandidates.length;

  if (totalEligible === 0) {
    return {
      recommendations: [],
      totalEligible: 0,
      weakMatchWarning: `No open restaurants found near ${currentLocation.label}. Try changing your location or checking back during opening hours.`
    };
  }

  // --- LAYER 5: Diversity-Enforced Top-3 Selection ---
  // Apply controlled diversity across category, cuisine, and meal type
  const offset = skipCount % Math.max(1, totalEligible);
  const rotatedCandidates = [
    ...scoredCandidates.slice(offset),
    ...scoredCandidates.slice(0, offset)
  ];

  const selected: ScoredRecommendation[] = [];
  const usedCategories = new Set<string>();
  const usedCuisines = new Set<string>();

  // Pass 1: Select items with distinct category or cuisine
  for (const candidate of rotatedCandidates) {
    if (selected.length >= count) break;
    const cat = candidate.meal.category;
    const cuis = candidate.meal.cuisine;

    if (!usedCategories.has(cat) || !usedCuisines.has(cuis) || selected.length === 0) {
      selected.push(candidate);
      usedCategories.add(cat);
      usedCuisines.add(cuis);
    }
  }

  // Pass 2: Fill remaining if needed
  if (selected.length < count) {
    for (const candidate of rotatedCandidates) {
      if (selected.length >= count) break;
      if (!selected.some(s => s.meal.id === candidate.meal.id)) {
        selected.push(candidate);
      }
    }
  }

  let weakMatchWarning: string | undefined;
  if (totalEligible < 3) {
    weakMatchWarning = `Only ${totalEligible} open option(s) available right now.`;
  }

  return {
    recommendations: selected,
    totalEligible,
    weakMatchWarning
  };
}
