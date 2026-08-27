import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  SlidersHorizontal, 
  Flame, 
  Sparkles, 
  Check, 
  RotateCcw,
  Info,
  Heart
} from 'lucide-react';
import { Allergen, CountryCuisine, DietaryFlag, SpiceLevel } from '../types';

export const PreferenceSafetyModal: React.FC = () => {
  const {
    isPreferenceModalOpen,
    setIsPreferenceModalOpen,
    userProfile,
    updatePreferences,
    toggleAllergen,
    toggleCuisine,
    setSpicePreference,
    resetPreferencesToDefault,
    recommendations,
    recordTap
  } = useApp();

  const [activeTab, setActiveTab] = useState<'safety' | 'cuisines' | 'spice' | 'dietary'>('safety');

  if (!isPreferenceModalOpen) return null;

  const allAllergens: { id: Allergen; label: string; desc: string }[] = [
    { id: 'peanuts', label: 'Peanuts / Groundnuts (Kuli-Kuli & Suya Spice)', desc: 'Crucial for Suya, Yaji spices, Groundnut stew' },
    { id: 'tree_nuts', label: 'Tree Nuts (Cashews, Almonds)', desc: 'Common in select baked snacks' },
    { id: 'shellfish', label: 'Crustaceans / Shellfish (Crayfish & Periwinkles)', desc: 'Widely used in traditional West African soups' },
    { id: 'fish', label: 'Fish / Stockfish', desc: 'Used in Egusi, Native soups, Bole na Eja' },
    { id: 'gluten', label: 'Gluten / Wheat (Puff-Puff, Bread)', desc: 'Found in Bunny Chow, fried doughs' },
    { id: 'dairy', label: 'Dairy / Milk / Butter', desc: 'Niter Kibbeh, cheese' },
    { id: 'eggs', label: 'Eggs', desc: 'Boiled egg toppings in Waakye, Doro Wat' },
    { id: 'soy', label: 'Soybeans', desc: 'Sauces and seasonings' }
  ];

  const availableCuisines: CountryCuisine[] = [
    'Nigerian',
    'Ghanaian',
    'Senegalese',
    'Sierra Leonean',
    'Ethiopian',
    'Kenyan',
    'Somali',
    'South African',
    'Pan-African'
  ];

  const spiceLevels: { key: SpiceLevel; label: string; desc: string; heat: number }[] = [
    { key: 'none', label: 'No Spice', desc: 'Zero chili or hot pepper', heat: 0 },
    { key: 'mild', label: 'Mild', desc: 'Gentle warmth with full aroma', heat: 1 },
    { key: 'medium', label: 'Medium', desc: 'Standard authentic West/East African seasoning', heat: 2 },
    { key: 'hot', label: 'Hot (Standard Suya/Pepper Soup)', desc: 'Distinct scotch bonnet heat', heat: 3 },
    { key: 'extra_hot', label: 'Extra Hot', desc: 'Traditional high heat yellow pepper', heat: 4 }
  ];

  return (
    <div 
      id="preferences-modal-backdrop" 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={() => setIsPreferenceModalOpen(false)}
    >
      <div 
        id="preferences-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1E1B18] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-[#EAE4DC] dark:border-stone-800 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAE4DC] dark:border-stone-800 flex items-center justify-between bg-[#FAF7F0] dark:bg-[#181512]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#C85C43] text-white flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#241A17] dark:text-stone-100">
                Preferences & Hard Safety Layer
              </h2>
              <p className="text-xs text-[#807872] dark:text-stone-400">
                Dietary protection, allergen exclusions, and taste tuning
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPreferenceModalOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-white dark:hover:bg-stone-800 flex items-center justify-center text-[#807872] dark:text-stone-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#EAE4DC] dark:border-stone-800 px-4 pt-2 gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('safety')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'safety' 
                ? 'border-[#C85C43] text-[#C85C43]' 
                : 'border-transparent text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Safety & Allergens ({userProfile.safety.allergies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cuisines')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'cuisines' 
                ? 'border-[#C85C43] text-[#C85C43]' 
                : 'border-transparent text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Cuisines</span>
          </button>

          <button
            onClick={() => setActiveTab('spice')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'spice' 
                ? 'border-[#C85C43] text-[#C85C43]' 
                : 'border-transparent text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Spice Tolerance</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-[#241A17] dark:text-stone-100">
          
          {/* TAB 1: SAFETY & HARD ALLERGEN CONSTRAINTS */}
          {activeTab === 'safety' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2 font-bold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>Hard Safety Constraint Layer (Non-Negotiable)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  A promoted or highly rated meal cannot outrank safety information. Meals containing selected allergens are immediately excluded from recommendations.
                </p>
              </div>

              <div className="space-y-2">
                {allAllergens.map(item => {
                  const isChecked = userProfile.safety.allergies.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleAllergen(item.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isChecked 
                          ? 'bg-red-50/70 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-950 dark:text-red-200 font-semibold' 
                          : 'bg-white dark:bg-[#1E1B18] border-[#EAE4DC] dark:border-stone-800 hover:border-[#807872] text-[#241A17] dark:text-stone-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span>{item.label}</span>
                          {isChecked && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 uppercase font-black">
                              Excluded
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#807872] dark:text-stone-400 mt-0.5">{item.desc}</div>
                      </div>

                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center border shrink-0 ${
                        isChecked ? 'bg-red-600 border-red-600 text-white' : 'border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-800'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: EXPLICIT CUISINES */}
          {activeTab === 'cuisines' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#FAF7F0] dark:bg-stone-900 rounded-2xl border border-[#EAE4DC] dark:border-stone-800">
                <p className="text-xs text-[#807872] dark:text-stone-400">
                  Explicit preferences carry the highest positive weight (+30 pts) in your personalized recommendations.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {availableCuisines.map(c => {
                  const isSelected = userProfile.preferences.explicitCuisines.includes(c);

                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCuisine(c)}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSelected 
                          ? 'bg-[#FAF7F0] dark:bg-stone-900 border-[#C85C43] dark:border-[#C85C43] text-[#C85C43] font-bold shadow-2xs' 
                          : 'bg-white dark:bg-[#1E1B18] border-[#EAE4DC] dark:border-stone-800 text-[#807872] dark:text-stone-400'
                      }`}
                    >
                      <span className="text-xs">{c}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#C85C43]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SPICE PREFERENCE */}
          {activeTab === 'spice' && (
            <div className="space-y-3">
              <p className="text-xs text-[#807872] dark:text-stone-400">
                We match your tolerance to traditional pepper profiles (scotch bonnet, yaji, uda, berbere).
              </p>

              <div className="space-y-2">
                {spiceLevels.map(sp => {
                  const isSelected = userProfile.preferences.preferredSpiceLevel === sp.key;

                  return (
                    <button
                      key={sp.key}
                      type="button"
                      onClick={() => setSpicePreference(sp.key)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSelected 
                          ? 'bg-[#FAF7F0] dark:bg-stone-900 border-[#C85C43] dark:border-[#C85C43] text-[#241A17] dark:text-stone-100 font-bold' 
                          : 'bg-white dark:bg-[#1E1B18] border-[#EAE4DC] dark:border-stone-800 text-[#807872] dark:text-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex text-amber-500">
                          {Array.from({ length: sp.heat }).map((_, i) => (
                            <Flame key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{sp.label}</div>
                          <div className="text-[11px] text-[#807872] dark:text-stone-400">{sp.desc}</div>
                        </div>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-[#C85C43]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Interactive Recommendation Preview Engine */}
          <div className="p-4 bg-[#FAF7F0] dark:bg-stone-900 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#241A17] dark:text-stone-100">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
                Live Top 3 Recommendation Candidates:
              </span>
              <span className="text-[11px] text-[#5F765A] dark:text-emerald-400">Dynamic Recalculation</span>
            </div>

            <div className="space-y-1">
              {recommendations.slice(0, 3).map((r, i) => (
                <div key={r.meal.id} className="bg-white dark:bg-[#1E1B18] p-2 rounded-xl border border-[#EAE4DC] dark:border-stone-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#241A17] dark:bg-stone-700 text-white flex items-center justify-center font-bold text-[10px]">
                      {i + 1}
                    </span>
                    <span className="font-bold text-[#241A17] dark:text-stone-100 truncate max-w-[200px]">{r.meal.name}</span>
                    <span className="text-[10px] text-[#807872] dark:text-stone-400">({r.meal.cuisine})</span>
                  </div>
                  <span className="text-[#5F765A] dark:text-emerald-400 font-bold">Score: {r.totalScore}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#1E1B18] border-t border-[#EAE4DC] dark:border-stone-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              recordTap('Reset preferences to default');
              resetPreferencesToDefault();
            }}
            className="text-xs font-semibold text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => {
              recordTap('Saved preferences modal');
              setIsPreferenceModalOpen(false);
            }}
            className="px-6 py-2.5 rounded-full bg-[#C85C43] hover:bg-[#B44F37] text-white font-extrabold text-xs shadow-xs"
          >
            Save & Update Recommendations
          </button>
        </div>

      </div>
    </div>
  );
};
