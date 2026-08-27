import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CITY_COORDINATES } from '../services/locationService';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  Heart, 
  Flame, 
  Clock, 
  CreditCard, 
  ShoppingBag, 
  Settings, 
  Plus, 
  Trash2, 
  Check, 
  Edit3, 
  RotateCcw, 
  ChevronRight, 
  Star, 
  CheckCircle2, 
  X, 
  SlidersHorizontal,
  Sparkles,
  AlertCircle,
  Bell,
  Lock,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { 
  Allergen, 
  CountryCuisine, 
  DietaryFlag, 
  SpiceLevel, 
  SavedLocation, 
  Order 
} from '../types';

export const CustomerProfileView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    updatePreferences,
    toggleAllergen,
    toggleCuisine,
    setSpicePreference,
    addDislikedIngredient,
    removeDislikedIngredient,
    toggleDietaryFlag,
    updateSafetyNotes,
    resetPreferencesToDefault,
    savedLocations,
    currentLocation,
    selectLocation,
    addSavedLocation,
    deleteSavedLocation,
    setDefaultLocation,
    orders,
    addToCart,
    setIsCartOpen,
    setActiveOrder,
    recordTap,
    setCurrentView,
    theme,
    toggleTheme
  } = useApp();

  const [activeTab, setActiveTab] = useState<'taste' | 'safety' | 'addresses' | 'orders' | 'payment' | 'settings'>('taste');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [newAvoidanceInput, setNewAvoidanceInput] = useState('');
  const [showResetSuccess, setShowResetSuccess] = useState(false);

  // Edit Profile Form state
  const [profileName, setProfileName] = useState(userProfile.name);
  const [profileEmail, setProfileEmail] = useState(userProfile.email);
  const [profilePhone, setProfilePhone] = useState(userProfile.phone);

  // New Address Form state
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressStreet, setNewAddressStreet] = useState('');
  const [newAddressCity, setNewAddressCity] = useState<'Port Harcourt' | 'London' | 'Manchester'>('Port Harcourt');
  const [newAddressArea, setNewAddressArea] = useState('');
  const [newAddressIsDefault, setNewAddressIsDefault] = useState(false);

  // New Card Form state
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [savedCards, setSavedCards] = useState([
    { id: 'card_1', last4: '4821', brand: 'Mastercard', expiry: '08/28', isDefault: true },
    { id: 'card_2', last4: '1904', brand: 'Visa', expiry: '11/27', isDefault: false }
  ]);

  // Notification toggles
  const [notifications, setNotifications] = useState({
    sms: true,
    whatsapp: true,
    email: true,
    deals: false
  });

  const availableCuisines: CountryCuisine[] = [
    'Nigerian',
    'Ghanaian',
    'Senegalese',
    'Sierra Leonean',
    'Ethiopian',
    'Kenyan',
    'Somali',
    'South African',
    'Cameroonian',
    'Pan-African',
    'Afro-Fusion'
  ];

  const allAllergens: { id: Allergen; label: string; desc: string }[] = [
    { id: 'peanuts', label: 'Peanuts / Groundnuts (Kuli-Kuli & Suya Spice)', desc: 'Crucial for Suya, Yaji spices, Groundnut stew' },
    { id: 'tree_nuts', label: 'Tree Nuts (Cashews, Almonds)', desc: 'Common in select baked snacks & desserts' },
    { id: 'shellfish', label: 'Shellfish / Crustaceans (Crayfish & Periwinkles)', desc: 'Key seasoning in native soups, Egusi, Ogbono' },
    { id: 'fish', label: 'Fish / Stockfish', desc: 'Used in Bole na Eja, native soups, pepper soup' },
    { id: 'gluten', label: 'Gluten / Wheat (Puff-Puff, Bread, Bunny Chow)', desc: 'Found in fried pastries & wheat swallows' },
    { id: 'dairy', label: 'Dairy / Butter / Cheese', desc: 'Niter Kibbeh, Ayib cheese' },
    { id: 'eggs', label: 'Eggs', desc: 'Common accompaniment in Waakye, Doro Wat' },
    { id: 'soy', label: 'Soybeans & Derivatives', desc: 'Sauces and seasoning cubes' },
    { id: 'sesame', label: 'Sesame Seeds / Beniseed', desc: 'Traditional soups and spice mixes' }
  ];

  const dietaryOptions: { id: DietaryFlag; label: string }[] = [
    { id: 'halal', label: 'Halal Certified / Compliant' },
    { id: 'pescatarian', label: 'Pescatarian (Fish & Veg only)' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Strict Vegan (Plant-based)' },
    { id: 'gluten_free', label: 'Gluten-Free' },
    { id: 'dairy_free', label: 'Dairy-Free' },
    { id: 'nut_free', label: 'Nut-Free' }
  ];

  const spiceLevels: { key: SpiceLevel; label: string; desc: string; heat: number }[] = [
    { key: 'none', label: 'No Spice', desc: 'Zero chili or hot pepper', heat: 0 },
    { key: 'mild', label: 'Mild', desc: 'Gentle warmth with full African aroma', heat: 1 },
    { key: 'medium', label: 'Medium', desc: 'Standard authentic home seasoning', heat: 2 },
    { key: 'hot', label: 'Hot (Standard Suya/Pepper Soup)', desc: 'Distinct scotch bonnet / yellow pepper heat', heat: 3 },
    { key: 'extra_hot', label: 'Extra Hot', desc: 'Traditional intense heat levels', heat: 4 }
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    recordTap('Saved customer profile info');
    updateUserProfile({
      name: profileName,
      email: profileEmail,
      phone: profilePhone
    });
    setIsEditProfileModalOpen(false);
  };

  const handleAddAvoidance = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAvoidanceInput.trim()) {
      addDislikedIngredient(newAvoidanceInput.trim());
      setNewAvoidanceInput('');
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLabel || !newAddressStreet) return;
    addSavedLocation({
      label: newAddressLabel,
      address: newAddressStreet,
      city: newAddressCity,
      postcodeOrArea: newAddressArea || `${newAddressCity} area`,
      isDefault: newAddressIsDefault,
      currency: newAddressCity === 'Port Harcourt' ? 'NGN' : 'GBP',
      coordinates: CITY_COORDINATES[newAddressCity] || CITY_COORDINATES['Port Harcourt']
    });
    setNewAddressLabel('');
    setNewAddressStreet('');
    setNewAddressArea('');
    setIsAddAddressModalOpen(false);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber) return;
    const last4 = newCardNumber.replace(/\s/g, '').slice(-4) || '7721';
    setSavedCards(prev => [
      ...prev,
      {
        id: `card_${Date.now()}`,
        last4,
        brand: 'Visa',
        expiry: newCardExpiry || '12/28',
        isDefault: false
      }
    ]);
    setNewCardNumber('');
    setNewCardHolder('');
    setNewCardExpiry('');
    setIsAddCardModalOpen(false);
  };

  const handleResetPreferences = () => {
    recordTap('Reset algorithm preferences to defaults');
    resetPreferencesToDefault();
    setShowResetSuccess(true);
    setTimeout(() => setShowResetSuccess(false), 3000);
  };

  const completedOrders = orders.filter(o => o.status === 'delivered');
  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

  return (
    <div className="space-y-6">
      
      {/* Header Profile Identity Card */}
      <div className="bg-white dark:bg-[#1E1B18] rounded-3xl p-6 sm:p-8 border border-[#EAE4DC] dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#C85C43] text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-sm shrink-0">
            {userProfile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#241A17] dark:text-stone-100 tracking-tight">
                {userProfile.name}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#FAF7F0] dark:bg-stone-800 text-[#807872] dark:text-stone-300 border border-[#EAE4DC] dark:border-stone-700">
                Active Gourmet
              </span>
            </div>
            <div className="text-xs text-[#807872] dark:text-stone-400 mt-1 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#C85C43]" /> {userProfile.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#5F765A]" /> {userProfile.phone}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#807872]" /> {currentLocation.label}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            recordTap('Opened edit customer profile modal');
            setProfileName(userProfile.name);
            setProfileEmail(userProfile.email);
            setProfilePhone(userProfile.phone);
            setIsEditProfileModalOpen(true);
          }}
          className="px-4 py-2 rounded-full border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-[#C85C43]/50 text-[#241A17] dark:text-stone-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors self-start md:self-auto"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Details</span>
        </button>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 border-b border-[#EAE4DC] dark:border-stone-800 scrollbar-none">
        <button
          onClick={() => {
            recordTap('Switched profile tab to taste');
            setActiveTab('taste');
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'taste' 
              ? 'bg-[#241A17] dark:bg-stone-800 text-white shadow-xs' 
              : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-[#C85C43]" />
          <span>Taste & Cuisines</span>
        </button>

        <button
          onClick={() => {
            recordTap('Switched profile tab to safety');
            setActiveTab('safety');
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'safety' 
              ? 'bg-[#241A17] dark:bg-stone-800 text-white shadow-xs' 
              : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>Safety Guard (Allergies)</span>
          {userProfile.safety.allergies.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
              {userProfile.safety.allergies.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            recordTap('Switched profile tab to addresses');
            setActiveTab('addresses');
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'addresses' 
              ? 'bg-[#241A17] dark:bg-stone-800 text-white shadow-xs' 
              : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-[#5F765A]" />
          <span>Saved Addresses ({savedLocations.length})</span>
        </button>

        <button
          onClick={() => {
            recordTap('Switched profile tab to orders');
            setActiveTab('orders');
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'orders' 
              ? 'bg-[#241A17] dark:bg-stone-800 text-white shadow-xs' 
              : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
          <span>Order History ({orders.length})</span>
          {activeOrders.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => {
            recordTap('Switched profile tab to payment');
            setActiveTab('payment');
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'payment' 
              ? 'bg-[#241A17] dark:bg-stone-800 text-white shadow-xs' 
              : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-purple-500" />
          <span>Payment & Wallet</span>
        </button>

        <button
          onClick={() => {
            recordTap('Switched profile tab to settings');
            setActiveTab('settings');
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'settings' 
              ? 'bg-[#241A17] dark:bg-stone-800 text-white shadow-xs' 
              : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-[#807872]" />
          <span>Preferences & Reset</span>
        </button>
      </div>

      {/* TAB 1: TASTE & CUISINES */}
      {activeTab === 'taste' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Cuisines Section */}
          <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-extrabold text-[#241A17] dark:text-stone-100">
                Primary African Culinary Traditions
              </h3>
              <p className="text-xs text-[#807872] dark:text-stone-400 mt-0.5">
                The algorithm prioritizes recommendations matching your selected regional cuisines.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableCuisines.map(cuisine => {
                const isSelected = userProfile.preferences.explicitCuisines.includes(cuisine);
                return (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => toggleCuisine(cuisine)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected 
                        ? 'bg-[#C85C43] text-white shadow-xs' 
                        : 'bg-[#FAF7F0] dark:bg-stone-900 text-[#807872] dark:text-stone-300 border border-[#EAE4DC] dark:border-stone-800 hover:border-[#241A17] dark:hover:border-stone-600'
                    }`}
                  >
                    <span>{cuisine}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spice Level Preference */}
          <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-extrabold text-[#241A17] dark:text-stone-100">
                Spice & Heat Threshold
              </h3>
              <p className="text-xs text-[#807872] dark:text-stone-400 mt-0.5">
                Your preferred heat level for pepper soups, sauces, and suya seasonings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {spiceLevels.map(sp => {
                const isSelected = userProfile.preferences.preferredSpiceLevel === sp.key;
                return (
                  <button
                    key={sp.key}
                    type="button"
                    onClick={() => setSpicePreference(sp.key)}
                    className={`p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all ${
                      isSelected 
                        ? 'bg-[#C85C43]/10 dark:bg-[#C85C43]/20 border-[#C85C43] text-[#C85C43] dark:text-[#E27961] font-bold' 
                        : 'bg-white dark:bg-[#1E1B18] border-[#EAE4DC] dark:border-stone-800 text-[#807872] dark:text-stone-300 hover:border-[#241A17] dark:hover:border-stone-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                        {Array.from({ length: sp.heat }).map((_, i) => (
                          <Flame key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                        {sp.heat === 0 && <span className="text-xs text-[#807872] dark:text-stone-400">Zero Heat</span>}
                      </div>
                      <div className="text-xs font-bold text-[#241A17] dark:text-stone-100">{sp.label}</div>
                      <div className="text-[11px] text-[#807872] dark:text-stone-400 mt-0.5">{sp.desc}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#C85C43] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary Requirements */}
          <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-extrabold text-[#241A17] dark:text-stone-100">
                Dietary Guidelines
              </h3>
              <p className="text-xs text-[#807872] dark:text-stone-400 mt-0.5">
                Only show items that strictly comply with these dietary certifications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {dietaryOptions.map(opt => {
                const isChecked = userProfile.preferences.dietaryFlags.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleDietaryFlag(opt.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isChecked 
                        ? 'bg-[#5F765A]/10 dark:bg-[#5F765A]/20 border-[#5F765A] text-[#5F765A] dark:text-[#7d9b77] font-bold' 
                        : 'bg-white dark:bg-[#1E1B18] border-[#EAE4DC] dark:border-stone-800 text-[#807872] dark:text-stone-300 hover:border-[#241A17] dark:hover:border-stone-600'
                    }`}
                  >
                    <span className="text-xs text-[#241A17] dark:text-stone-100">{opt.label}</span>
                    {isChecked && <Check className="w-3.5 h-3.5 text-[#5F765A] dark:text-[#7d9b77]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Disliked Ingredients & Avoidances */}
          <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-extrabold text-[#241A17] dark:text-stone-100">
                Custom Ingredient Avoidances
              </h3>
              <p className="text-xs text-[#807872] dark:text-stone-400 mt-0.5">
                Dishes containing these specific ingredients will be demoted or filtered out.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {userProfile.preferences.dislikedIngredients.map(item => (
                <span 
                  key={item}
                  className="px-3 py-1.5 rounded-full bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 text-xs font-semibold text-[#241A17] dark:text-stone-200 flex items-center gap-1.5"
                >
                  <span>No {item}</span>
                  <button
                    onClick={() => removeDislikedIngredient(item)}
                    className="w-4 h-4 rounded-full hover:bg-[#EAE4DC] dark:hover:bg-stone-700 flex items-center justify-center text-[#807872] dark:text-stone-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {userProfile.preferences.dislikedIngredients.length === 0 && (
                <span className="text-xs text-[#807872] dark:text-stone-400 italic">No active ingredient avoidances added.</span>
              )}
            </div>

            <form onSubmit={handleAddAvoidance} className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newAvoidanceInput}
                onChange={(e) => setNewAvoidanceInput(e.target.value)}
                placeholder="e.g. Bitterleaf, Offal, Okra, Tripe, Cilantro..."
                className="flex-1 px-4 py-2 rounded-full border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-[#241A17] dark:bg-stone-800 hover:bg-[#382b26] dark:hover:bg-stone-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* TAB 2: SAFETY & ALLERGEN GUARD */}
      {activeTab === 'safety' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-100">
                Hard Safety Constraint Layer (Non-Negotiable)
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300/80 mt-1 leading-relaxed">
                Your safety is absolute. A dish will never be recommended if it contains any allergen you have marked below.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-[#241A17] dark:text-stone-100">
              Allergen Exclusion Guard
            </h3>

            <div className="space-y-2.5">
              {allAllergens.map(item => {
                const isChecked = userProfile.safety.allergies.includes(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleAllergen(item.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isChecked 
                        ? 'bg-red-50/70 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-950 dark:text-red-200 font-semibold' 
                        : 'bg-white dark:bg-[#1E1B18] border-[#EAE4DC] dark:border-stone-800 hover:border-[#807872] text-[#241A17] dark:text-stone-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center gap-2">
                        <span>{item.label}</span>
                        {isChecked && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-200 dark:bg-red-900/60 text-red-800 dark:text-red-300 uppercase font-black">
                            Strictly Excluded
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#807872] dark:text-stone-400 mt-0.5">{item.desc}</div>
                    </div>
                    {isChecked ? (
                      <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-[#D6CFC7] dark:border-stone-700 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delivery & Packaging Safety Note */}
          <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-[#241A17] dark:text-stone-100">
              Kitchen Safety & Packaging Instructions
            </h3>
            <p className="text-xs text-[#807872] dark:text-stone-400">
              This note is automatically pinned to every order sent to the restaurant kitchen.
            </p>
            <textarea
              rows={3}
              value={userProfile.safety.notes}
              onChange={(e) => updateSafetyNotes(e.target.value)}
              placeholder="e.g. Please use fresh cooking oil and ensure tamper-evident seals are intact."
              className="w-full p-3.5 rounded-2xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
            />
          </div>

        </div>
      )}

      {/* TAB 3: SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#241A17] dark:text-stone-100">
                Delivery Locations
              </h3>
              <p className="text-xs text-[#807872] dark:text-stone-400">
                Switch location anytime to simulate delivery times, dynamic delivery fees, and currencies.
              </p>
            </div>
            <button
              onClick={() => setIsAddAddressModalOpen(true)}
              className="px-4 py-2 rounded-full bg-[#C85C43] hover:bg-[#B44F37] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedLocations.map(loc => {
              const isSelected = loc.id === currentLocation.id;
              return (
                <div 
                  key={loc.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-white dark:bg-[#1E1B18] border-[#C85C43] shadow-md ring-2 ring-[#C85C43]/20' 
                      : 'bg-white dark:bg-[#1E1B18] border-[#EAE4DC] dark:border-stone-800'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#C85C43]' : 'text-[#807872]'}`} />
                        <h4 className="font-bold text-sm text-[#241A17] dark:text-stone-100">{loc.label}</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7F0] dark:bg-stone-800 text-[#807872] dark:text-stone-300">
                          {loc.city} ({loc.currency})
                        </span>
                        {loc.isDefault && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5F765A]/15 text-[#5F765A] dark:text-[#88a881]">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-[#807872] dark:text-stone-400 mb-1">{loc.address}</p>
                    <p className="text-[11px] text-[#807872] dark:text-stone-400">{loc.postcodeOrArea}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#F0EAE1] dark:border-stone-800">
                    {isSelected ? (
                      <span className="text-xs font-bold text-[#C85C43] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active Location
                      </span>
                    ) : (
                      <button
                        onClick={() => selectLocation(loc.id)}
                        className="text-xs font-bold text-[#241A17] dark:text-stone-300 hover:text-[#C85C43] transition-colors"
                      >
                        Set as Active
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      {!loc.isDefault && (
                        <button
                          onClick={() => setDefaultLocation(loc.id)}
                          className="text-[11px] text-[#807872] hover:text-[#241A17] dark:hover:text-stone-200"
                        >
                          Make Default
                        </button>
                      )}
                      {savedLocations.length > 1 && (
                        <button
                          onClick={() => deleteSavedLocation(loc.id)}
                          className="p-1 text-[#807872] hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 4: ORDER HISTORY */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#241A17] dark:text-stone-100">
                Past Deliveries & Orders
              </h3>
              <p className="text-xs text-[#807872] dark:text-stone-400">
                Your past orders reinforce the engine's learning of your flavor preferences.
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1B18] p-10 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-[#807872] mx-auto opacity-40" />
              <h4 className="font-bold text-sm text-[#241A17] dark:text-stone-100">No orders placed yet</h4>
              <p className="text-xs text-[#807872] dark:text-stone-400 max-w-sm mx-auto">
                Explore personalized meal recommendations or use Discovery Mode to place your first order.
              </p>
              <button
                onClick={() => setCurrentView('home')}
                className="px-5 py-2 rounded-full bg-[#C85C43] text-white text-xs font-bold shadow-xs hover:bg-[#B44F37]"
              >
                Discover Dishes
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div 
                  key={order.id}
                  className="bg-white dark:bg-[#1E1B18] p-5 sm:p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EAE4DC] dark:border-stone-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-[#241A17] dark:text-stone-100">
                          Order #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          order.status === 'delivered'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#807872] dark:text-stone-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} · Delivered to {order.deliveryAddress?.label || 'Home'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-sm text-[#241A17] dark:text-stone-100">
                        {order.currency === 'GBP' ? '£' : '₦'}{(order.total ?? 0).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-[#807872] dark:text-stone-400 block capitalize">
                        {order.fulfillmentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#C85C43]">{item.quantity}x</span>
                          <span className="font-semibold text-[#241A17] dark:text-stone-200">{item.mealName}</span>
                          <span className="text-[11px] text-[#807872] dark:text-stone-400">({item.restaurantName})</span>
                        </div>
                        <span className="font-medium text-[#241A17] dark:text-stone-300">
                          {order.currency === 'GBP' ? '£' : '₦'}{(item.unitPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Rating / Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#EAE4DC] dark:border-stone-800">
                    <div className="flex items-center gap-1.5 text-xs text-[#807872] dark:text-stone-400">
                      {order.rating ? (
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>Rated {order.rating.foodRating}/5</span>
                        </div>
                      ) : (
                        <span>Delivered safely with tamper seals intact</span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        recordTap('Tracked order from profile history');
                        setActiveOrder(order);
                      }}
                      className="text-xs font-bold text-[#C85C43] hover:underline flex items-center gap-1"
                    >
                      <span>View Receipt & Tracking</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 5: PAYMENT & WALLET */}
      {activeTab === 'payment' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#241A17] dark:text-stone-100">
                Payment Cards & Digital Wallets
              </h3>
              <p className="text-xs text-[#807872] dark:text-stone-400">
                Supports local NGN cards (Paystack / Flutterwave) and UK GBP cards (Stripe / Apple Pay).
              </p>
            </div>
            <button
              onClick={() => setIsAddCardModalOpen(true)}
              className="px-4 py-2 rounded-full bg-[#241A17] dark:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Card</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedCards.map(card => (
              <div 
                key={card.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#1E1B18] border border-[#EAE4DC] dark:border-stone-800 shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 flex items-center justify-center font-bold text-[#241A17] dark:text-stone-100 border border-[#EAE4DC] dark:border-stone-800">
                    <CreditCard className="w-5 h-5 text-[#C85C43]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#241A17] dark:text-stone-100">
                        •••• •••• •••• {card.last4}
                      </span>
                      {card.isDefault && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5F765A]/15 text-[#5F765A] dark:text-[#88a881]">
                          Primary
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#807872] dark:text-stone-400">
                      {card.brand} · Expires {card.expiry}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSavedCards(prev => prev.filter(c => c.id !== card.id))}
                  className="p-1 text-[#807872] hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 6: PREFERENCES & RESET */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Theme & Display */}
          <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-[#241A17] dark:text-stone-100">
              Appearance & Atmosphere
            </h3>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800">
              <div>
                <span className="font-bold text-xs text-[#241A17] dark:text-stone-100 block">Theme Mode</span>
                <span className="text-[11px] text-[#807872] dark:text-stone-400">Switch between light ochre canvas and twilight dark mode.</span>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-full border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-bold flex items-center gap-2 shadow-2xs"
              >
                {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-[#807872]" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                <span className="capitalize">{theme} Mode</span>
              </button>
            </div>
          </div>

          {/* Algorithm Learning & Reset */}
          <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C85C43]" />
              <h3 className="text-base font-extrabold text-[#241A17] dark:text-stone-100">
                Recommendation Algorithm Memory
              </h3>
            </div>
            <p className="text-xs text-[#807872] dark:text-stone-400 leading-relaxed">
              Ounjé's personalized recommendation engine adapts based on your skip reasons, time-of-day orders, and ratings. If you want a fresh culinary slate, you can reset all learned preferences below without deleting your saved addresses or account credentials.
            </p>

            {showResetSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Preferences and learning memory successfully reset to defaults!</span>
              </div>
            )}

            <button
              onClick={handleResetPreferences}
              className="px-5 py-2.5 rounded-full border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Taste Engine to Default State</span>
            </button>
          </div>

        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1B18] rounded-3xl max-w-md w-full border border-[#EAE4DC] dark:border-stone-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#EAE4DC] dark:border-stone-800 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#241A17] dark:text-stone-100">
                Edit Personal Information
              </h3>
              <button onClick={() => setIsEditProfileModalOpen(false)}>
                <X className="w-4 h-4 text-[#807872]" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
                />
              </div>

              <div>
                <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
                />
              </div>

              <div>
                <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#EAE4DC] dark:border-stone-700 font-semibold text-[#807872] dark:text-stone-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#C85C43] text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {isAddAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1B18] rounded-3xl max-w-md w-full border border-[#EAE4DC] dark:border-stone-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#EAE4DC] dark:border-stone-800 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#241A17] dark:text-stone-100">
                Add New Delivery Address
              </h3>
              <button onClick={() => setIsAddAddressModalOpen(false)}>
                <X className="w-4 h-4 text-[#807872]" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Label (e.g. Home, Office, Gym)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apartment, Work Hub"
                  value={newAddressLabel}
                  onChange={(e) => setNewAddressLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
                />
              </div>

              <div>
                <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">City / Expansion Pilot</label>
                <select
                  value={newAddressCity}
                  onChange={(e) => setNewAddressCity(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
                >
                  <option value="Port Harcourt">Port Harcourt, Nigeria (₦ NGN)</option>
                  <option value="London">London, United Kingdom (£ GBP)</option>
                  <option value="Manchester">Manchester, United Kingdom (£ GBP)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot 18, Peter Odili Road"
                  value={newAddressStreet}
                  onChange={(e) => setNewAddressStreet(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
                />
              </div>

              <div>
                <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Area / Postcode</label>
                <input
                  type="text"
                  placeholder="e.g. Trans-Amadi or SE15 4RZ"
                  value={newAddressArea}
                  onChange={(e) => setNewAddressArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAddressIsDefault}
                  onChange={(e) => setNewAddressIsDefault(e.target.checked)}
                  className="rounded text-[#C85C43] focus:ring-0"
                />
                <span className="font-medium text-[#241A17] dark:text-stone-300">Set as my default delivery location</span>
              </label>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAddressModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#EAE4DC] dark:border-stone-700 font-semibold text-[#807872] dark:text-stone-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#C85C43] text-white font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {isAddCardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1B18] rounded-3xl max-w-md w-full border border-[#EAE4DC] dark:border-stone-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#EAE4DC] dark:border-stone-800 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#241A17] dark:text-stone-100">
                Add Payment Card
              </h3>
              <button onClick={() => setIsAddCardModalOpen(false)}>
                <X className="w-4 h-4 text-[#807872]" />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="Name as it appears on card"
                  value={newCardHolder}
                  onChange={(e) => setNewCardHolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
                />
              </div>

              <div>
                <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="•••• •••• •••• ••••"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={newCardExpiry}
                    onChange={(e) => setNewCardExpiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Security Code (CVV)</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="123"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCardModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#EAE4DC] dark:border-stone-700 font-semibold text-[#807872] dark:text-stone-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#241A17] dark:bg-stone-800 text-white font-bold"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
