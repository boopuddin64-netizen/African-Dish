import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Star, 
  Clock, 
  MapPin, 
  Flame, 
  Plus, 
  Sparkles, 
  RefreshCw, 
  ChevronRight, 
  ThumbsDown, 
  ShieldAlert, 
  Info, 
  Sliders, 
  Check,
  RotateCcw
} from 'lucide-react';
import { ScoredRecommendation } from '../types';

export const HomeRecommendations: React.FC = () => {
  const {
    currentLocation,
    recommendations,
    selectedMeal,
    setSelectedMeal,
    openRestaurantDetails,
    showNextRecommendations,
    rejectMeal,
    mealPeriod,
    addToCart,
    setCurrentView,
    recordTap,
    userProfile,
    allMeals
  } = useApp();

  const [activeRejectMealId, setActiveRejectMealId] = useState<string | null>(null);
  const [showEngineExplanationId, setShowEngineExplanationId] = useState<string | null>(null);
  const [addedAnimationMealId, setAddedAnimationMealId] = useState<string | null>(null);

  const primaryRec = recommendations[0];
  const secondaryRecs = recommendations.slice(1, 3);
  const weakMatchWarning = recommendations.length > 0 && recommendations[0].totalScore < 35;

  const rejectionReasons = [
    'Too expensive',
    'Too spicy',
    'Too far / long ETA',
    'Not craving this cuisine',
    'Ate this recently'
  ];

  const greeting = mealPeriod === 'breakfast' 
    ? 'Good Morning' 
    : mealPeriod === 'lunch' 
    ? 'Midday Refuel' 
    : mealPeriod === 'snack'
    ? 'Afternoon Craving'
    : mealPeriod === 'dinner'
    ? 'Dinner Gathering'
    : 'Late Night Fuel';

  const subtitle = mealPeriod === 'breakfast'
    ? 'Warm, energizing morning dishes to start your day.'
    : mealPeriod === 'lunch'
    ? 'Hearty, satisfying midday African classics.'
    : mealPeriod === 'snack'
    ? 'Light bites and street snacks ready in minutes.'
    : mealPeriod === 'dinner'
    ? 'Comforting evening soups, stews, and grilled delicacies.'
    : 'Quick, late-night satisfying bites delivered hot.';

  const handleQuickAdd = (rec: ScoredRecommendation, e: React.MouseEvent) => {
    e.stopPropagation();
    recordTap(`Quick added ${rec.meal.name} to cart`);
    addToCart(rec.meal);
    setAddedAnimationMealId(rec.meal.id);
    setTimeout(() => setAddedAnimationMealId(null), 1200);
  };

  const handleRejection = (mealId: string, reason: string) => {
    recordTap(`Rejected meal ${mealId} with reason: ${reason}`);
    rejectMeal(mealId, reason);
    setActiveRejectMealId(null);
  };

  // 1-Tap Quick Reorder shelf
  const quickReorderMeals = userProfile.behavior.orderedMealIds
    .map(o => allMeals.find(m => m.id === o.mealId))
    .filter(Boolean) as typeof allMeals;

  return (
    <div id="home-recommendations-view" className="py-6 sm:py-10 max-w-5xl mx-auto px-4 sm:px-6">
      
      {/* Header with Location & Greeting */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#807872] dark:text-stone-400">
          <span>{currentLocation.label}</span>
          <span>·</span>
          <span>{currentLocation.city}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#241A17] dark:text-stone-100 tracking-tight mt-1">
          {greeting}
        </h1>
        <p className="text-sm sm:text-base text-[#807872] dark:text-stone-400 mt-1 font-normal">
          {subtitle} Curated dishes matched to your taste, spice tolerance, and time of day.
        </p>
      </div>

      {/* 1-Tap Quick Reorder Shelf */}
      {quickReorderMeals.length > 0 && (
        <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1E1B18] border border-[#EAE4DC] dark:border-stone-800 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#C85C43]" />
              <h2 className="text-xs sm:text-sm font-extrabold text-[#241A17] dark:text-stone-100 uppercase tracking-wider">
                1-Tap Quick Reorder
              </h2>
            </div>
            <span className="text-[11px] text-[#807872] dark:text-stone-400">
              Based on your previous orders
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickReorderMeals.slice(0, 2).map(m => {
              const priceFormatted = currentLocation.currency === 'NGN' ? `₦${m.priceNGN.toLocaleString()}` : `£${m.priceGBP.toFixed(2)}`;
              const isAdded = addedAnimationMealId === m.id;

              return (
                <div 
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 hover:border-[#C85C43]/50 transition-all"
                >
                  <div 
                    onClick={() => setSelectedMeal(m)} 
                    className="flex items-center gap-3 cursor-pointer min-w-0"
                  >
                    <img 
                      src={m.image} 
                      alt={m.name} 
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-[#241A17] dark:text-stone-100 truncate">
                        {m.name}
                      </h3>
                      <p className="text-[11px] text-[#807872] dark:text-stone-400">
                        {m.restaurantName} · {priceFormatted}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      recordTap(`1-Tap Reordered ${m.name}`);
                      addToCart(m);
                      setAddedAnimationMealId(m.id);
                      setTimeout(() => setAddedAnimationMealId(null), 1500);
                    }}
                    className={`px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1 shrink-0 transition-all ${
                      isAdded 
                        ? 'bg-[#5F765A] text-white' 
                        : 'bg-[#C85C43] hover:bg-[#B44F37] text-white shadow-xs'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reorder</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weak match alert if radius too tight */}
      {weakMatchWarning && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Limited top matches found in your immediate delivery radius. Consider expanding distance filter.</span>
          </div>
          <button 
            onClick={() => setCurrentView('discovery')}
            className="font-bold underline hover:text-amber-700 dark:hover:text-amber-100 whitespace-nowrap"
          >
            Adjust Search Radius →
          </button>
        </div>
      )}

      {/* Primary Recommendation (Top Pick) */}
      {primaryRec ? (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C85C43]" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#C85C43]">
                Top Recommendation for You
              </span>
            </div>
            <span className="text-xs text-[#807872] dark:text-stone-400">
              #1 of 3 Curated Matches
            </span>
          </div>

          <div 
            id={`primary-meal-card-${primaryRec.meal.id}`}
            onClick={() => {
              recordTap(`Clicked primary meal ${primaryRec.meal.name}`);
              setSelectedMeal(primaryRec.meal);
            }}
            className="group relative bg-white dark:bg-[#1E1B18] rounded-3xl border border-[#EAE4DC] dark:border-stone-800 hover:border-[#C85C43]/40 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
          >
            {/* Meal Image with Aspect Ratio */}
            <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-[#EAE4DC] dark:bg-stone-800">
              <img
                src={primaryRec.meal.image}
                alt={primaryRec.meal.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              {/* Badges on Top */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#FAF7F0]/95 dark:bg-stone-900/95 backdrop-blur-md text-[#241A17] dark:text-stone-100 text-xs font-bold shadow-xs">
                    {primaryRec.meal.cuisine} · {primaryRec.meal.category}
                  </span>
                  {primaryRec.meal.spiceLevel !== 'none' && (
                    <span className="px-2.5 py-1 rounded-full bg-[#241A17]/80 backdrop-blur-md text-amber-300 text-xs font-semibold flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-amber-400" />
                      <span className="capitalize">{primaryRec.meal.spiceLevel}</span>
                    </span>
                  )}
                </div>

                {/* Score / Transparency Pill */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    recordTap('Toggled recommendation engine inspector');
                    setShowEngineExplanationId(showEngineExplanationId === primaryRec.meal.id ? null : primaryRec.meal.id);
                  }}
                  className="pointer-events-auto px-2.5 py-1 rounded-full bg-white/90 dark:bg-stone-900/90 hover:bg-white dark:hover:bg-stone-800 text-[#241A17] dark:text-stone-100 text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all border border-black/5 dark:border-white/10"
                  title="View Why This Meal was Recommended"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Match Score: {primaryRec.totalScore}</span>
                </button>
              </div>

              {/* Primary Content Overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 text-xs font-medium text-white/85 mb-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      recordTap(`Opened restaurant modal for ${primaryRec.restaurant.name}`);
                      openRestaurantDetails(primaryRec.restaurant);
                    }}
                    className="hover:text-white underline decoration-white/50 hover:decoration-white transition-all font-bold"
                    title="View Kitchen & Hygiene Details"
                  >
                    {primaryRec.restaurant.name}
                  </button>
                  <span>·</span>
                  <span className="flex items-center gap-0.5 text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {primaryRec.meal.rating} ({primaryRec.meal.reviewCount})
                  </span>
                  <span>·</span>
                  <span>{primaryRec.deliveryMin}–{primaryRec.deliveryMax} min</span>
                  <span>·</span>
                  <span>{primaryRec.distanceKm} km</span>
                </div>

                <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {primaryRec.meal.name}
                </h2>
                {primaryRec.meal.nativeName && (
                  <p className="text-xs sm:text-sm text-white/75 italic">
                    "{primaryRec.meal.nativeName}"
                  </p>
                )}

                {/* Light Explanation Badge */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A45C]" />
                    <span>{primaryRec.lightExplanation}</span>
                  </div>

                  {primaryRec.meal.nutrition && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-xs font-semibold border border-white/10">
                      <span>{primaryRec.meal.nutrition.calories} kcal</span>
                      <span>·</span>
                      <span className="text-amber-300">{primaryRec.meal.nutrition.proteinGrams}g Protein</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Action Strip */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-white dark:bg-[#1E1B18] border-t border-[#EAE4DC] dark:border-stone-800">
              <div>
                <span className="text-xs text-[#807872] dark:text-stone-400 block">Total Price</span>
                <span className="text-xl sm:text-2xl font-black text-[#241A17] dark:text-stone-100">
                  {primaryRec.currency === 'NGN' ? `₦${primaryRec.price.toLocaleString()}` : `£${primaryRec.price.toFixed(2)}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Not Interested Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      recordTap('Opened not interested menu');
                      setActiveRejectMealId(activeRejectMealId === primaryRec.meal.id ? null : primaryRec.meal.id);
                    }}
                    className="p-2.5 rounded-full border border-[#EAE4DC] dark:border-stone-700 hover:border-red-300 text-[#807872] dark:text-stone-400 hover:text-red-600 transition-colors"
                    title="Not interested in this meal"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>

                  {/* Rejection Reasons Popover */}
                  {activeRejectMealId === primaryRec.meal.id && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 bottom-full mb-2 w-52 bg-white dark:bg-[#1E1B18] rounded-2xl shadow-xl border border-[#EAE4DC] dark:border-stone-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <p className="text-[11px] font-bold text-[#807872] dark:text-stone-400 px-2 py-1 uppercase tracking-wider">
                        Why not this meal?
                      </p>
                      <div className="space-y-0.5">
                        {rejectionReasons.map(reason => (
                          <button
                            key={reason}
                            onClick={() => handleRejection(primaryRec.meal.id, reason)}
                            className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-400 text-[#241A17] dark:text-stone-200 transition-colors"
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <button
                  type="button"
                  onClick={() => {
                    recordTap(`Opened meal detail modal for ${primaryRec.meal.name}`);
                    setSelectedMeal(primaryRec.meal);
                  }}
                  className="px-4 py-2.5 rounded-full border border-[#EAE4DC] dark:border-stone-700 hover:border-[#241A17] dark:hover:border-stone-500 text-xs font-bold text-[#241A17] dark:text-stone-200 transition-colors hidden sm:block"
                >
                  View Details
                </button>

                {/* Quick Add / 1-Tap Order */}
                <button
                  type="button"
                  onClick={(e) => handleQuickAdd(primaryRec, e)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition-all ${
                    addedAnimationMealId === primaryRec.meal.id 
                      ? 'bg-[#5F765A]' 
                      : 'bg-[#C85C43] hover:bg-[#B44F37]'
                  }`}
                >
                  {addedAnimationMealId === primaryRec.meal.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Quick Add</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Recommendation Score Engine Inspector (Expandable) */}
            {showEngineExplanationId === primaryRec.meal.id && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="px-5 py-4 bg-[#FAF7F0] dark:bg-stone-900 border-t border-[#EAE4DC] dark:border-stone-800 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-[#241A17] dark:text-stone-100 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#C9A45C]" />
                    5-Layer Hybrid Recommendation Breakdown
                  </span>
                  <span className="text-[11px] text-[#5F765A] dark:text-emerald-400 font-semibold">
                    ✓ Safety Check Passed
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-white dark:bg-[#1E1B18] p-2 rounded-xl border border-[#EAE4DC] dark:border-stone-800">
                    <span className="text-[#807872] dark:text-stone-400 block">Explicit Match</span>
                    <span className="font-bold text-[#241A17] dark:text-stone-100">+{primaryRec.reasons.explicitPreferenceScore} pts</span>
                  </div>
                  <div className="bg-white dark:bg-[#1E1B18] p-2 rounded-xl border border-[#EAE4DC] dark:border-stone-800">
                    <span className="text-[#807872] dark:text-stone-400 block">Behavior & Ratings</span>
                    <span className="font-bold text-[#241A17] dark:text-stone-100">+{primaryRec.reasons.behaviorScore} pts</span>
                  </div>
                  <div className="bg-white dark:bg-[#1E1B18] p-2 rounded-xl border border-[#EAE4DC] dark:border-stone-800">
                    <span className="text-[#807872] dark:text-stone-400 block">Meal Period Context</span>
                    <span className="font-bold text-[#241A17] dark:text-stone-100">+{primaryRec.reasons.contextScore} pts</span>
                  </div>
                  <div className="bg-white dark:bg-[#1E1B18] p-2 rounded-xl border border-[#EAE4DC] dark:border-stone-800">
                    <span className="text-[#807872] dark:text-stone-400 block">Distance & Quality</span>
                    <span className="font-bold text-[#241A17] dark:text-stone-100">+{primaryRec.reasons.distanceAndPriceScore + primaryRec.reasons.restaurantQualityScore} pts</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Secondary Recommendations */}
      {secondaryRecs.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-[#241A17] dark:text-stone-100 tracking-tight">
              A few other good ideas
            </h3>
            <span className="text-xs text-[#807872] dark:text-stone-400">
              Top 2 & 3 Ranked Alternatives
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {secondaryRecs.map((rec) => (
              <div
                key={rec.meal.id}
                id={`secondary-meal-card-${rec.meal.id}`}
                onClick={() => {
                  recordTap(`Clicked secondary meal ${rec.meal.name}`);
                  setSelectedMeal(rec.meal);
                }}
                className="group bg-white dark:bg-[#1E1B18] rounded-2xl border border-[#EAE4DC] dark:border-stone-800 hover:border-[#C85C43]/40 p-4 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 rounded-xl overflow-hidden mb-3 bg-[#EAE4DC] dark:bg-stone-800">
                    <img
                      src={rec.meal.image}
                      alt={rec.meal.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#FAF7F0]/90 dark:bg-stone-900/90 backdrop-blur-xs text-[11px] font-bold text-[#241A17] dark:text-stone-100">
                      {rec.meal.cuisine}
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[11px] text-white">
                      {rec.deliveryMin}–{rec.deliveryMax} min · {rec.distanceKm} km
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1 text-xs text-[#807872] dark:text-stone-400 mb-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        recordTap(`Opened restaurant modal for ${rec.restaurant.name}`);
                        openRestaurantDetails(rec.restaurant);
                      }}
                      className="truncate hover:text-[#C85C43] hover:underline font-semibold text-left"
                      title="View Kitchen & Hygiene Details"
                    >
                      {rec.restaurant.name}
                    </button>
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {rec.meal.rating}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-[#241A17] dark:text-stone-100 text-base leading-snug line-clamp-1 group-hover:text-[#C85C43] transition-colors">
                    {rec.meal.name}
                  </h4>

                  <div className="mt-2 text-xs text-[#5F765A] dark:text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5F765A] dark:bg-emerald-400" />
                    <span>{rec.lightExplanation}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0EAE1] dark:border-stone-800 flex items-center justify-between">
                  <span className="text-base font-extrabold text-[#241A17] dark:text-stone-100">
                    {rec.currency === 'NGN' ? `₦${rec.price.toLocaleString()}` : `£${rec.price.toFixed(2)}`}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        rejectMeal(rec.meal.id, 'Not interested');
                      }}
                      className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 text-[#807872] dark:text-stone-400 transition-colors"
                      title="Not interested"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(rec, e)}
                      className="px-3 py-1.5 rounded-full bg-[#C85C43] hover:bg-[#B44F37] text-white text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* "Show Me Something Else" & Discovery Mode Triggers */}
      <div className="pt-4 border-t border-[#EAE4DC] dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Next 3 Best Matches */}
        <button
          id="show-something-else-btn"
          onClick={showNextRecommendations}
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-white dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 hover:border-[#241A17] dark:hover:border-stone-600 text-xs sm:text-sm font-bold text-[#241A17] dark:text-stone-100 flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all"
        >
          <RefreshCw className="w-4 h-4 text-[#807872] dark:text-stone-400" />
          <span>Show me something else</span>
        </button>

        {/* Discovery Mode link */}
        <button
          id="explore-discovery-btn"
          onClick={() => {
            recordTap('Clicked explore discovery mode');
            setCurrentView('discovery');
          }}
          className="w-full sm:w-auto text-xs sm:text-sm text-[#807872] dark:text-stone-400 hover:text-[#C85C43] font-semibold flex items-center justify-center gap-1.5 transition-colors py-2"
        >
          <span>Explore wider African cuisine catalogue</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};
