import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Meal, 
  Restaurant, 
  SavedLocation, 
  UserProfile, 
  KitchenStaffProfile,
  CourierProfile,
  ScoredRecommendation, 
  CartItem, 
  Order, 
  MealPeriod, 
  CustomizationOption, 
  Allergen, 
  CountryCuisine, 
  SpiceLevel, 
  DietaryFlag,
  UserRole,
  OrderStatus,
  ThemeMode,
  CourierMessage,
  RejectionReason
} from '../types';
import { 
  INITIAL_USER_PROFILE,
  RESTAURANTS as INITIAL_RESTAURANTS,
  MEALS as INITIAL_MEALS
} from '../data/mockData';
import { 
  computeRecommendations, 
  getCurrentMealPeriod 
} from '../services/recommendationEngine';
import { 
  subscribeToAuthChanges, 
  updateUserProfile as updateFirebaseUserProfile,
  DEFAULT_USER_PROFILE,
  loginWithEmail as authLoginWithEmail,
  signUpWithEmail as authSignUpWithEmail,
  loginWithGoogle as authLoginWithGoogle,
  logoutUser as authLogoutUser
} from '../services/authService';
import { 
  seedFirestoreInitialData, 
  subscribeToRestaurants, 
  updateRestaurant 
} from '../services/restaurantService';
import { 
  subscribeToMeals, 
  updateMeal 
} from '../services/mealService';
import { 
  subscribeToOrders, 
  createOrderInFirestore, 
  updateOrderStatusInFirestore 
} from '../services/orderService';
import { logRecommendationEvent } from '../services/analyticsService';
import { MAX_SAVED_LOCATIONS } from '../services/locationService';

interface AppContextType {
  // Navigation & Views
  currentView: 'home' | 'discovery' | 'merchant' | 'courier' | 'profile' | 'prd';
  setCurrentView: (view: 'home' | 'discovery' | 'merchant' | 'courier' | 'profile' | 'prd') => void;
  
  // Locations
  savedLocations: SavedLocation[];
  currentLocation: SavedLocation;
  selectLocation: (locationId: string) => void;
  addSavedLocation: (location: Omit<SavedLocation, 'id'>) => boolean;
  deleteSavedLocation: (locationId: string) => void;
  setDefaultLocation: (locationId: string) => void;
  searchRadiusKm: number;
  setSearchRadiusKm: (km: number) => void;

  // Time & Meal Period
  mealPeriod: MealPeriod;
  setMealPeriod: (period: MealPeriod) => void;
  isSimulatedTime: boolean;
  setIsSimulatedTime: (val: boolean) => void;

  // Recommendations
  recommendations: ScoredRecommendation[];
  skipCount: number;
  showNextRecommendations: () => void;
  rejectMeal: (mealId: string, reason: RejectionReason) => void;
  weakMatchWarning?: string;
  totalEligibleRecommendations: number;

  // Profile & Preferences & Roles
  userProfile: UserProfile;
  setUserRole: (role: UserRole, options?: { navigate?: boolean }) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateKitchenStaffProfile: (profile: Partial<KitchenStaffProfile>) => void;
  updateCourierProfile: (profile: Partial<CourierProfile>) => void;
  updatePreferences: (newPrefs: Partial<UserProfile['preferences']>) => void;
  toggleAllergen: (allergen: Allergen) => void;
  toggleCuisine: (cuisine: CountryCuisine) => void;
  setSpicePreference: (spice: SpiceLevel) => void;
  addDislikedIngredient: (ingredient: string) => void;
  removeDislikedIngredient: (ingredient: string) => void;
  toggleDietaryFlag: (flag: DietaryFlag) => void;
  updateSafetyNotes: (notes: string) => void;
  resetPreferencesToDefault: () => void;
  sendCourierMessage: (orderId: string, text: string) => void;

  // Modals & UI States
  selectedMeal: Meal | null;
  setSelectedMeal: (meal: Meal | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isPreferenceModalOpen: boolean;
  setIsPreferenceModalOpen: (open: boolean) => void;
  isSafetyModalOpen: boolean;
  setIsSafetyModalOpen: (open: boolean) => void;
  isRestaurantDetailsModalOpen: boolean;
  selectedRestaurantForDetails: Restaurant | null;
  openRestaurantDetails: (restaurant: Restaurant) => void;
  openRestaurantDetailsModal: (restaurantOrId: Restaurant | string) => void;
  closeRestaurantDetails: () => void;
  closeRestaurantDetailsModal: () => void;

  // Cart
  cartItems: CartItem[];
  addToCart: (meal: Meal, customizations?: CustomizationOption[], instructions?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartServiceFee: number;
  cartTotal: number;

  // Orders & Active Delivery
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  placeOrder: (fulfillmentMethod: 'delivery' | 'pickup') => Promise<Order>;
  submitOrderRating: (orderId: string, foodRating: number, restaurantRating: number, deliveryRating: number, feedbackTags: string[]) => void;
  cancelActiveOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Merchant Portal State & Stock Management
  activeMerchantRestaurantId: string;
  setActiveMerchantRestaurantId: (id: string) => void;
  merchantRestaurants: Restaurant[];
  toggleMealAvailability: (mealId: string) => void;
  updateMealStock: (mealId: string, countOrDelta: number, isAbsolute?: boolean) => void;
  batchStockUpMeals: (restaurantId: string, defaultCount?: number) => void;
  toggleRestaurantOpenStatus: (restaurantId: string) => void;
  toggleOrderAcceptanceMode: (restaurantId: string) => void;
  updateRestaurantDetails: (restaurantId: string, updates: Partial<Restaurant>) => void;

  // Tap Efficiency Counter (≤21 taps UX target)
  tapCount: number;
  recordTap: (actionDescription?: string) => void;
  resetTapCount: () => void;
  recentTapLogs: string[];

  // Auth Functions
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;

  // Helpers
  allMeals: Meal[];
  allRestaurants: Restaurant[];
  isLoadingData: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<'home' | 'discovery' | 'merchant' | 'courier' | 'profile' | 'prd'>('home');

  // Loading state
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Time & Meal Period
  const [mealPeriod, setMealPeriod] = useState<MealPeriod>(() => getCurrentMealPeriod());
  const [isSimulatedTime, setIsSimulatedTime] = useState<boolean>(false);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);

  // Restaurants & Meals state (Real-time from Firestore)
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [allMeals, setAllMeals] = useState<Meal[]>(INITIAL_MEALS);

  // Search Radius
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(10);

  // Recommendation skip
  const [skipCount, setSkipCount] = useState<number>(0);

  // Modals
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isPreferenceModalOpen, setIsPreferenceModalOpen] = useState<boolean>(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  const [isRestaurantDetailsModalOpen, setIsRestaurantDetailsModalOpen] = useState<boolean>(false);
  const [selectedRestaurantForDetails, setSelectedRestaurantForDetails] = useState<Restaurant | null>(null);

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Merchant portal
  const [activeMerchantRestaurantId, setActiveMerchantRestaurantId] = useState<string>('rest_ph_1');

  // Tap tracking
  const [tapCount, setTapCount] = useState<number>(1);
  const [recentTapLogs, setRecentTapLogs] = useState<string[]>(['Opened App']);

  // Theme
  const [theme, setTheme] = useState<ThemeMode>(() => userProfile.theme || 'light');

  // Apply theme class to document root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // --- Seed Firestore & Subscribe Realtime ---
  useEffect(() => {
    let unsubscribeAuth: () => void;
    let unsubscribeRest: () => void;
    let unsubscribeMeals: () => void;
    let unsubscribeOrders: () => void;

    async function initFirebaseSync() {
      setIsLoadingData(true);
      await seedFirestoreInitialData();

      // Auth Sync
      unsubscribeAuth = subscribeToAuthChanges((profile) => {
        if (profile) {
          setUserProfile(profile);
          if (profile.theme) setTheme(profile.theme);
        } else {
          setUserProfile(INITIAL_USER_PROFILE);
        }
      });

      // Restaurants Sync
      unsubscribeRest = subscribeToRestaurants((rests) => {
        if (rests.length > 0) setAllRestaurants(rests);
      });

      // Meals Sync
      unsubscribeMeals = subscribeToMeals((mList) => {
        if (mList.length > 0) setAllMeals(mList);
      });

      setIsLoadingData(false);
    }

    initFirebaseSync();

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeRest) unsubscribeRest();
      if (unsubscribeMeals) unsubscribeMeals();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, []);

  // Sync Orders for current active user
  useEffect(() => {
    if (!userProfile?.id || userProfile.id === 'guest_demo_user' || userProfile.id.startsWith('guest_')) {
      return;
    }
    const unsub = subscribeToOrders(
      userProfile.id,
      userProfile.role,
      activeMerchantRestaurantId,
      (orderList) => {
        setOrders(orderList);
        if (orderList.length > 0) {
          const currentActive = orderList.find(o => 
            o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'rejected'
          );
          if (currentActive) setActiveOrder(currentActive);
        }
      }
    );
    return () => unsub();
  }, [userProfile?.id, userProfile?.role, activeMerchantRestaurantId]);

  // Tap logger helper
  const recordTap = (actionDescription?: string) => {
    setTapCount(prev => prev + 1);
    if (actionDescription) {
      setRecentTapLogs(prev => [actionDescription, ...prev.slice(0, 14)]);
    }
  };

  const resetTapCount = () => {
    setTapCount(1);
    setRecentTapLogs(['Reset Tap Count']);
  };

  // Theme toggle
  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      setUserProfile(u => ({ ...u, theme: next }));
      if (userProfile.id && userProfile.id !== 'guest_user') {
        updateFirebaseUserProfile(userProfile.id, { theme: next });
      }
      return next;
    });
    recordTap('Toggled dark/light theme');
  };

  // Role Switcher
  const setUserRole = (newRole: UserRole, options?: { navigate?: boolean }) => {
    recordTap(`Switched user role to ${newRole}`);
    setUserProfile(prev => {
      const updated = { ...prev, role: newRole };
      if (userProfile.id && userProfile.id !== 'guest_user') {
        updateFirebaseUserProfile(userProfile.id, { role: newRole });
      }
      return updated;
    });
    if (options?.navigate !== false) {
      if (newRole === 'restaurant_staff') {
        setCurrentView('merchant');
      } else if (newRole === 'courier') {
        setCurrentView('courier');
      } else if (newRole === 'customer') {
        if (currentView === 'merchant' || currentView === 'courier') {
          setCurrentView('home');
        }
      }
    }
  };

  // Locations management
  const savedLocations = userProfile.savedLocations || [];
  const currentLocation = useMemo(() => {
    return savedLocations.find(l => l.id === userProfile.currentLocationId) || 
      savedLocations.find(l => l.isDefault) || 
      savedLocations[0];
  }, [savedLocations, userProfile.currentLocationId]);

  const selectLocation = (locationId: string) => {
    recordTap('Selected active delivery location');
    setUserProfile(prev => {
      const updated = { ...prev, currentLocationId: locationId };
      if (prev.id && prev.id !== 'guest_user') {
        updateFirebaseUserProfile(prev.id, { currentLocationId: locationId });
      }
      return updated;
    });
  };

  const addSavedLocation = (locationData: Omit<SavedLocation, 'id'>): boolean => {
    if (savedLocations.length >= MAX_SAVED_LOCATIONS) {
      alert(`Maximum limit of ${MAX_SAVED_LOCATIONS} saved locations reached. Delete an existing location first.`);
      return false;
    }
    recordTap('Added new saved location');
    const newLoc: SavedLocation = {
      ...locationData,
      id: `loc_${Date.now()}`
    };
    const updatedLocs = [...savedLocations, newLoc];
    setUserProfile(prev => {
      const updated = { ...prev, savedLocations: updatedLocs };
      if (prev.id && prev.id !== 'guest_user') {
        updateFirebaseUserProfile(prev.id, { savedLocations: updatedLocs });
      }
      return updated;
    });
    return true;
  };

  const deleteSavedLocation = (locationId: string) => {
    recordTap('Deleted saved location');
    const updatedLocs = savedLocations.filter(l => l.id !== locationId);
    setUserProfile(prev => {
      const updated = { ...prev, savedLocations: updatedLocs };
      if (prev.id && prev.id !== 'guest_user') {
        updateFirebaseUserProfile(prev.id, { savedLocations: updatedLocs });
      }
      return updated;
    });
  };

  const setDefaultLocation = (locationId: string) => {
    recordTap('Set default delivery location');
    const updatedLocs = savedLocations.map(l => ({
      ...l,
      isDefault: l.id === locationId
    }));
    setUserProfile(prev => {
      const updated = { ...prev, savedLocations: updatedLocs };
      if (prev.id && prev.id !== 'guest_user') {
        updateFirebaseUserProfile(prev.id, { savedLocations: updatedLocs });
      }
      return updated;
    });
  };

  // Recommendations Computation
  const { recommendations, totalEligibleRecommendations, weakMatchWarning } = useMemo(() => {
    if (!currentLocation) {
      return { recommendations: [], totalEligibleRecommendations: 0, weakMatchWarning: 'No location selected' };
    }
    return computeRecommendations({
      meals: allMeals,
      restaurants: allRestaurants,
      userProfile,
      currentLocation,
      activeMealPeriod: mealPeriod,
      maxDistanceKm: searchRadiusKm,
      skipCount,
      count: 3
    });
  }, [allMeals, allRestaurants, userProfile, currentLocation, mealPeriod, searchRadiusKm, skipCount]);

  // Log recommendation impression event
  useEffect(() => {
    if (recommendations.length > 0 && userProfile.id) {
      recommendations.forEach((rec, idx) => {
        logRecommendationEvent({
          userId: userProfile.id,
          mealId: rec.meal.id,
          restaurantId: rec.restaurant.id,
          eventType: 'impression',
          position: idx + 1,
          timestamp: new Date().toISOString(),
          locationContext: currentLocation?.label || 'Default'
        });
      });
    }
  }, [recommendations, userProfile.id, currentLocation?.label]);

  const showNextRecommendations = () => {
    recordTap('Clicked Show Me Something Else');
    setSkipCount(prev => prev + 3);
  };

  // Rejection with reason learning
  const rejectMeal = (mealId: string, reason: RejectionReason) => {
    recordTap(`Rejected meal with reason: ${reason}`);
    logRecommendationEvent({
      userId: userProfile.id,
      mealId,
      eventType: 'rejected',
      rejectionReason: reason,
      timestamp: new Date().toISOString()
    });

    setUserProfile(prev => {
      const newRejected = [...(prev.behavior.rejectedMealIds || []), {
        mealId,
        reason,
        timestamp: new Date().toISOString()
      }];
      const updated = {
        ...prev,
        behavior: { ...prev.behavior, rejectedMealIds: newRejected }
      };
      if (prev.id && prev.id !== 'guest_user') {
        updateFirebaseUserProfile(prev.id, { behavior: updated.behavior });
      }
      return updated;
    });

    showNextRecommendations();
  };

  // Cart operations
  const addToCart = (meal: Meal, selectedCustomizations: CustomizationOption[] = [], instructions?: string) => {
    recordTap(`Added ${meal.name} to cart`);
    logRecommendationEvent({
      userId: userProfile.id,
      mealId: meal.id,
      restaurantId: meal.restaurantId,
      eventType: 'meal_added',
      timestamp: new Date().toISOString()
    });

    const restaurant = allRestaurants.find(r => r.id === meal.restaurantId) || {
      id: meal.restaurantId,
      name: meal.restaurantName,
      deliveryFeeNGN: 800,
      deliveryFeeGBP: 2.50
    } as Restaurant;

    const customTotal = selectedCustomizations.reduce((acc, c) => acc + c.priceDelta, 0);
    const basePrice = currentLocation.currency === 'NGN' ? meal.priceNGN : meal.priceGBP;
    const itemPrice = basePrice + customTotal;

    const newItem: CartItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      meal,
      restaurant,
      quantity: 1,
      selectedCustomizations,
      itemPrice,
      specialInstructions: instructions
    };

    setCartItems(prev => {
      // If cart has items from another restaurant, prompt or clear
      if (prev.length > 0 && prev[0].restaurant.id !== restaurant.id) {
        if (confirm('Your cart contains items from another restaurant. Clear cart and add this meal?')) {
          return [newItem];
        }
        return prev;
      }
      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    recordTap('Removed item from cart');
    setCartItems(prev => prev.filter(i => i.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    recordTap(`Updated cart quantity (${delta > 0 ? '+1' : '-1'})`);
    setCartItems(prev => prev.map(item => {
      if (item.id === cartItemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Cart financial totals
  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.itemPrice * item.quantity), 0);
  }, [cartItems]);

  const cartDeliveryFee = useMemo(() => {
    if (cartItems.length === 0) return 0;
    const rest = cartItems[0].restaurant;
    return currentLocation.currency === 'NGN' ? (rest.deliveryFeeNGN || 800) : (rest.deliveryFeeGBP || 2.50);
  }, [cartItems, currentLocation]);

  const cartServiceFee = useMemo(() => {
    if (cartItems.length === 0) return 0;
    return Math.round(cartSubtotal * 0.05); // 5% service fee
  }, [cartSubtotal]);

  const cartTotal = cartSubtotal + cartDeliveryFee + cartServiceFee;

  // Order Placement (Firestore state machine)
  const placeOrder = async (fulfillmentMethod: 'delivery' | 'pickup'): Promise<Order> => {
    recordTap('Completed checkout & placed order');
    const orderNum = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: orderNum,
      userId: userProfile.id,
      customerName: userProfile.name,
      customerPhone: userProfile.phone,
      items: [...cartItems],
      restaurantId: cartItems[0].restaurant.id,
      restaurantName: cartItems[0].restaurant.name,
      fulfillmentMethod,
      deliveryAddress: currentLocation,
      subtotal: cartSubtotal,
      deliveryFee: cartDeliveryFee,
      serviceFee: cartServiceFee,
      total: cartTotal,
      currency: currentLocation.currency,
      status: 'payment_pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      estimatedDeliveryTime: '25-35 mins',
      driverName: 'Emeka Nwosu (Courier)',
      driverPhone: '+234 802 987 6543',
      driverVehicle: 'Honda Motorcycle (PH-342-XY)',
      tapCount,
      courierMessages: [
        {
          id: 'msg_init',
          sender: 'system',
          text: 'Order placed securely in Firestore. Kitchen notified.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    // Save order in Firestore
    await createOrderInFirestore(newOrder);

    // Record order analytics event
    logRecommendationEvent({
      userId: userProfile.id,
      restaurantId: newOrder.restaurantId,
      eventType: 'meal_ordered',
      timestamp: new Date().toISOString()
    });

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    clearCart();
    setIsCheckoutOpen(false);
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    recordTap(`Updated order status to ${status}`);
    await updateOrderStatusInFirestore(orderId, status);
  };

  const cancelActiveOrder = async (orderId: string) => {
    recordTap('Cancelled active order');
    await updateOrderStatusInFirestore(orderId, 'cancelled');
  };

  const submitOrderRating = (orderId: string, foodRating: number, restaurantRating: number, deliveryRating: number, feedbackTags: string[]) => {
    recordTap('Submitted order rating feedback');
    const ratingObj = {
      foodRating,
      restaurantRating,
      deliveryRating,
      feedbackTags,
      timestamp: new Date().toISOString()
    };

    const targetOrder = orders.find(o => o.id === orderId);

    logRecommendationEvent({
      userId: userProfile.id,
      restaurantId: targetOrder?.restaurantId,
      eventType: 'rated',
      timestamp: new Date().toISOString()
    });

    logRecommendationEvent({
      userId: userProfile.id,
      restaurantId: targetOrder?.restaurantId,
      eventType: 'meal_rated',
      timestamp: new Date().toISOString()
    });

    updateOrderStatusInFirestore(orderId, 'delivered', { ratingSubmitted: ratingObj });
  };

  // Merchant Actions
  const toggleMealAvailability = async (mealId: string) => {
    recordTap('Toggled meal availability');
    const targetMeal = allMeals.find(m => m.id === mealId);
    if (targetMeal) {
      await updateMeal(mealId, { isAvailable: !targetMeal.isAvailable });
    }
  };

  const updateMealStock = async (mealId: string, countOrDelta: number, isAbsolute: boolean = false) => {
    const targetMeal = allMeals.find(m => m.id === mealId);
    if (targetMeal) {
      const current = targetMeal.stockCount || 10;
      const next = isAbsolute ? Math.max(0, countOrDelta) : Math.max(0, current + countOrDelta);
      await updateMeal(mealId, { stockCount: next, isAvailable: next > 0 });
    }
  };

  const batchStockUpMeals = async (restaurantId: string, defaultCount: number = 20) => {
    recordTap('Batch restocked kitchen meals');
    const restMeals = allMeals.filter(m => m.restaurantId === restaurantId);
    for (const m of restMeals) {
      await updateMeal(m.id, { stockCount: defaultCount, isAvailable: true });
    }
  };

  const toggleRestaurantOpenStatus = async (restaurantId: string) => {
    recordTap('Toggled restaurant operating status');
    const rest = allRestaurants.find(r => r.id === restaurantId);
    if (rest) {
      await updateRestaurant(restaurantId, { isOpen: !rest.isOpen, acceptingOrders: !rest.isOpen });
    }
  };

  const toggleOrderAcceptanceMode = async (restaurantId: string) => {
    recordTap('Toggled order acceptance mode (Auto/Manual)');
    const rest = allRestaurants.find(r => r.id === restaurantId);
    if (rest) {
      const nextMode = rest.orderAcceptanceMode === 'auto' ? 'manual' : 'auto';
      await updateRestaurant(restaurantId, { orderAcceptanceMode: nextMode });
    }
  };

  const updateRestaurantDetails = async (restaurantId: string, updates: Partial<Restaurant>) => {
    recordTap('Updated restaurant profile details');
    await updateRestaurant(restaurantId, updates);
  };

  // Auth Methods
  const loginWithEmail = async (email: string, pass: string) => {
    const profile = await authLoginWithEmail(email, pass);
    setUserProfile(profile);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const profile = await authSignUpWithEmail(email, pass, name);
    setUserProfile(profile);
  };

  const loginWithGoogle = async () => {
    const profile = await authLoginWithGoogle();
    setUserProfile(profile);
  };

  const logoutUser = async () => {
    await authLogoutUser();
    setUserProfile(INITIAL_USER_PROFILE);
  };

  // Misc Profile Updates
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...updates };
      if (prev.id && prev.id !== 'guest_user') {
        updateFirebaseUserProfile(prev.id, updates);
      }
      return updated;
    });
  };

  const updateKitchenStaffProfile = (updates: Partial<KitchenStaffProfile>) => {
    setUserProfile(prev => {
      const updated = {
        ...prev,
        kitchenStaff: { ...prev.kitchenStaff, ...updates } as KitchenStaffProfile
      };
      if (prev.id && prev.id !== 'guest_user') {
        updateFirebaseUserProfile(prev.id, { kitchenStaff: updated.kitchenStaff });
      }
      return updated;
    });
  };

  const updateCourierProfile = (updates: Partial<CourierProfile>) => {
    setUserProfile(prev => {
      const updated = {
        ...prev,
        courier: { ...prev.courier, ...updates } as CourierProfile
      };
      if (prev.id && prev.id !== 'guest_user') {
        updateFirebaseUserProfile(prev.id, { courier: updated.courier });
      }
      return updated;
    });
  };

  const updatePreferences = (newPrefs: Partial<UserProfile['preferences']>) => {
    setUserProfile(prev => {
      const updated = {
        ...prev,
        preferences: { ...prev.preferences, ...newPrefs }
      };
      if (prev.id && prev.id !== 'guest_user') {
        updateFirebaseUserProfile(prev.id, { preferences: updated.preferences });
      }
      return updated;
    });
  };

  const toggleAllergen = (allergen: Allergen) => {
    const current = userProfile.safety?.allergies || [];
    const updated = current.includes(allergen)
      ? current.filter(a => a !== allergen)
      : [...current, allergen];
    setUserProfile(prev => {
      const u = { ...prev, safety: { ...prev.safety, allergies: updated } };
      if (prev.id && prev.id !== 'guest_user') {
        updateFirebaseUserProfile(prev.id, { safety: u.safety });
      }
      return u;
    });
  };

  const toggleCuisine = (cuisine: CountryCuisine) => {
    const current = userProfile.preferences?.explicitCuisines || [];
    const updated = current.includes(cuisine)
      ? current.filter(c => c !== cuisine)
      : [...current, cuisine];
    updatePreferences({ explicitCuisines: updated });
  };

  const setSpicePreference = (spice: SpiceLevel) => {
    updatePreferences({ preferredSpiceLevel: spice });
  };

  const addDislikedIngredient = (ingredient: string) => {
    if (!ingredient.trim()) return;
    const current = userProfile.preferences?.dislikedIngredients || [];
    if (!current.includes(ingredient.trim())) {
      updatePreferences({ dislikedIngredients: [...current, ingredient.trim()] });
    }
  };

  const removeDislikedIngredient = (ingredient: string) => {
    const current = userProfile.preferences?.dislikedIngredients || [];
    updatePreferences({ dislikedIngredients: current.filter(i => i !== ingredient) });
  };

  const toggleDietaryFlag = (flag: DietaryFlag) => {
    const current = userProfile.preferences?.dietaryFlags || [];
    const updated = current.includes(flag)
      ? current.filter(f => f !== flag)
      : [...current, flag];
    updatePreferences({ dietaryFlags: updated });
  };

  const updateSafetyNotes = (notes: string) => {
    setUserProfile(prev => {
      const u = { ...prev, safety: { ...prev.safety, notes } };
      if (prev.id && prev.id !== 'guest_user') {
        updateFirebaseUserProfile(prev.id, { safety: u.safety });
      }
      return u;
    });
  };

  const resetPreferencesToDefault = () => {
    updatePreferences(INITIAL_USER_PROFILE.preferences);
  };

  const openRestaurantDetails = (restaurant: Restaurant) => {
    recordTap(`Opened restaurant details for ${restaurant.name}`);
    setSelectedRestaurantForDetails(restaurant);
    setIsRestaurantDetailsModalOpen(true);
  };

  const openRestaurantDetailsModal = (restaurantOrId: Restaurant | string) => {
    let restaurant: Restaurant | undefined;
    if (typeof restaurantOrId === 'string') {
      restaurant = allRestaurants.find(r => r.id === restaurantOrId);
    } else {
      restaurant = restaurantOrId;
    }
    if (restaurant) {
      openRestaurantDetails(restaurant);
    }
  };

  const closeRestaurantDetails = () => {
    setIsRestaurantDetailsModalOpen(false);
  };

  const closeRestaurantDetailsModal = closeRestaurantDetails;

  const sendCourierMessage = (orderId: string, text: string) => {
    if (!text.trim()) return;
    recordTap('Sent message to courier');
    const newMsg: CourierMessage = {
      id: `msg_${Date.now()}`,
      sender: 'customer',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        const msgs = [...(ord.courierMessages || []), newMsg];
        updateOrderStatusInFirestore(orderId, ord.status, { courierMessages: msgs });
        return { ...ord, courierMessages: msgs };
      }
      return ord;
    }));
  };

  const merchantRestaurants = useMemo(() => {
    return allRestaurants;
  }, [allRestaurants]);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        savedLocations,
        currentLocation,
        selectLocation,
        addSavedLocation,
        deleteSavedLocation,
        setDefaultLocation,
        searchRadiusKm,
        setSearchRadiusKm,
        mealPeriod,
        setMealPeriod,
        isSimulatedTime,
        setIsSimulatedTime,
        recommendations,
        skipCount,
        showNextRecommendations,
        rejectMeal,
        weakMatchWarning,
        totalEligibleRecommendations,
        userProfile,
        setUserRole,
        theme,
        toggleTheme,
        updateUserProfile,
        updateKitchenStaffProfile,
        updateCourierProfile,
        updatePreferences,
        toggleAllergen,
        toggleCuisine,
        setSpicePreference,
        addDislikedIngredient,
        removeDislikedIngredient,
        toggleDietaryFlag,
        updateSafetyNotes,
        resetPreferencesToDefault,
        sendCourierMessage,
        selectedMeal,
        setSelectedMeal,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isPreferenceModalOpen,
        setIsPreferenceModalOpen,
        isSafetyModalOpen,
        setIsSafetyModalOpen,
        isRestaurantDetailsModalOpen,
        selectedRestaurantForDetails,
        openRestaurantDetails,
        openRestaurantDetailsModal,
        closeRestaurantDetails,
        closeRestaurantDetailsModal,
        cartItems,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartDeliveryFee,
        cartServiceFee,
        cartTotal,
        orders,
        activeOrder,
        setActiveOrder,
        placeOrder,
        submitOrderRating,
        cancelActiveOrder,
        updateOrderStatus,
        activeMerchantRestaurantId,
        setActiveMerchantRestaurantId,
        merchantRestaurants,
        toggleMealAvailability,
        updateMealStock,
        batchStockUpMeals,
        toggleRestaurantOpenStatus,
        toggleOrderAcceptanceMode,
        updateRestaurantDetails,
        tapCount,
        recordTap,
        resetTapCount,
        recentTapLogs,
        loginWithEmail,
        signUpWithEmail,
        loginWithGoogle,
        logoutUser,
        allMeals,
        allRestaurants,
        isLoadingData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
