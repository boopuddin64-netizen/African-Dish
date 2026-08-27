import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Star, 
  Clock, 
  MapPin, 
  Flame, 
  ShieldAlert, 
  Check, 
  Plus, 
  Minus, 
  Sparkles,
  Info
} from 'lucide-react';
import { logRecommendationEvent } from '../services/analyticsService';
import { CustomizationOption, Meal } from '../types';

export const MealDetailModal: React.FC = () => {
  const {
    selectedMeal,
    setSelectedMeal,
    allRestaurants,
    currentLocation,
    addToCart,
    recordTap,
    userProfile
  } = useApp();

  const [selectedCustomizations, setSelectedCustomizations] = useState<CustomizationOption[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Initialize & log meal_opened event
  useEffect(() => {
    if (selectedMeal) {
      logRecommendationEvent({
        userId: userProfile.id,
        mealId: selectedMeal.id,
        restaurantId: selectedMeal.restaurantId,
        eventType: 'meal_opened',
        timestamp: new Date().toISOString()
      });

      const rememberedIds = userProfile.behavior.rememberedCustomizations[selectedMeal.id] || [];
      const initialSelected = selectedMeal.customizationOptions.filter(opt => 
        opt.isDefault || rememberedIds.includes(opt.id)
      );
      setSelectedCustomizations(initialSelected);
      setQuantity(1);
      setSpecialInstructions('');
    }
  }, [selectedMeal, userProfile]);

  if (!selectedMeal) return null;

  const restaurant = allRestaurants.find(r => r.id === selectedMeal.restaurantId) || allRestaurants[0];
  const basePrice = currentLocation.currency === 'NGN' ? selectedMeal.priceNGN : selectedMeal.priceGBP;

  const customDelta = selectedCustomizations.reduce((acc, c) => {
    const val = currentLocation.currency === 'NGN' ? c.priceDelta : (c.priceDelta > 20 ? c.priceDelta / 400 : c.priceDelta);
    return acc + val;
  }, 0);

  const unitPrice = basePrice + customDelta;
  const totalPrice = unitPrice * quantity;

  const toggleCustomization = (option: CustomizationOption) => {
    recordTap(`Toggled customization: ${option.name}`);
    setSelectedCustomizations(prev => {
      const exists = prev.some(c => c.id === option.id);
      if (exists) {
        return prev.filter(c => c.id !== option.id);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleAddToCart = () => {
    recordTap(`Added ${quantity}x ${selectedMeal.name} to cart with customizations`);
    logRecommendationEvent({
      userId: userProfile.id,
      mealId: selectedMeal.id,
      restaurantId: selectedMeal.restaurantId,
      eventType: 'added_to_cart',
      timestamp: new Date().toISOString()
    });
    for (let i = 0; i < quantity; i++) {
      addToCart(selectedMeal, selectedCustomizations, specialInstructions);
    }
    setSelectedMeal(null);
  };

  return (
    <div 
      id="meal-detail-modal-overlay" 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={() => setSelectedMeal(null)}
    >
      <div 
        id="meal-detail-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1E1B18] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-[#EAE4DC] dark:border-stone-800 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Image Header */}
        <div className="relative h-64 sm:h-72 w-full shrink-0 bg-[#EAE4DC] dark:bg-stone-800">
          <img
            src={selectedMeal.image}
            alt={selectedMeal.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Close button */}
          <button
            onClick={() => setSelectedMeal(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 dark:bg-stone-800/90 hover:bg-white dark:hover:bg-stone-800 text-[#241A17] dark:text-stone-100 flex items-center justify-center shadow-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Overlay Info */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/80 mb-1">
              <span>{restaurant.name}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5 text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {selectedMeal.rating} ({selectedMeal.reviewCount})
              </span>
              <span>·</span>
              <span>{selectedMeal.prepTimeMinutes} min prep</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              {selectedMeal.name}
            </h2>
            {selectedMeal.nativeName && (
              <p className="text-xs text-white/80 italic mt-0.5">
                "{selectedMeal.nativeName}"
              </p>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-[#241A17] dark:text-stone-100">
          
          {/* Description */}
          <div>
            <p className="text-sm text-[#807872] dark:text-stone-300 leading-relaxed">
              {selectedMeal.description}
            </p>
          </div>

          {/* Macro Transparency & Nutritional Breakdown */}
          {selectedMeal.nutrition && (
            <div className="bg-white dark:bg-[#1E1B18] p-4 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#807872] dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#C85C43]" />
                  <span>Macro Nutritional Transparency</span>
                </span>
                <span className="text-xs font-black text-[#241A17] dark:text-stone-100">
                  {selectedMeal.nutrition.calories} kcal
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800">
                  <span className="text-[10px] text-[#807872] dark:text-stone-400 block uppercase font-bold">Protein</span>
                  <span className="font-extrabold text-[#C85C43] text-sm">{selectedMeal.nutrition.proteinGrams}g</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800">
                  <span className="text-[10px] text-[#807872] dark:text-stone-400 block uppercase font-bold">Carbs</span>
                  <span className="font-extrabold text-[#241A17] dark:text-stone-100 text-sm">{selectedMeal.nutrition.carbsGrams}g</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800">
                  <span className="text-[10px] text-[#807872] dark:text-stone-400 block uppercase font-bold">Fat</span>
                  <span className="font-extrabold text-[#807872] dark:text-stone-300 text-sm">{selectedMeal.nutrition.fatGrams}g</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800">
                  <span className="text-[10px] text-[#807872] dark:text-stone-400 block uppercase font-bold">Fiber</span>
                  <span className="font-extrabold text-[#5F765A] text-sm">{selectedMeal.nutrition.fiberGrams || 5}g</span>
                </div>
              </div>
            </div>
          )}

          {/* Ingredients & Allergen Transparency */}
          <div className="bg-[#FAF7F0] dark:bg-stone-900 p-4 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 space-y-3">
            <div>
              <span className="text-xs font-bold text-[#807872] dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                Fresh Ingredients & Spices
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedMeal.ingredients.map(ing => (
                  <span key={ing} className="px-2 py-1 bg-white dark:bg-[#1E1B18] rounded-lg text-xs font-medium text-[#241A17] dark:text-stone-200 border border-[#EAE4DC] dark:border-stone-800">
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Allergens */}
            <div className="pt-2 border-t border-[#EAE4DC]/60 dark:border-stone-800 flex items-center justify-between text-xs">
              <span className="text-[#807872] dark:text-stone-400 font-semibold">Contains Allergens:</span>
              <div className="flex items-center gap-1.5">
                {selectedMeal.allergens.length > 0 ? (
                  selectedMeal.allergens.map(allg => (
                    <span key={allg} className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-[11px] font-bold capitalize">
                      {allg}
                    </span>
                  ))
                ) : (
                  <span className="text-[#5F765A] dark:text-emerald-400 font-bold">None declared</span>
                )}
              </div>
            </div>
          </div>

          {/* Remembered & Available Customizations */}
          {selectedMeal.customizationOptions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-[#807872] dark:text-stone-400 uppercase tracking-wider">
                  Customizations & Extras
                </span>
                <span className="text-[11px] text-[#5F765A] dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Remembered preferences pre-selected
                </span>
              </div>

              <div className="space-y-2">
                {selectedMeal.customizationOptions.map(option => {
                  const isSelected = selectedCustomizations.some(c => c.id === option.id);
                  const priceFormatted = currentLocation.currency === 'NGN'
                    ? (option.priceDelta > 0 ? `+₦${option.priceDelta.toLocaleString()}` : 'Free')
                    : (option.priceDelta > 0 ? `+£${(option.priceDelta > 20 ? option.priceDelta / 400 : option.priceDelta).toFixed(2)}` : 'Free');

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleCustomization(option)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between text-xs transition-all ${
                        isSelected 
                          ? 'bg-[#FAF7F0] dark:bg-stone-900 border-[#C85C43] dark:border-[#C85C43] text-[#241A17] dark:text-stone-100 font-semibold' 
                          : 'bg-white dark:bg-[#1E1B18] border-[#EAE4DC] dark:border-stone-800 hover:border-[#807872] text-[#807872] dark:text-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                          isSelected ? 'bg-[#C85C43] border-[#C85C43] text-white' : 'border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-800'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-3" />}
                        </div>
                        <span>{option.name}</span>
                      </div>
                      <span className="font-bold text-[#241A17] dark:text-stone-100">{priceFormatted}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kitchen Special Instructions */}
          <div>
            <label className="text-xs font-bold text-[#807872] dark:text-stone-400 uppercase tracking-wider block mb-1.5">
              Special Instructions for Kitchen (Optional)
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Please pack sauce separately, make extra crispy..."
              className="w-full px-3.5 py-2.5 bg-[#FAF7F0] dark:bg-stone-900 rounded-xl border border-[#EAE4DC] dark:border-stone-800 text-xs text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
            />
          </div>

        </div>

        {/* Modal Sticky Footer (Add to Cart) */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#1E1B18] border-t border-[#EAE4DC] dark:border-stone-800 flex items-center justify-between gap-3 shrink-0">
          
          {/* Quantity Stepper */}
          <div className="flex items-center gap-2 bg-[#FAF7F0] dark:bg-stone-900 rounded-full p-1 border border-[#EAE4DC] dark:border-stone-800">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-7 h-7 rounded-full bg-white dark:bg-stone-800 flex items-center justify-center text-[#241A17] dark:text-stone-200 hover:bg-[#EAE4DC] dark:hover:bg-stone-700 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-bold text-xs text-[#241A17] dark:text-stone-100">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-7 h-7 rounded-full bg-white dark:bg-stone-800 flex items-center justify-center text-[#241A17] dark:text-stone-200 hover:bg-[#EAE4DC] dark:hover:bg-stone-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Button */}
          <button
            id="modal-add-to-cart-btn"
            onClick={handleAddToCart}
            className="flex-1 py-3 px-6 rounded-full bg-[#C85C43] hover:bg-[#B44F37] text-white font-extrabold text-sm flex items-center justify-between shadow-md transition-all"
          >
            <span>Add to Cart</span>
            <span>
              {currentLocation.currency === 'NGN' ? `₦${totalPrice.toLocaleString()}` : `£${totalPrice.toFixed(2)}`}
            </span>
          </button>

        </div>

      </div>
    </div>
  );
};
