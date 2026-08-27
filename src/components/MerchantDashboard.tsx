import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Store, 
  CheckCircle2, 
  Clock, 
  Power, 
  ChefHat, 
  Package, 
  TrendingUp, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck,
  Plus,
  Minus,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  Bell,
  Check,
  ArrowRight,
  Phone,
  MapPin,
  Truck,
  Volume2
} from 'lucide-react';
import { OrderStatus, Meal } from '../types';

export const MerchantDashboard: React.FC = () => {
  const {
    merchantRestaurants,
    activeMerchantRestaurantId,
    setActiveMerchantRestaurantId,
    allMeals,
    toggleMealAvailability,
    updateMealStock,
    batchStockUpMeals,
    toggleRestaurantOpenStatus,
    toggleOrderAcceptanceMode,
    updateRestaurantDetails,
    updateOrderStatus,
    orders,
    currentLocation,
    recordTap
  } = useApp();

  const [activeTab, setActiveTab] = useState<'queue' | 'inventory' | 'settings' | 'analytics'>('inventory');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [kitchenAlertSound, setKitchenAlertSound] = useState(true);
  const [stockSuccessMessage, setStockSuccessMessage] = useState<string | null>(null);

  const activeRestaurant = merchantRestaurants.find(r => r.id === activeMerchantRestaurantId) || merchantRestaurants[0];
  const restaurantMeals = allMeals.filter(m => m.restaurantId === activeRestaurant.id);
  const activeOrdersForRest = orders.filter(o => o.restaurantId === activeRestaurant.id);

  const currency = currentLocation.currency;

  const showFeedback = (msg: string) => {
    setStockSuccessMessage(msg);
    setTimeout(() => setStockSuccessMessage(null), 3000);
  };

  // Filter meals for stock tab
  const filteredMeals = restaurantMeals.filter(m => {
    const stock = m.stockCount ?? 20;
    if (stockFilter === 'in_stock') return m.isAvailable && stock > 5;
    if (stockFilter === 'low_stock') return m.isAvailable && stock <= 5 && stock > 0;
    if (stockFilter === 'out_of_stock') return !m.isAvailable || stock === 0;
    return true;
  });

  const lowStockCount = restaurantMeals.filter(m => (m.stockCount ?? 20) <= 5 && (m.stockCount ?? 20) > 0).length;
  const outOfStockCount = restaurantMeals.filter(m => !m.isAvailable || (m.stockCount ?? 20) === 0).length;

  return (
    <div id="merchant-dashboard-view" className="py-6 sm:py-10 max-w-6xl mx-auto px-4 sm:px-6">
      
      {/* Top Notification Banner if Action Performed */}
      {stockSuccessMessage && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{stockSuccessMessage}</span>
          </div>
          <button 
            onClick={() => setStockSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 font-black text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Header & Restaurant Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white dark:bg-[#1E1B18] p-5 sm:p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-[#EAE4DC] dark:border-stone-700 shrink-0">
            <img 
              src={activeRestaurant.logo} 
              alt={activeRestaurant.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-[#241A17] dark:text-stone-100">
                {activeRestaurant.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#5F765A]/15 text-[#5F765A] dark:text-[#7d9b77] text-xs font-bold">
                {activeRestaurant.city}
              </span>
            </div>
            <p className="text-xs text-[#807872] dark:text-stone-400 mt-0.5 max-w-md truncate">
              {activeRestaurant.tagline}
            </p>
          </div>
        </div>

        {/* Restaurant selector dropdown */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <label className="text-xs text-[#807872] dark:text-stone-400 font-semibold">Active Kitchen:</label>
          <select
            id="merchant-restaurant-select"
            value={activeMerchantRestaurantId}
            onChange={(e) => {
              recordTap(`Switched merchant view to ${e.target.value}`);
              setActiveMerchantRestaurantId(e.target.value);
              showFeedback(`Switched workspace to ${merchantRestaurants.find(r => r.id === e.target.value)?.name}`);
            }}
            className="px-3 py-2 bg-[#FAF7F0] dark:bg-stone-900 rounded-xl border border-[#EAE4DC] dark:border-stone-700 text-xs font-bold text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
          >
            {merchantRestaurants.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Operating Status & Kitchen Controls Strip ("Operating Seamlessly") */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        
        {/* Open / Busy Rush / Paused Status */}
        <div className="bg-white dark:bg-[#1E1B18] p-4 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] text-[#807872] dark:text-stone-400 font-bold block uppercase tracking-wider">
              Kitchen Operating Status
            </span>
            <span className={`text-xs font-black flex items-center gap-1.5 mt-1 ${
              activeRestaurant.isOpen 
                ? (activeRestaurant.isBusyMode ? 'text-amber-600 dark:text-amber-400' : 'text-[#5F765A] dark:text-[#7d9b77]') 
                : 'text-red-600 dark:text-red-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                activeRestaurant.isOpen 
                  ? (activeRestaurant.isBusyMode ? 'bg-amber-500 animate-ping' : 'bg-[#5F765A] animate-pulse') 
                  : 'bg-red-500'
              }`} />
              {activeRestaurant.isOpen 
                ? (activeRestaurant.isBusyMode ? 'Busy Rush (+15m Buffer)' : 'Open & Taking Orders') 
                : 'Store Paused (Closed)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const nextBusy = !activeRestaurant.isBusyMode;
                updateRestaurantDetails(activeRestaurant.id, { 
                  isBusyMode: nextBusy,
                  prepBufferMinutes: nextBusy ? 15 : 0 
                });
                showFeedback(nextBusy ? 'Enabled Kitchen Rush (+15m Prep Buffer added)' : 'Returned to Standard Prep Time');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors ${
                activeRestaurant.isBusyMode
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300'
                  : 'bg-[#FAF7F0] dark:bg-stone-800 text-[#807872] dark:text-stone-300 border-[#EAE4DC] dark:border-stone-700 hover:border-amber-400'
              }`}
              title="Toggle rush hour extra preparation buffer"
            >
              Rush Mode
            </button>

            <button
              onClick={() => {
                toggleRestaurantOpenStatus(activeRestaurant.id);
                showFeedback(activeRestaurant.isOpen ? 'Kitchen marked as Closed' : 'Kitchen opened for live orders');
              }}
              className={`p-2 rounded-xl border transition-colors ${
                activeRestaurant.isOpen 
                  ? 'bg-red-50 dark:bg-red-950/40 text-red-600 border-red-200 hover:bg-red-100' 
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
              title="Toggle store open/closed"
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Order Acceptance Mode */}
        <div className="bg-white dark:bg-[#1E1B18] p-4 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] text-[#807872] dark:text-stone-400 font-bold block uppercase tracking-wider">
              Order Ingestion Mode
            </span>
            <span className="text-xs font-black text-[#241A17] dark:text-stone-100 mt-1 block">
              {activeRestaurant.orderAcceptanceMode === 'auto' ? '⚡ Instant Auto-Accept' : '✍️ Chef Manual Review'}
            </span>
          </div>

          <button
            onClick={() => {
              toggleOrderAcceptanceMode(activeRestaurant.id);
              showFeedback(`Changed order acceptance to ${activeRestaurant.orderAcceptanceMode === 'auto' ? 'Manual Confirmation' : 'Auto-Accept'}`);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-700 hover:border-[#C85C43] text-xs font-bold text-[#241A17] dark:text-stone-200 transition-colors"
          >
            Switch
          </button>
        </div>

        {/* Stock Overview Quick Metric */}
        <div className="bg-[#FAF7F0] dark:bg-stone-900 p-4 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold text-[#807872] dark:text-stone-400 uppercase tracking-wider block">
              Live Stock Status
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-extrabold text-[#5F765A] dark:text-[#7d9b77]">
                {restaurantMeals.length - outOfStockCount} in stock
              </span>
              {lowStockCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                  {lowStockCount} low
                </span>
              )}
              {outOfStockCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-[10px] font-bold">
                  {outOfStockCount} sold out
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              batchStockUpMeals(activeRestaurant.id, 30);
              showFeedback('Restocked all dishes to 30 portions for fresh morning/lunch service!');
            }}
            className="px-3 py-1.5 rounded-xl bg-[#C85C43] hover:bg-[#B44F37] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Batch Restock</span>
          </button>
        </div>

      </div>

      {/* Main Feature Navigation Tabs */}
      <div className="flex border-b border-[#EAE4DC] dark:border-stone-800 gap-2 sm:gap-6 mb-6 text-xs font-bold overflow-x-auto pb-1">
        <button
          onClick={() => {
            recordTap('Viewed merchant inventory tab');
            setActiveTab('inventory');
          }}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'inventory' ? 'border-[#C85C43] text-[#C85C43]' : 'border-transparent text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Stock Up & Inventory ({restaurantMeals.length})</span>
        </button>

        <button
          onClick={() => {
            recordTap('Viewed merchant orders tab');
            setActiveTab('queue');
          }}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'queue' ? 'border-[#C85C43] text-[#C85C43]' : 'border-transparent text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Live Kitchen Tickets ({activeOrdersForRest.length})</span>
        </button>

        <button
          onClick={() => {
            recordTap('Viewed merchant settings tab');
            setActiveTab('settings');
          }}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'settings' ? 'border-[#C85C43] text-[#C85C43]' : 'border-transparent text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Restaurant Details & Hours</span>
        </button>

        <button
          onClick={() => {
            recordTap('Viewed merchant analytics tab');
            setActiveTab('analytics');
          }}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'analytics' ? 'border-[#C85C43] text-[#C85C43]' : 'border-transparent text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Personalization Analytics</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY & STOCK-UP ENGINE ("How to Stock Up") */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          
          {/* Quick Operations Guide Box */}
          <div className="p-4 bg-white dark:bg-[#1E1B18] rounded-2xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-black text-[#241A17] dark:text-stone-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C85C43]" />
                <span>How Stocking Up Works in Ounjé</span>
              </h3>
              <p className="text-xs text-[#807872] dark:text-stone-400 mt-1 max-w-xl">
                When you cook a pot of soup, suya skewers, or jollof rice, set the portion count below. When stock reaches 0, the dish is automatically <strong>86'd</strong> (hidden from top recommendations) so hungry customers never experience cancelled orders.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  batchStockUpMeals(activeRestaurant.id, 25);
                  showFeedback('Stocked all dishes with +25 fresh portions');
                }}
                className="px-3.5 py-2 rounded-xl bg-[#5F765A] hover:bg-[#4E624A] text-white text-xs font-extrabold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+25 All Dishes</span>
              </button>
            </div>
          </div>

          {/* Stock Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                stockFilter === 'all'
                  ? 'bg-[#241A17] dark:bg-stone-700 text-white'
                  : 'bg-white dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 text-[#807872] dark:text-stone-400'
              }`}
            >
              All Dishes ({restaurantMeals.length})
            </button>

            <button
              onClick={() => setStockFilter('in_stock')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                stockFilter === 'in_stock'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 text-[#807872] dark:text-stone-400'
              }`}
            >
              In Stock ({restaurantMeals.filter(m => m.isAvailable && (m.stockCount ?? 20) > 5).length})
            </button>

            <button
              onClick={() => setStockFilter('low_stock')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                stockFilter === 'low_stock'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 text-[#807872] dark:text-stone-400'
              }`}
            >
              Low Stock (&le;5) ({lowStockCount})
            </button>

            <button
              onClick={() => setStockFilter('out_of_stock')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                stockFilter === 'out_of_stock'
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 text-[#807872] dark:text-stone-400'
              }`}
            >
              86'd / Sold Out ({outOfStockCount})
            </button>
          </div>

          {/* Dish Inventory Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMeals.map(meal => {
              const stock = meal.stockCount ?? 20;
              const isDepleted = !meal.isAvailable || stock <= 0;
              const isLow = meal.isAvailable && stock > 0 && stock <= 5;

              return (
                <div
                  key={meal.id}
                  id={`dish-stock-${meal.id}`}
                  className={`bg-white dark:bg-[#1E1B18] p-5 rounded-2xl border transition-all shadow-2xs flex flex-col justify-between ${
                    isDepleted 
                      ? 'border-red-200 dark:border-red-900/50 bg-red-50/20' 
                      : (isLow ? 'border-amber-200 dark:border-amber-900/50' : 'border-[#EAE4DC] dark:border-stone-800')
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 relative">
                      <img
                        src={meal.image}
                        alt={meal.name}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover ${isDepleted ? 'grayscale opacity-75' : ''}`}
                      />
                      {isDepleted && (
                        <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center text-white font-black text-[10px] uppercase">
                          86'd
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-extrabold text-xs sm:text-sm text-[#241A17] dark:text-stone-100 truncate">
                          {meal.name}
                        </h4>
                        <span className="font-black text-xs text-[#241A17] dark:text-stone-100 shrink-0">
                          {currency === 'NGN' ? `₦${meal.priceNGN.toLocaleString()}` : `£${meal.priceGBP.toFixed(2)}`}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-[#807872] dark:text-stone-400 mt-0.5">
                        {meal.category} · {meal.prepTimeMinutes} min cook
                      </p>

                      {/* Stock Badge */}
                      <div className="flex items-center gap-2 mt-2">
                        {isDepleted ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[10px] font-extrabold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Sold Out (0 portions)
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Low Stock ({stock} portions left)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {stock} Portions Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stock Actions Controls */}
                  <div className="mt-4 pt-3 border-t border-[#F0EAE1] dark:border-stone-800 flex items-center justify-between gap-2 flex-wrap text-xs">
                    {/* Incremental Controls */}
                    <div className="flex items-center gap-1 bg-[#FAF7F0] dark:bg-stone-900 p-1 rounded-xl border border-[#EAE4DC] dark:border-stone-700">
                      <button
                        onClick={() => {
                          updateMealStock(meal.id, -1);
                        }}
                        disabled={stock <= 0}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-stone-800 flex items-center justify-center font-black text-[#241A17] dark:text-stone-200 disabled:opacity-30 hover:bg-stone-200 transition-colors"
                        title="Reduce 1 portion"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="px-2 font-black text-xs min-w-[28px] text-center">
                        {stock}
                      </span>

                      <button
                        onClick={() => {
                          updateMealStock(meal.id, 1);
                        }}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-stone-800 flex items-center justify-center font-black text-[#241A17] dark:text-stone-200 hover:bg-stone-200 transition-colors"
                        title="Add 1 portion"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Quick Restock Pills */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          updateMealStock(meal.id, 5);
                          showFeedback(`Added +5 portions to ${meal.name}`);
                        }}
                        className="px-2 py-1 rounded-lg bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-700 font-bold hover:border-[#C85C43] transition-colors text-[11px]"
                      >
                        +5
                      </button>

                      <button
                        onClick={() => {
                          updateMealStock(meal.id, 15);
                          showFeedback(`Added +15 pot batch to ${meal.name}`);
                        }}
                        className="px-2 py-1 rounded-lg bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-700 font-bold hover:border-[#C85C43] transition-colors text-[11px]"
                      >
                        +15 Pot
                      </button>

                      {/* 86 Toggle Button */}
                      <button
                        onClick={() => {
                          toggleMealAvailability(meal.id);
                          showFeedback(meal.isAvailable ? `86'd ${meal.name} (marked Sold Out)` : `Restocked ${meal.name}`);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] transition-colors ${
                          meal.isAvailable 
                            ? 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/60 dark:text-red-300' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {meal.isAvailable ? "86 Dish" : "Restock"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 2: LIVE KITCHEN QUEUE & PROGRESSION */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="p-3 bg-white dark:bg-[#1E1B18] rounded-2xl border border-[#EAE4DC] dark:border-stone-800 text-xs flex items-center justify-between">
            <span className="text-[#807872] dark:text-stone-400">
              Kitchen Audio Notifications:
            </span>
            <button
              onClick={() => setKitchenAlertSound(!kitchenAlertSound)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs ${
                kitchenAlertSound 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                  : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{kitchenAlertSound ? 'Sound Alert On' : 'Muted'}</span>
            </button>
          </div>

          {activeOrdersForRest.length > 0 ? (
            activeOrdersForRest.map(order => (
              <div
                key={order.id}
                id={`kitchen-order-${order.id}`}
                className="bg-white dark:bg-[#1E1B18] p-5 sm:p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs space-y-4"
              >
                {/* Header with status badge */}
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1] dark:border-stone-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#C85C43]">
                        Order #{order.orderNumber}
                      </span>
                      <span className="text-[10px] text-[#807872] dark:text-stone-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-[#241A17] dark:text-stone-100 mt-0.5">
                      {order.fulfillmentMethod === 'delivery' ? '🛵 Fast Delivery' : '🛍️ Customer Pickup'}
                    </h3>
                  </div>

                  <span className={`px-3 py-1 rounded-full font-extrabold text-xs capitalize ${
                    order.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : order.status === 'on_the_way'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      : order.status === 'ready'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-[#5F765A]/15 text-[#5F765A] dark:text-[#7d9b77]'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Items & Allergen Warning Banner */}
                <div className="space-y-2 text-xs">
                  {order.items.map(item => {
                    const hasAllergens = item.meal.allergens.length > 0;

                    return (
                      <div key={item.id} className="p-3 bg-[#FAF7F0] dark:bg-stone-900 rounded-xl space-y-1">
                        <div className="flex justify-between font-bold text-[#241A17] dark:text-stone-100">
                          <span>{item.quantity}x {item.meal.name}</span>
                          <span>
                            {order.currency === 'NGN' ? `₦${(item.itemPrice * item.quantity).toLocaleString()}` : `£${(item.itemPrice * item.quantity).toFixed(2)}`}
                          </span>
                        </div>

                        {/* Customizations */}
                        {item.selectedCustomizations.length > 0 && (
                          <p className="text-[11px] text-[#807872] dark:text-stone-400">
                            Customizations: {item.selectedCustomizations.map(c => c.name).join(', ')}
                          </p>
                        )}

                        {/* Customer Instructions */}
                        {item.specialInstructions && (
                          <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded">
                            Note from Customer: "{item.specialInstructions}"
                          </p>
                        )}

                        {/* Allergen Flag on Ticket */}
                        {hasAllergens && (
                          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-red-600 dark:text-red-400 pt-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Kitchen Warning: Contains {item.meal.allergens.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Destination & Handoff Info */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F0EAE1] dark:border-stone-800">
                  <div className="text-[#807872] dark:text-stone-400">
                    <div>Dropoff: <strong>{order.deliveryAddress.label}</strong> ({order.deliveryAddress.address})</div>
                    {order.driverName && (
                      <div className="text-[11px] text-[#5F765A] dark:text-[#7d9b77] mt-0.5 font-bold">
                        Courier: {order.driverName} ({order.driverPhone})
                      </div>
                    )}
                  </div>
                  
                  <span className="text-sm font-black text-[#241A17] dark:text-stone-100">
                    Total: {order.currency === 'NGN' ? `₦${order.total.toLocaleString()}` : `£${order.total.toFixed(2)}`}
                  </span>
                </div>

                {/* Kitchen Status Progression Workflow */}
                <div className="pt-2 flex items-center gap-2 flex-wrap">
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(order.id, 'preparing');
                        showFeedback(`Order #${order.orderNumber} marked as PREPARING in kitchen`);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#5F765A] hover:bg-[#4E624A] text-white text-xs font-black flex items-center gap-1.5 transition-colors"
                    >
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Start Cooking & Prep</span>
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(order.id, 'ready');
                        showFeedback(`Order #${order.orderNumber} marked READY for Courier Pickup`);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black flex items-center gap-1.5 transition-colors"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Mark Ready for Pickup</span>
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(order.id, 'on_the_way');
                        showFeedback(`Order #${order.orderNumber} handed to Courier ${order.driverName || 'Rider'}`);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#241A17] dark:bg-stone-700 text-white text-xs font-black flex items-center gap-1.5 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Handed to Courier</span>
                    </button>
                  )}

                  {order.status === 'on_the_way' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(order.id, 'delivered');
                        showFeedback(`Order #${order.orderNumber} completed`);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Delivered</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#1E1B18] rounded-3xl border border-[#EAE4DC] dark:border-stone-800 p-8">
              <ChefHat className="w-10 h-10 text-[#807872] dark:text-stone-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#241A17] dark:text-stone-100">
                Kitchen queue is clear!
              </h3>
              <p className="text-xs text-[#807872] dark:text-stone-400 mt-1 max-w-sm mx-auto">
                Incoming orders from hungry diners in {activeRestaurant.city} will show here with real-time allergen flags and preparation steps.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RESTAURANT PROFILE & DETAILS EDITOR */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs space-y-5">
            <div>
              <h3 className="text-sm font-black text-[#241A17] dark:text-stone-100">
                Restaurant Transparency & Public Profile
              </h3>
              <p className="text-xs text-[#807872] dark:text-stone-400 mt-0.5">
                These operational details are surfaced to customers on food discovery cards, allergen modals, and checkout verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#241A17] dark:text-stone-200">Operating Hours</label>
                <input
                  type="text"
                  value={activeRestaurant.operatingHours}
                  onChange={(e) => updateRestaurantDetails(activeRestaurant.id, { operatingHours: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-700 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#241A17] dark:text-stone-200">Kitchen Contact Phone</label>
                <input
                  type="text"
                  value={activeRestaurant.phone || '+234 800 123 4567'}
                  onChange={(e) => updateRestaurantDetails(activeRestaurant.id, { phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-700 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#241A17] dark:text-stone-200">Base Delivery Fee ({currency})</label>
                <input
                  type="number"
                  value={currency === 'NGN' ? activeRestaurant.deliveryFeeNGN : activeRestaurant.deliveryFeeGBP}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    if (currency === 'NGN') {
                      updateRestaurantDetails(activeRestaurant.id, { deliveryFeeNGN: val });
                    } else {
                      updateRestaurantDetails(activeRestaurant.id, { deliveryFeeGBP: val });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-700 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#241A17] dark:text-stone-200">Minimum Order Threshold ({currency})</label>
                <input
                  type="number"
                  value={currency === 'NGN' ? activeRestaurant.minimumOrderNGN : activeRestaurant.minimumOrderGBP}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    if (currency === 'NGN') {
                      updateRestaurantDetails(activeRestaurant.id, { minimumOrderNGN: val });
                    } else {
                      updateRestaurantDetails(activeRestaurant.id, { minimumOrderGBP: val });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-700 font-medium"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-[#241A17] dark:text-stone-200">Food Hygiene & Safety Certification</label>
                <input
                  type="text"
                  value={activeRestaurant.hygieneRating || 'Rivers State Certified Clean Kitchen (Grade A)'}
                  onChange={(e) => updateRestaurantDetails(activeRestaurant.id, { hygieneRating: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-700 font-medium"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-[#241A17] dark:text-stone-200">Allergen Segregation Pledge</label>
                <textarea
                  rows={2}
                  value={activeRestaurant.allergenPledge || 'Separate grill stations for fish and nuts. Fresh palm oil batch every morning.'}
                  onChange={(e) => updateRestaurantDetails(activeRestaurant.id, { allergenPledge: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-700 font-medium"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => showFeedback('Saved restaurant operational settings')}
                className="px-5 py-2 rounded-xl bg-[#241A17] dark:bg-stone-700 text-white text-xs font-bold shadow-xs hover:bg-black transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#1E1B18] p-5 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs">
              <span className="text-xs text-[#807872] dark:text-stone-400 font-semibold block">Personalized Order Conversion</span>
              <span className="text-2xl sm:text-3xl font-black text-[#C85C43] mt-1 block">74.2%</span>
              <span className="text-[11px] text-[#5F765A] dark:text-[#7d9b77] font-semibold">vs 18% generic directory average</span>
            </div>

            <div className="bg-white dark:bg-[#1E1B18] p-5 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs">
              <span className="text-xs text-[#807872] dark:text-stone-400 font-semibold block">Average Customer Match Affinity</span>
              <span className="text-2xl sm:text-3xl font-black text-[#5F765A] dark:text-[#7d9b77] mt-1 block">96.8 / 100</span>
              <span className="text-[11px] text-[#807872] dark:text-stone-400">Zero allergen rejections this week</span>
            </div>

            <div className="bg-white dark:bg-[#1E1B18] p-5 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs">
              <span className="text-xs text-[#807872] dark:text-stone-400 font-semibold block">Repeat Customer Loyalty Rate</span>
              <span className="text-2xl sm:text-3xl font-black text-[#241A17] dark:text-stone-100 mt-1 block">48.5%</span>
              <span className="text-[11px] text-[#5F765A] dark:text-[#7d9b77] font-semibold">+14% month-over-month</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
