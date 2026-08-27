import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MapPin, 
  Clock, 
  ShoppingBag, 
  SlidersHorizontal, 
  Store, 
  Compass, 
  Home, 
  CheckCircle2, 
  ChevronDown,
  User,
  Sun,
  Moon,
  Bike
} from 'lucide-react';
import { MealPeriod } from '../types';
import { RoleSwitcherModal } from './RoleSwitcherModal';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    savedLocations,
    currentLocation,
    selectLocation,
    mealPeriod,
    setMealPeriod,
    cartItems,
    setIsCartOpen,
    setIsPreferenceModalOpen,
    userProfile,
    recordTap,
    theme,
    toggleTheme
  } = useApp();

  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const activeAllergensCount = userProfile.safety.allergies.length;

  const mealPeriods: { key: MealPeriod; label: string; icon: string }[] = [
    { key: 'breakfast', label: 'Breakfast (Morning)', icon: '☀️' },
    { key: 'lunch', label: 'Lunch (Midday)', icon: '🍲' },
    { key: 'snack', label: 'Snack (Afternoon)', icon: '🍢' },
    { key: 'dinner', label: 'Dinner (Evening)', icon: '🌙' },
    { key: 'late_night', label: 'Late Night (Night)', icon: '⭐' }
  ];

  const isCustomer = userProfile.role === 'customer';
  const isMerchant = userProfile.role === 'restaurant_staff';
  const isCourier = userProfile.role === 'courier';

  return (
    <header id="app-navbar" className="sticky top-0 z-40 bg-[#FAF7F0]/95 dark:bg-[#181512]/95 backdrop-blur-md border-b border-[#EAE4DC] dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Brand & Purpose */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              id="brand-logo-btn"
              onClick={() => {
                recordTap('Clicked brand home');
                if (isMerchant) {
                  setCurrentView('merchant');
                } else if (isCourier) {
                  setCurrentView('courier');
                } else {
                  setCurrentView('home');
                }
              }}
              className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#C85C43] text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-sm group-hover:bg-[#B44F37] transition-colors shrink-0">
                O
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[#241A17] dark:text-stone-100 tracking-tight text-base sm:text-lg leading-none">
                    Ounjé
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#5F765A]/15 dark:bg-[#5F765A]/30 text-[#5F765A] dark:text-[#88a881] shrink-0">
                    {isMerchant ? 'Merchant' : (isCourier ? 'Courier' : 'Food')}
                  </span>
                </div>
                <p className="text-xs text-[#807872] dark:text-stone-400 truncate hidden sm:block">
                  {isMerchant ? 'Restaurant Partner Portal' : (isCourier ? 'Courier Logistics Partner' : 'Curated Taste & Discovery')}
                </p>
              </div>
            </button>
          </div>

          {/* Context Switchers: Location & Meal Period (Customer/Universal) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Location Pill */}
            <div className="relative">
              <button
                id="location-picker-btn"
                onClick={() => {
                  recordTap('Opened location menu');
                  setShowLocationMenu(!showLocationMenu);
                  setShowTimeMenu(false);
                }}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full bg-white dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-700 hover:border-[#C85C43]/40 text-xs sm:text-sm font-medium text-[#241A17] dark:text-stone-200 shadow-2xs transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C85C43] shrink-0" />
                <span className="truncate max-w-[80px] sm:max-w-[140px] md:max-w-[180px]">
                  {currentLocation.label}
                </span>
                <span className="text-[10px] text-[#807872] dark:text-stone-400 bg-[#FAF7F0] dark:bg-stone-800 px-1.5 py-0.5 rounded shrink-0">
                  {currentLocation.currency === 'NGN' ? '₦ NGN' : '£ GBP'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#807872] dark:text-stone-400 shrink-0" />
              </button>

              {showLocationMenu && (
                <div 
                  id="location-dropdown-menu"
                  className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 sm:w-80 bg-white dark:bg-[#1E1B18] rounded-2xl shadow-xl border border-[#EAE4DC] dark:border-stone-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-3 py-2 border-b border-[#F0EAE1] dark:border-stone-800">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#807872] dark:text-stone-400">
                      Switch Location & Market
                    </p>
                    <p className="text-[11px] text-[#807872] dark:text-stone-400 mt-0.5">
                      Recalculates availability, distance & currency without altering your food identity.
                    </p>
                  </div>

                  <div className="py-1">
                    <p className="px-3 pt-2 pb-1 text-[11px] font-bold text-[#C85C43] uppercase tracking-wider">
                      🇳🇬 Port Harcourt Pilot
                    </p>
                    {savedLocations.filter(l => l.city === 'Port Harcourt').map(loc => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          selectLocation(loc.id);
                          setShowLocationMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                          loc.id === currentLocation.id 
                            ? 'bg-[#FAF7F0] dark:bg-stone-900 font-bold text-[#C85C43]' 
                            : 'hover:bg-[#FAF7F0] dark:hover:bg-stone-800 text-[#241A17] dark:text-stone-200'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{loc.label}</div>
                          <div className="text-[11px] text-[#807872] dark:text-stone-400">{loc.address}</div>
                        </div>
                        {loc.id === currentLocation.id && <CheckCircle2 className="w-4 h-4 text-[#C85C43] shrink-0" />}
                      </button>
                    ))}

                    <div className="my-1 border-t border-[#F0EAE1] dark:border-stone-800" />

                    <p className="px-3 pt-1 pb-1 text-[11px] font-bold text-[#5F765A] uppercase tracking-wider">
                      🇬🇧 UK Expansion Target (London & Manchester)
                    </p>
                    {savedLocations.filter(l => l.city !== 'Port Harcourt').map(loc => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          selectLocation(loc.id);
                          setShowLocationMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                          loc.id === currentLocation.id 
                            ? 'bg-[#FAF7F0] dark:bg-stone-900 font-bold text-[#5F765A]' 
                            : 'hover:bg-[#FAF7F0] dark:hover:bg-stone-800 text-[#241A17] dark:text-stone-200'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{loc.label}</div>
                          <div className="text-[11px] text-[#807872] dark:text-stone-400">{loc.address} ({loc.postcodeOrArea})</div>
                        </div>
                        {loc.id === currentLocation.id && <CheckCircle2 className="w-4 h-4 text-[#5F765A] shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Meal Period Context Pill */}
            <div className="relative">
              <button
                id="meal-period-btn"
                onClick={() => {
                  recordTap('Opened meal period menu');
                  setShowTimeMenu(!showTimeMenu);
                  setShowLocationMenu(false);
                }}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full bg-white dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-700 hover:border-[#C85C43]/40 text-xs sm:text-sm font-medium text-[#241A17] dark:text-stone-200 shadow-2xs transition-all"
              >
                <Clock className="w-3.5 h-3.5 text-[#5F765A] shrink-0" />
                <span className="capitalize">{mealPeriod.replace('_', ' ')}</span>
                <ChevronDown className="w-3 h-3 text-[#807872] dark:text-stone-400 shrink-0" />
              </button>

              {showTimeMenu && (
                <div 
                  id="meal-period-dropdown"
                  className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-56 bg-white dark:bg-[#1E1B18] rounded-2xl shadow-xl border border-[#EAE4DC] dark:border-stone-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-3 py-2 border-b border-[#F0EAE1] dark:border-stone-800">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#807872] dark:text-stone-400">
                      Contextual Meal Period
                    </p>
                    <p className="text-[11px] text-[#807872] dark:text-stone-400">
                      Simulate time-of-day contextual recommendations.
                    </p>
                  </div>
                  <div className="py-1">
                    {mealPeriods.map(mp => (
                      <button
                        key={mp.key}
                        onClick={() => {
                          recordTap(`Set meal period to ${mp.key}`);
                          setMealPeriod(mp.key);
                          setShowTimeMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                          mealPeriod === mp.key 
                            ? 'bg-[#FAF7F0] dark:bg-stone-900 font-bold text-[#C85C43]' 
                            : 'hover:bg-[#FAF7F0] dark:hover:bg-stone-800 text-[#241A17] dark:text-stone-200'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{mp.icon}</span>
                          <span>{mp.label}</span>
                        </span>
                        {mealPeriod === mp.key && <CheckCircle2 className="w-3.5 h-3.5 text-[#C85C43]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Action Links, Theme Toggle, Role Switcher, Profile & Cart */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* View switcher nav buttons: Clean, Role-Filtered (No Hardcoded Overlap) */}
            <nav className="hidden lg:flex items-center gap-1 bg-white dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 p-1 rounded-full text-xs font-semibold">
              {isCustomer && (
                <>
                  <button
                    id="nav-home-btn"
                    onClick={() => {
                      recordTap('Switched to Home view');
                      setCurrentView('home');
                    }}
                    className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                      currentView === 'home' 
                        ? 'bg-[#C85C43] text-white shadow-2xs' 
                        : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Home</span>
                  </button>

                  <button
                    id="nav-discovery-btn"
                    onClick={() => {
                      recordTap('Switched to Discovery view');
                      setCurrentView('discovery');
                    }}
                    className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                      currentView === 'discovery' 
                        ? 'bg-[#C85C43] text-white shadow-2xs' 
                        : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Discovery</span>
                  </button>
                </>
              )}

              {/* Merchant View Tab only if Restaurant Staff */}
              {isMerchant && (
                <button
                  id="nav-merchant-btn"
                  onClick={() => {
                    recordTap('Switched to Merchant Portal view');
                    setCurrentView('merchant');
                  }}
                  className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                    currentView === 'merchant' 
                      ? 'bg-[#5F765A] text-white shadow-2xs' 
                      : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Kitchen Portal</span>
                </button>
              )}

              {/* Courier View Tab only if Delivery Courier */}
              {isCourier && (
                <button
                  id="nav-courier-btn"
                  onClick={() => {
                    recordTap('Switched to Courier Portal view');
                    setCurrentView('courier');
                  }}
                  className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                    currentView === 'courier' 
                      ? 'bg-amber-600 text-white shadow-2xs' 
                      : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Courier Portal</span>
                </button>
              )}

              <button
                id="nav-profile-btn"
                onClick={() => {
                  recordTap('Switched to Profile view');
                  setCurrentView('profile');
                }}
                className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                  currentView === 'profile' 
                    ? 'bg-[#C85C43] text-white shadow-2xs' 
                    : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile</span>
              </button>
            </nav>

            {/* Quick Role Switcher Pill */}
            <button
              id="role-indicator-btn"
              onClick={() => {
                recordTap('Opened role switcher modal');
                setIsRoleModalOpen(true);
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-xs font-bold shadow-2xs transition-all cursor-pointer ${
                isMerchant
                  ? 'bg-[#5F765A]/10 text-[#5F765A] dark:text-[#88a881] border-[#5F765A]/30 hover:bg-[#5F765A]/20'
                  : isCourier
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-[#C85C43]/10 text-[#C85C43] dark:text-[#e0755c] border-[#C85C43]/30 hover:bg-[#C85C43]/20'
              }`}
              title="Click to switch between Customer, Restaurant Staff, and Courier roles"
            >
              {isMerchant ? (
                <Store className="w-3.5 h-3.5 text-[#5F765A] dark:text-[#88a881]" />
              ) : isCourier ? (
                <Bike className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              ) : (
                <User className="w-3.5 h-3.5 text-[#C85C43]" />
              )}
              <span className="capitalize text-[11px] font-extrabold inline">
                {userProfile.role.replace('_', ' ')}
              </span>
              <span className="text-[10px] opacity-70">▾</span>
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={() => {
                recordTap(`Toggled theme to ${theme === 'light' ? 'dark' : 'light'}`);
                toggleTheme();
              }}
              className="p-2 sm:p-2.5 rounded-full bg-white dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 text-[#241A17] dark:text-stone-200 hover:border-[#C85C43]/40 shadow-2xs transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-[#807872]" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Preferences Trigger */}
            <button
              id="preferences-btn"
              onClick={() => {
                recordTap('Opened preferences & safety modal');
                setIsPreferenceModalOpen(true);
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-full bg-white dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 hover:border-[#C85C43]/40 text-[#241A17] dark:text-stone-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
              title="Personal Preferences & Safety Layer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#807872] dark:text-stone-400" />
              <span className="hidden md:inline">Preferences</span>
              {activeAllergensCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500" title={`${activeAllergensCount} active allergen filters`} />
              )}
            </button>

            {/* Cart Button (Always visible for customer) */}
            {isCustomer && (
              <button
                id="cart-btn"
                onClick={() => {
                  recordTap('Opened cart drawer');
                  setIsCartOpen(true);
                }}
                className="relative p-2 sm:px-3.5 sm:py-2 rounded-full bg-[#C85C43] text-white text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-[#B44F37] transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {totalCartCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white text-[#C85C43] text-[11px] font-black flex items-center justify-center shadow-xs">
                    {totalCartCount}
                  </span>
                )}
              </button>
            )}

          </div>

        </div>

        {/* Mobile Navigation Tabs (Responsive & Role Conditioned) */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-[#EAE4DC] dark:border-stone-800 text-xs font-medium">
          {isCustomer && (
            <>
              <button
                onClick={() => {
                  recordTap('Switched to Home (Mobile)');
                  setCurrentView('home');
                }}
                className={`flex items-center gap-1 py-1 px-3 rounded-full ${
                  currentView === 'home' ? 'bg-[#C85C43] text-white font-bold' : 'text-[#807872] dark:text-stone-400'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              <button
                onClick={() => {
                  recordTap('Switched to Discovery (Mobile)');
                  setCurrentView('discovery');
                }}
                className={`flex items-center gap-1 py-1 px-3 rounded-full ${
                  currentView === 'discovery' ? 'bg-[#C85C43] text-white font-bold' : 'text-[#807872] dark:text-stone-400'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Discovery</span>
              </button>
            </>
          )}

          {isMerchant && (
            <button
              onClick={() => {
                recordTap('Switched to Kitchen Portal (Mobile)');
                setCurrentView('merchant');
              }}
              className={`flex items-center gap-1 py-1 px-3 rounded-full ${
                currentView === 'merchant' ? 'bg-[#5F765A] text-white font-bold' : 'text-[#807872] dark:text-stone-400'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Kitchen</span>
            </button>
          )}

          {isCourier && (
            <button
              onClick={() => {
                recordTap('Switched to Courier Portal (Mobile)');
                setCurrentView('courier');
              }}
              className={`flex items-center gap-1 py-1 px-3 rounded-full ${
                currentView === 'courier' ? 'bg-amber-600 text-white font-bold' : 'text-[#807872] dark:text-stone-400'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Courier</span>
            </button>
          )}

          <button
            id="mobile-profile-btn"
            onClick={() => {
              recordTap('Switched to Profile (Mobile)');
              setCurrentView('profile');
            }}
            className={`flex items-center gap-1 py-1 px-3 rounded-full ${
              currentView === 'profile' ? 'bg-[#C85C43] text-white font-bold' : 'text-[#807872] dark:text-stone-400'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div>

      </div>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
    </header>
  );
};
