import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Filter, 
  Flame, 
  Star, 
  Plus, 
  Check, 
  Info, 
  Sparkles,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { CountryCuisine, DietaryFlag, Meal, SpiceLevel } from '../types';

export const DiscoveryMode: React.FC = () => {
  const {
    allMeals,
    allRestaurants,
    currentLocation,
    setSelectedMeal,
    openRestaurantDetailsModal,
    addToCart,
    recordTap,
    setCurrentView
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<CountryCuisine | 'All'>('All');
  const [selectedDietary, setSelectedDietary] = useState<DietaryFlag | 'All'>('All');
  const [selectedSpice, setSelectedSpice] = useState<SpiceLevel | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addedMealId, setAddedMealId] = useState<string | null>(null);

  const cuisineTaxonomy: { region: string; cuisines: CountryCuisine[] }[] = [
    {
      region: 'West African',
      cuisines: ['Nigerian', 'Ghanaian', 'Senegalese', 'Sierra Leonean']
    },
    {
      region: 'East African',
      cuisines: ['Ethiopian', 'Kenyan', 'Somali']
    },
    {
      region: 'Southern & Central',
      cuisines: ['South African', 'Cameroonian', 'Pan-African']
    }
  ];

  const categories = ['All', 'Rice & Grains', 'Soups & Swallows', 'Grills & Suya', 'Street Food', 'Platters', 'Small Plates'];

  // Filtered Meals
  const filteredMeals = useMemo(() => {
    return allMeals.filter(meal => {
      // 1. City constraint
      const restaurant = allRestaurants.find(r => r.id === meal.restaurantId);
      if (!restaurant || restaurant.city !== currentLocation.city) {
        return false;
      }

      // 2. Search Query (Name, Native Name, Ingredients, Restaurant, Cuisine)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = meal.name.toLowerCase().includes(q);
        const matchesNative = meal.nativeName?.toLowerCase().includes(q);
        const matchesIng = meal.ingredients.some(ing => ing.toLowerCase().includes(q));
        const matchesRest = restaurant.name.toLowerCase().includes(q);
        const matchesCuisine = meal.cuisine.toLowerCase().includes(q);
        const matchesCat = meal.category.toLowerCase().includes(q);

        if (!matchesName && !matchesNative && !matchesIng && !matchesRest && !matchesCuisine && !matchesCat) {
          return false;
        }
      }

      // 3. Cuisine filter
      if (selectedCuisine !== 'All' && meal.cuisine !== selectedCuisine) {
        return false;
      }

      // 4. Dietary filter
      if (selectedDietary !== 'All' && !meal.dietaryFlags.includes(selectedDietary)) {
        return false;
      }

      // 5. Spice filter
      if (selectedSpice !== 'All' && meal.spiceLevel !== selectedSpice) {
        return false;
      }

      // 6. Category filter
      if (selectedCategory !== 'All' && meal.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [allMeals, allRestaurants, currentLocation, searchQuery, selectedCuisine, selectedDietary, selectedSpice, selectedCategory]);

  const handleQuickAdd = (meal: Meal, e: React.MouseEvent) => {
    e.stopPropagation();
    recordTap(`Added ${meal.name} from discovery`);
    addToCart(meal);
    setAddedMealId(meal.id);
    setTimeout(() => setAddedMealId(null), 1500);
  };

  return (
    <div id="discovery-view" className="py-6 sm:py-10 max-w-6xl mx-auto px-4 sm:px-6">
      
      {/* Header & Philosophy */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#807872] dark:text-stone-400">
            <span>Intentional Exploration</span>
            <span>·</span>
            <span>{currentLocation.city}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241A17] dark:text-stone-100 tracking-tight mt-1">
            Discovery Mode
          </h1>
          <p className="text-xs sm:text-sm text-[#807872] dark:text-stone-400 mt-1 max-w-xl">
            Explore authentic African cuisines and regional specialties outside your usual routine. Temporary search filters won't distort your permanent profile.
          </p>
        </div>

        <button
          onClick={() => {
            recordTap('Returned to home from discovery');
            setCurrentView('home');
          }}
          className="text-xs font-bold text-[#C85C43] hover:underline flex items-center gap-1 self-start md:self-auto"
        >
          <span>Back to Recommendations</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 text-[#807872] dark:text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by meal name, native name, ingredient (e.g. 'crayfish', 'suya spice', 'jollof', 'egusi')..."
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1E1B18] border border-[#EAE4DC] dark:border-stone-800 rounded-2xl text-xs sm:text-sm text-[#241A17] dark:text-stone-100 placeholder-[#807872] dark:placeholder-stone-500 focus:outline-none focus:border-[#C85C43] shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#807872] hover:text-[#241A17] dark:hover:text-stone-200 px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Horizontal Carousel / Badges */}
      <div className="space-y-3 mb-8">
        
        {/* Cuisine Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#807872] dark:text-stone-400 mr-1 shrink-0">
            Cuisine:
          </span>
          <button
            onClick={() => setSelectedCuisine('All')}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedCuisine === 'All'
                ? 'bg-[#C85C43] text-white shadow-2xs'
                : 'bg-white dark:bg-[#1E1B18] border border-[#EAE4DC] dark:border-stone-800 text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
            }`}
          >
            All Cuisines
          </button>
          {cuisineTaxonomy.flatMap(t => t.cuisines).map(c => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCuisine === c
                  ? 'bg-[#C85C43] text-white shadow-2xs'
                  : 'bg-white dark:bg-[#1E1B18] border border-[#EAE4DC] dark:border-stone-800 text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#807872] dark:text-stone-400 mr-1 shrink-0">
            Course:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#241A17] dark:bg-stone-700 text-white shadow-2xs'
                  : 'bg-white dark:bg-[#1E1B18] border border-[#EAE4DC] dark:border-stone-800 text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Search Results Count */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-[#807872] dark:text-stone-400">
          Showing <span className="font-bold text-[#241A17] dark:text-stone-100">{filteredMeals.length}</span> authentic dishes in {currentLocation.city}
        </div>
      </div>

      {/* Grid of Dishes */}
      {filteredMeals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMeals.map(meal => {
            const restaurant = allRestaurants.find(r => r.id === meal.restaurantId);
            const isAdded = addedMealId === meal.id;
            const priceFormatted = currentLocation.currency === 'NGN' ? `₦${meal.priceNGN.toLocaleString()}` : `£${meal.priceGBP.toFixed(2)}`;

            return (
              <div
                key={meal.id}
                onClick={() => {
                  recordTap(`Opened meal detail modal for ${meal.name}`);
                  setSelectedMeal(meal);
                }}
                className="group bg-white dark:bg-[#1E1B18] rounded-2xl border border-[#EAE4DC] dark:border-stone-800 hover:border-[#C85C43]/40 p-4 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 rounded-xl overflow-hidden mb-3 bg-[#EAE4DC] dark:bg-stone-800">
                    <img
                      src={meal.image}
                      alt={meal.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#FAF7F0]/90 dark:bg-stone-900/90 backdrop-blur-xs text-[11px] font-bold text-[#241A17] dark:text-stone-100">
                      {meal.cuisine}
                    </div>
                    {meal.spiceLevel !== 'none' && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[11px] text-amber-300 font-semibold flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-amber-400" />
                        <span className="capitalize">{meal.spiceLevel}</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[11px] text-white">
                      {meal.prepTimeMinutes} min prep
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#807872] dark:text-stone-400 mb-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (restaurant) {
                          recordTap(`Viewed restaurant details for ${restaurant.name}`);
                          openRestaurantDetailsModal(restaurant.id);
                        }
                      }}
                      className="truncate hover:text-[#C85C43] hover:underline font-semibold text-left"
                      title="View Kitchen Details & Hygiene Rating"
                    >
                      {restaurant?.name}
                    </button>
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {meal.rating} ({meal.reviewCount})
                    </span>
                  </div>

                  <h3 className="font-extrabold text-[#241A17] dark:text-stone-100 text-base leading-snug line-clamp-1 group-hover:text-[#C85C43] transition-colors">
                    {meal.name}
                  </h3>
                  {meal.nativeName && (
                    <p className="text-xs text-[#807872] dark:text-stone-400 italic">
                      "{meal.nativeName}"
                    </p>
                  )}

                  <p className="mt-1 text-xs text-[#807872] dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {meal.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0EAE1] dark:border-stone-800 flex items-center justify-between">
                  <span className="text-base font-extrabold text-[#241A17] dark:text-stone-100">
                    {priceFormatted}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(meal, e)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                      isAdded 
                        ? 'bg-[#5F765A] text-white' 
                        : 'bg-[#C85C43] hover:bg-[#B44F37] text-white shadow-2xs'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-[#807872] dark:text-stone-400 space-y-3 bg-white dark:bg-[#1E1B18] rounded-3xl border border-[#EAE4DC] dark:border-stone-800">
          <Search className="w-8 h-8 mx-auto text-[#807872]/40" />
          <p className="text-base font-bold text-[#241A17] dark:text-stone-100">No dishes match your active filter</p>
          <p className="text-xs max-w-sm mx-auto">
            Try resetting your search query or switching cuisine categories.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCuisine('All');
              setSelectedCategory('All');
              setSelectedDietary('All');
              setSelectedSpice('All');
            }}
            className="mt-2 px-4 py-2 rounded-full bg-[#FAF7F0] dark:bg-stone-800 border border-[#EAE4DC] dark:border-stone-700 text-xs font-bold text-[#241A17] dark:text-stone-200 hover:border-[#C85C43]"
          >
            Reset All Filters
          </button>
        </div>
      )}

    </div>
  );
};
