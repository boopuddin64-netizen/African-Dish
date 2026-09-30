import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
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
  updateOrderStatusInFirestore,
  submitOrderRatingInFirestore,
  appendCourierMessageInFirestore,
  assignCourierInFirestore,
  GUEST_ORDER_MESSAGE,
  OrderServiceError
} from '../services/orderService';
import { placeOrderOnServer, startPayment, cartToServerItems } from '../services/paymentService';
import { auth } from '../lib/firebase';
import { AppNotification, NotificationType, notify, subscribeNotifications } from '../lib/notifications';
import { generateId } from '../lib/ids';
import { logRecommendationEvent } from '../services/analyticsService';
import { MAX_SAVED_LOCATIONS } from '../services/locationService';
import { submitRoleRequest, RequestableRole } from '../services/roleService';

export type AppView = 'home' | 'discovery' | 'merchant' | 'courier' | 'profile' | 'prd' | 'admin';

interface AppContextType {
  // Navigation & Views
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  
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
  /** True when a real Firebase Auth user is signed in (false = local demo/guest session). */
  isSignedIn: boolean;
  /**
   * DEMO-ONLY workspace switcher. For guests it switches the local view; for signed-in users it can only switch to a
   * role the server already granted (or back to the customer view). It never writes `role` to Firestore.
   */
  setUserRole: (role: UserRole, options?: { navigate?: boolean }) => void;
  /** Files a roleRequests document; an admin must approve before the role takes effect. */
  requestRole: (role: RequestableRole, opts?: { restaurantId?: string; note?: string }) => Promise<boolean>;
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
  sendCourierMessage: (orderId: string, text: string) => Promise<void>;

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
  /** Places a server-priced order and starts payment. Throws (after toasting) for guests / validation / server errors. */
  placeOrder: (fulfillmentMethod: 'delivery' | 'pickup') => Promise<Order>;
  submitOrderRating: (orderId: string, foodRating: number, restaurantRating: number, deliveryRating: number, feedbackTags: string[]) => Promise<void>;
  cancelActiveOrder: (orderId: string) => Promise<void>;
  /** Resolves true on success; on failure shows a toast and resolves false (never writes on invalid transitions). */
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  assignCourier: (orderId: string, courierId: string) => Promise<boolean>;

  // Toasts / notifications
  toasts: AppNotification[];
  showToast: (message: string, type?: NotificationType) => void;
  dismissToast: (id: string) => void;

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

function orderErrorMessage(err: unknown): string {
  if (err instanceof OrderServiceError) return err.message;
  const code = (err as { code?: string })?.code ?? '';
  if (code.includes('permission-denied')) return "You don't have permission to do that with this order.";
  return (err as { message?: string })?.message || 'Something went wrong updating the order.';
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<AppView>('home');

  // Auth state: true once a real Firebase user is signed in
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  // Role granted by the server (users/{uid}.role); userProfile.role may differ only for the local demo/view switch
  const [grantedRole, setGrantedRole] = useState<UserRole>('customer');

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

  // Toasts (fed by lib/notifications so services and error handlers can surface messages)
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const dismissToast = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  const showToast = useCallback((message: string, type: NotificationType = 'info') => notify(message, type), []);
  useEffect(() => {
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const unsubscribe = subscribeNotifications((n) => {
      setToasts(prev => [...prev.slice(-3), n]);
      timers.set(n.id, setTimeout(() => dismissToast(n.id), n.type === 'error' ? 8000 : 4000));
    });
    return () => {
      unsubscribe();
      timers.forEach(clearTimeout);
    };
  }, [dismissToast]);

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
    let cancelled = false;
    let unsubscribeAuth: (() => void) | undefined;
    let unsubscribeRest: (() => void) | undefined;
    let unsubscribeMeals: (() => void) | undefined;

    async function initFirebaseSync() {
      setIsLoadingData(true);

      // Auth Sync
      unsubscribeAuth = subscribeToAuthChanges((profile) => {
        setIsSignedIn(Boolean(profile));
        if (profile) {
          setGrantedRole(profile.role);
          const assigned = profile.kitchenStaff?.assignedRestaurantId;
          if (profile.role === 'restaurant_staff' && assigned) setActiveMerchantRestaurantId(assigned);
          setUserProfile(profile);
          if (profile.theme) setTheme(profile.theme);
          // Demo data is seeded by admins only (Firestore rules); a no-op for everyone else.
          void seedFirestoreInitialData({ uid: profile.id, role: profile.role });
        } else {
          setGrantedRole('customer');
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

    // Orders are subscribed in a separate effect keyed on the signed-in user.
    return () => {
      cancelled = true;
      unsubscribeAuth?.();
      unsubscribeRest?.();
      unsubscribeMeals?.();
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
        setActiveOrder(prev => {
          // keep the order the user is looking at fresh with live server updates
          if (prev) {
            const fresh = orderList.find(o => o.id === prev.id);
            if (fresh) return fresh;
          }
          return prev;
        });
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

  // Role Switcher (DEMO-ONLY, local view state; never persists `role`).
  // Firestore rules reject self-service role writes, so real upgrades go through requestRole() + admin approval.
  const setUserRole = (newRole: UserRole, options?: { navigate?: boolean }) => {
    if (isSignedIn && newRole !== 'customer' && newRole !== grantedRole) {
      notify('Your account does not have that role. Request it from your profile and wait for admin approval.', 'warning');
      return;
    }
    recordTap(`Switched user role to ${newRole}`);
    setUserProfile(prev => ({ ...prev, role: newRole }));
    if (options?.navigate !== false) {
      if (newRole === 'restaurant_staff') {
        setCurrentView('merchant');
      } else if (newRole === 'courier') {
        setCurrentView('courier');
      } else if (newRole === 'admin') {
        setCurrentView('admin');
      } else if (newRole === 'customer') {
        if (currentView === 'merchant' || currentView === 'courier' || currentView === 'admin') {
          setCurrentView('home');
        }
      }
    }
  };

  const requestRole = async (role: RequestableRole, opts?: { restaurantId?: string; note?: string }): Promise<boolean> => {
    if (!isSignedIn) {
      notify('Sign in to request a role. Demo sessions cannot hold real roles.', 'warning');
      return false;
    }
    try {
      await submitRoleRequest(role, opts);
      notify('Request sent. An admin will review it shortly.', 'success');
      return true;
    } catch (err) {
      notify((err as { message?: string })?.message || 'Could not send your request.', 'error');
      return false;
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
      id: generateId('loc')
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
  const { recommendations, totalEligible: totalEligibleRecommendations, weakMatchWarning } = useMemo(() => {
    if (!currentLocation) {
      return { recommendations: [], totalEligible: 0, weakMatchWarning: 'No location selected' };
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

    setSkipCount(0);
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
    // No skip bump needed: rejected meals are excluded by the engine, so the next-best pick appears automatically.
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
      id: generateId('item'),
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
    return Math.round(cartSubtotal * 5) / 100; // 5% service fee (2dp, matches server pricing)
  }, [cartSubtotal]);

  const cartTotal = cartSubtotal + cartDeliveryFee + cartServiceFee;

  // Order Placement: server-priced via the `placeOrder` Cloud Function, then payment is started.
  // The client never writes 'paid'; the payment webhook (or emulator-only simulation) does, and the live order
  // subscription reflects it.
  const placeOrder = async (fulfillmentMethod: 'delivery' | 'pickup'): Promise<Order> => {
    recordTap('Completed checkout & placed order');
    if (!auth.currentUser) {
      // Guests are demo-only: nothing is persisted, so we refuse explicitly instead of pretending it worked.
      notify(GUEST_ORDER_MESSAGE, 'warning');
      throw new OrderServiceError('guest', GUEST_ORDER_MESSAGE);
    }
    if (cartItems.length === 0) {
      notify('Your cart is empty.', 'warning');
      throw new OrderServiceError('invalid_state', 'Your cart is empty.');
    }

    let newOrder: Order;
    try {
      const res = await placeOrderOnServer({
        restaurantId: cartItems[0].restaurant.id,
        items: cartToServerItems(cartItems),
        fulfillmentMethod,
        currency: currentLocation.currency,
        deliveryAddress: currentLocation,
        tapCount
      });
      newOrder = res.order;
    } catch (err) {
      const message = (err as { message?: string })?.message?.replace(/^.*?:\s*/, '') || 'Could not place your order.';
      notify(message, 'error');
      throw err;
    }

    logRecommendationEvent({
      userId: userProfile.id,
      restaurantId: newOrder.restaurantId,
      eventType: 'meal_ordered',
      timestamp: new Date().toISOString()
    });

    setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
    setActiveOrder(newOrder);
    clearCart();
    setIsCheckoutOpen(false);

    try {
      const pay = await startPayment(newOrder.id);
      if (pay.mode === 'redirect') {
        window.location.assign(pay.authorizationUrl);
      } else {
        notify('Dev simulation: payment confirmed by the emulator function.', 'info');
      }
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Could not start payment.';
      notify(`Order saved, but payment could not start: ${message}`, 'error');
    }
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    recordTap(`Updated order status to ${status}`);
    try {
      await updateOrderStatusInFirestore(orderId, status);
      return true;
    } catch (err) {
      notify(orderErrorMessage(err), 'error');
      return false;
    }
  };

  const assignCourier = async (orderId: string, courierId: string): Promise<boolean> => {
    recordTap('Assigned courier to order');
    try {
      await assignCourierInFirestore(orderId, courierId);
      notify('Courier assigned.', 'success');
      return true;
    } catch (err) {
      notify(orderErrorMessage(err), 'error');
      return false;
    }
  };

  const cancelActiveOrder = async (orderId: string) => {
    recordTap('Cancelled active order');
    try {
      await updateOrderStatusInFirestore(orderId, 'cancelled');
      notify('Order cancelled.', 'success');
    } catch (err) {
      notify(orderErrorMessage(err), 'error');
    }
  };

  const submitOrderRating = async (orderId: string, foodRating: number, restaurantRating: number, deliveryRating: number, feedbackTags: string[]) => {
    recordTap('Submitted order rating feedback');
    const ratingObj = {
      foodRating,
      restaurantRating,
      deliveryRating,
      feedbackTags,
      timestamp: new Date().toISOString()
    };
    const targetOrder = orders.find(o => o.id === orderId);

    try {
      // Writes ONLY ratingSubmitted + updatedAt; status is never touched.
      await submitOrderRatingInFirestore(orderId, ratingObj);
    } catch (err) {
      notify(orderErrorMessage(err), 'error');
      return;
    }

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

  const sendCourierMessage = async (orderId: string, text: string) => {
    if (!text.trim()) return;
    recordTap('Sent message to courier');
    const newMsg: CourierMessage = {
      id: generateId('msg'),
      sender: 'customer',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Optimistic local update (pure state update; the Firestore write happens below, outside any updater).
    setOrders(prev => prev.map(ord => ord.id === orderId ? { ...ord, courierMessages: [...(ord.courierMessages || []), newMsg] } : ord));
    setActiveOrder(prev => prev && prev.id === orderId ? { ...prev, courierMessages: [...(prev.courierMessages || []), newMsg] } : prev);

    if (!auth.currentUser) {
      notify('Guest mode: this message is not saved or delivered.', 'info');
      return;
    }
    try {
      await appendCourierMessageInFirestore(orderId, newMsg);
    } catch (err) {
      notify(orderErrorMessage(err), 'error');
    }
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
        isSignedIn,
        setUserRole,
        requestRole,
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
        assignCourier,
        toasts,
        showToast,
        dismissToast,
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
