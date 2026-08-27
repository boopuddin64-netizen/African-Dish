export type Currency = 'NGN' | 'GBP';

export type UserRole = 'customer' | 'restaurant_staff' | 'courier';

export type ThemeMode = 'light' | 'dark';

export type SpiceLevel = 'none' | 'mild' | 'medium' | 'hot' | 'extra_hot';

export type MealPeriod = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'late_night';

export type AfricanRegion = 'West African' | 'East African' | 'Central African' | 'Southern African' | 'North African' | 'Afro-Fusion';

export type CountryCuisine = 
  | 'Nigerian' 
  | 'Ghanaian' 
  | 'Senegalese' 
  | 'Sierra Leonean' 
  | 'Ethiopian' 
  | 'Kenyan' 
  | 'Somali' 
  | 'South African' 
  | 'Cameroonian'
  | 'Pan-African'
  | 'Afro-Fusion';

export type DietaryFlag = 
  | 'halal' 
  | 'vegetarian' 
  | 'vegan' 
  | 'pescatarian' 
  | 'gluten_free' 
  | 'nut_free' 
  | 'dairy_free';

export type Allergen = 
  | 'peanuts' 
  | 'tree_nuts' 
  | 'shellfish' 
  | 'fish' 
  | 'gluten' 
  | 'dairy' 
  | 'soy' 
  | 'eggs' 
  | 'sesame';

export interface CustomizationOption {
  id: string;
  name: string;
  priceDelta: number; // in current currency
  isDefault?: boolean;
  category: 'protein' | 'side' | 'spice' | 'ingredient_removal' | 'extra';
}

export interface NutritionMacros {
  calories: number; // kcal
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
}

export interface CourierMessage {
  id: string;
  sender: 'customer' | 'courier' | 'system';
  text: string;
  timestamp: string;
}

export interface Meal {
  id: string;
  name: string;
  nativeName?: string;
  description: string;
  priceNGN: number;
  priceGBP: number;
  rating: number; // 1-5
  reviewCount: number;
  prepTimeMinutes: number;
  image: string;
  restaurantId: string;
  restaurantName: string;
  restaurantCity: 'Port Harcourt' | 'London' | 'Manchester' | 'Birmingham';
  region: AfricanRegion;
  cuisine: CountryCuisine;
  category: 'Rice & Grains' | 'Soups & Swallows' | 'Grills & Suya' | 'Street Food' | 'Stews & Sauces' | 'Breakfast & Snacks' | 'Platters' | 'Small Plates';
  ingredients: string[];
  allergens: Allergen[];
  spiceLevel: SpiceLevel;
  dietaryFlags: DietaryFlag[];
  mealPeriods: MealPeriod[];
  isAvailable: boolean;
  isDemo?: boolean;
  stockCount?: number; // Live available portions in kitchen
  lowStockThreshold?: number; // Warning trigger count (e.g. 5)
  customizationOptions: CustomizationOption[];
  isPopular?: boolean;
  distanceKmDefault?: number;
  nutrition?: NutritionMacros;
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  city: 'Port Harcourt' | 'London' | 'Manchester' | 'Birmingham';
  address: string;
  phone?: string;
  rating: number;
  reviewCount: number;
  image: string;
  logo: string;
  isOpen: boolean;
  status?: 'open' | 'closed' | 'temporarily_unavailable' | 'busy';
  acceptingOrders?: boolean;
  isDemo?: boolean;
  isBusyMode?: boolean; // When active, adds prep buffer time to orders
  prepBufferMinutes?: number; // e.g. +15 mins during rush hour
  orderAcceptanceMode: 'manual' | 'auto';
  operatingHours: string;
  hygieneRating?: string; // e.g. "5/5 Verified Food Safety Standards"
  allergenPledge?: string;
  fulfillmentOptions: ('delivery' | 'pickup')[];
  estimatedDeliveryMin: number;
  estimatedDeliveryMax: number;
  deliveryFeeNGN: number;
  deliveryFeeGBP: number;
  minimumOrderNGN: number;
  minimumOrderGBP: number;
  verified: boolean;
  cuisines: CountryCuisine[];
  coordinates?: { lat: number; lng: number };
}

export interface SavedLocation {
  id: string;
  label: string; // 'Home' | 'Office' | 'Mum\'s place' | 'Gym' | etc.
  address: string;
  city: 'Port Harcourt' | 'London' | 'Manchester' | 'Birmingham';
  postcodeOrArea: string;
  isDefault?: boolean;
  distanceMultiplier?: number;
  currency: Currency;
  coordinates?: { lat: number; lng: number };
}

export interface UserSafetyProfile {
  allergies: Allergen[];
  strictSafetyEnforcement: boolean;
  notes: string;
}

export interface UserPreferences {
  explicitCuisines: CountryCuisine[];
  preferredSpiceLevel: SpiceLevel;
  dietaryFlags: DietaryFlag[];
  dislikedIngredients: string[];
  favoriteMeals: string[]; // meal IDs
  priceSensitivity: 'budget' | 'standard' | 'premium';
}

export interface BehavioralHistory {
  orderedMealIds: { mealId: string; count: number; lastOrderedAt: string }[];
  rejectedMealIds: { mealId: string; reason: string; timestamp: string }[];
  ratedMeals: { mealId: string; rating: number; feedback: string[]; timestamp: string }[];
  rememberedCustomizations: Record<string, string[]>; // mealId -> list of customization option IDs
}

export interface KitchenStaffProfile {
  staffId: string;
  staffName: string;
  jobTitle: string;
  station: string;
  assignedRestaurantId: string;
  shiftHours: string;
  hygieneCertNumber: string;
  hygieneRating: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  certifications: string[];
  safetyChecklistCompleted: boolean;
  dailyTemperatureLogged: boolean;
}

export interface CourierProfile {
  courierId: string;
  riderName: string;
  phone: string;
  vehicleType: 'motorcycle' | 'bicycle' | 'e_bike' | 'car';
  vehicleModel: string;
  plateNumber: string;
  licenseNumber: string;
  activeStatus: 'active' | 'on_break' | 'offline';
  rating: number;
  totalDeliveries: number;
  onTimeRate: number;
  todayEarningsNGN: number;
  todayEarningsGBP: number;
  activeZone: string;
  payoutBank: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  equipmentVerified: {
    insulatedThermalBag: boolean;
    protectiveHelmet: boolean;
    phoneMountReady: boolean;
    tamperSealKit: boolean;
  };
  preferredNavApp: 'google_maps' | 'waze' | 'apple_maps';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  theme: ThemeMode;
  currentLocationId: string;
  savedLocations: SavedLocation[];
  preferences: UserPreferences;
  safety: UserSafetyProfile;
  behavior: BehavioralHistory;
  kitchenStaff?: KitchenStaffProfile;
  courier?: CourierProfile;
}

export interface ScoredRecommendation {
  meal: Meal;
  restaurant: Restaurant;
  totalScore: number;
  safetyPassed: boolean;
  safetyWarning?: string;
  reasons: {
    explicitPreferenceScore: number;
    behaviorScore: number;
    contextScore: number;
    distanceAndPriceScore: number;
    restaurantQualityScore: number;
  };
  lightExplanation: string;
  distanceKm: number;
  deliveryMin: number;
  deliveryMax: number;
  price: number;
  currency: Currency;
}

export interface CartItem {
  id: string;
  meal: Meal;
  restaurant: Restaurant;
  quantity: number;
  selectedCustomizations: CustomizationOption[];
  itemPrice: number;
  specialInstructions?: string;
}

export type OrderStatus = 
  | 'cart' 
  | 'checkout' 
  | 'payment_pending' 
  | 'paid' 
  | 'restaurant_pending' 
  | 'accepted' 
  | 'preparing' 
  | 'ready' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'payment_failed' 
  | 'rejected' 
  | 'cancelled' 
  | 'refunded'
  | 'confirmed' // legacy support
  | 'on_the_way'; // legacy support

export type RejectionReason = 
  | 'Too expensive' 
  | 'Too far' 
  | 'Not hungry for this' 
  | 'Don\'t like this' 
  | 'Had it recently' 
  | 'Too spicy' 
  | 'Other';

export type RecommendationEventType = 
  | 'impression' 
  | 'meal_opened'
  | 'selected'
  | 'clicked' 
  | 'rejected' 
  | 'added_to_cart'
  | 'meal_added' 
  | 'ordered'
  | 'meal_ordered' 
  | 'rated'
  | 'meal_rated';

export interface RecommendationEvent {
  id?: string;
  userId: string;
  mealId?: string;
  restaurantId?: string;
  eventType: RecommendationEventType;
  rejectionReason?: RejectionReason;
  position?: number;
  timestamp: string;
  locationContext?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  restaurantId: string;
  restaurantName: string;
  fulfillmentMethod: 'delivery' | 'pickup';
  deliveryAddress: SavedLocation;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  currency: Currency;
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentReference?: string;
  paymentMethod?: string;
  createdAt: string;
  estimatedDeliveryTime: string;
  tapCount?: number;
  driverName?: string;
  driverPhone?: string;
  driverVehicle?: string;
  courierMessages?: CourierMessage[];
  ratingSubmitted?: {
    foodRating: number;
    restaurantRating: number;
    deliveryRating: number;
    feedbackTags: string[];
    timestamp: string;
  };
}

export interface AnalyticsMetric {
  totalImpressions: number;
  recommendationClicks: number;
  rejectionsCount: number;
  ordersCompleted: number;
  personalizedOrderRate: number; // percentage of orders from Top 3 recommendations
  averageTapsPerOrder: number;
}
