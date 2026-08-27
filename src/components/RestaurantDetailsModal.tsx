import React from 'react';
import { 
  Restaurant 
} from '../types';
import { 
  X, 
  MapPin, 
  Clock, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Award,
  Truck,
  ShoppingBag,
  Star
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface RestaurantDetailsModalProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RestaurantDetailsModal: React.FC<RestaurantDetailsModalProps> = ({
  restaurant,
  isOpen,
  onClose
}) => {
  const { currentLocation, allMeals, setSelectedMeal, recordTap } = useApp();

  if (!isOpen || !restaurant) return null;

  const restaurantMeals = allMeals.filter(m => m.restaurantId === restaurant.id);
  const currency = currentLocation.currency;

  return (
    <div 
      id="restaurant-details-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="restaurant-details-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1E1B18] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-[#EAE4DC] dark:border-stone-800 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Banner Hero */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-stone-900 shrink-0">
          <img 
            src={restaurant.image} 
            alt={restaurant.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Restaurant Header Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-white dark:bg-stone-800 p-0.5 border-2 border-white/80 shadow-md shrink-0">
                <img 
                  src={restaurant.logo} 
                  alt={restaurant.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black leading-tight">
                    {restaurant.name}
                  </h2>
                  {restaurant.verified && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-200 mt-0.5 line-clamp-1">
                  {restaurant.tagline}
                </p>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1.5 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-black">{restaurant.rating.toFixed(1)}</span>
              <span className="text-[10px] text-stone-300">({restaurant.reviewCount})</span>
            </div>
          </div>
        </div>

        {/* Scrollable Information Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-[#241A17] dark:text-stone-200">
          
          {/* Operational Status & Key Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#FAF7F0] dark:bg-stone-900 p-3 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#807872] dark:text-stone-400 block">Status</span>
              <span className={`text-xs font-black mt-1 inline-flex items-center gap-1 ${restaurant.isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${restaurant.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                {restaurant.isOpen ? (restaurant.isBusyMode ? 'Busy Rush (+15m)' : 'Open Now') : 'Closed'}
              </span>
            </div>

            <div className="bg-[#FAF7F0] dark:bg-stone-900 p-3 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#807872] dark:text-stone-400 block">Est. Prep & Delivery</span>
              <span className="text-xs font-black text-[#241A17] dark:text-stone-100 mt-1 block">
                {restaurant.estimatedDeliveryMin}–{restaurant.estimatedDeliveryMax + (restaurant.prepBufferMinutes || 0)} mins
              </span>
            </div>

            <div className="bg-[#FAF7F0] dark:bg-stone-900 p-3 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#807872] dark:text-stone-400 block">Min. Order</span>
              <span className="text-xs font-black text-[#241A17] dark:text-stone-100 mt-1 block">
                {currency === 'NGN' ? `₦${restaurant.minimumOrderNGN.toLocaleString()}` : `£${restaurant.minimumOrderGBP.toFixed(2)}`}
              </span>
            </div>

            <div className="bg-[#FAF7F0] dark:bg-stone-900 p-3 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#807872] dark:text-stone-400 block">Base Delivery Fee</span>
              <span className="text-xs font-black text-[#241A17] dark:text-stone-100 mt-1 block">
                {currency === 'NGN' ? `₦${restaurant.deliveryFeeNGN.toLocaleString()}` : `£${restaurant.deliveryFeeGBP.toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Kitchen Details & Transparency */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#807872] dark:text-stone-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C85C43]" />
              <span>Kitchen Location & Operating Hours</span>
            </h3>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1B18] border border-[#EAE4DC] dark:border-stone-800 space-y-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[#807872] dark:text-stone-400 shrink-0">Address:</span>
                <span className="font-semibold text-right">{restaurant.address}, {restaurant.city}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[#807872] dark:text-stone-400 shrink-0">Kitchen Hours:</span>
                <span className="font-semibold text-right">{restaurant.operatingHours}</span>
              </div>
              {restaurant.phone && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#807872] dark:text-stone-400 shrink-0">Direct Phone:</span>
                  <a 
                    href={`tel:${restaurant.phone}`} 
                    className="font-bold text-[#C85C43] hover:underline"
                  >
                    {restaurant.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Hygiene & Allergen Safety Pledge */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#807872] dark:text-stone-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#5F765A]" />
              <span>Food Hygiene & Cross-Contamination Standards</span>
            </h3>

            <div className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#5F765A]/30 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#5F765A] shrink-0" />
                <span className="font-extrabold text-[#5F765A] dark:text-[#7d9b77]">
                  {restaurant.hygieneRating || 'Verified African Food Standards Compliance'}
                </span>
              </div>
              <p className="text-[11px] text-[#807872] dark:text-stone-400 leading-relaxed">
                {restaurant.allergenPledge || 'Kitchen follows segregated prep stations for common allergens (crayfish/shellfish, peanuts, gluten). Fresh oil and utensils sanitized between orders.'}
              </p>
            </div>
          </div>

          {/* Cuisines & Specialities */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#807872] dark:text-stone-400 mb-2">
              Culinary Heritage & Specialties
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {restaurant.cuisines.map((c, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-[#FAF7F0] dark:bg-stone-800 border border-[#EAE4DC] dark:border-stone-700 text-xs font-medium">
                  {c} Cuisine
                </span>
              ))}
              <span className="px-2.5 py-1 rounded-full bg-[#C85C43]/10 text-[#C85C43] border border-[#C85C43]/20 text-xs font-semibold">
                Authentic Spices
              </span>
            </div>
          </div>

          {/* Signature Menu Items from this Kitchen */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#807872] dark:text-stone-400">
                Signature Dishes ({restaurantMeals.length})
              </h3>
              <span className="text-[11px] text-[#807872] dark:text-stone-400">Tap dish to view & customize</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {restaurantMeals.map(meal => (
                <button
                  key={meal.id}
                  onClick={() => {
                    recordTap(`Selected meal ${meal.name} from restaurant details`);
                    setSelectedMeal(meal);
                    onClose();
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 hover:border-[#C85C43] transition-all text-left group"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
                    <img 
                      src={meal.image} 
                      alt={meal.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-[#241A17] dark:text-stone-100 truncate group-hover:text-[#C85C43]">
                      {meal.name}
                    </h4>
                    <span className="text-[11px] text-[#807872] dark:text-stone-400 block">
                      {meal.category}
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-[#241A17] dark:text-stone-100">
                        {currency === 'NGN' ? `₦${meal.priceNGN.toLocaleString()}` : `£${meal.priceGBP.toFixed(2)}`}
                      </span>
                      {meal.isAvailable ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          {meal.stockCount ? `${meal.stockCount} left` : 'Available'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-red-500 font-bold">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#EAE4DC] dark:border-stone-800 bg-[#FAF7F0] dark:bg-[#181512] flex items-center justify-between text-xs">
          <span className="text-[#807872] dark:text-stone-400">
            {restaurant.name} · {restaurant.city}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#241A17] dark:bg-stone-800 text-white font-bold hover:bg-black transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
