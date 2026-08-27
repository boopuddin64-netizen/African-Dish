import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Database, 
  Compass, 
  MapPin, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  ChevronRight,
  Code
} from 'lucide-react';

export const PrdBlueprintModal: React.FC = () => {
  const { setCurrentView, recordTap } = useApp();
  const [activeSection, setActiveSection] = useState<'principles' | 'recommendation' | 'data' | 'ordering' | 'strategy'>('principles');

  const chapters = [
    {
      id: 'principles',
      title: '1. Core Product Philosophy & Positioning',
      subtitle: 'Sections 1–5: 5 Principles, Anti-AI Hype, Meal-First Discovery',
      icon: Sparkles
    },
    {
      id: 'recommendation',
      title: '2. 5-Layer Recommendation Architecture',
      subtitle: 'Sections 6–15, 59–63: Scoring Math, Explainability, Safety Layer',
      icon: Layers
    },
    {
      id: 'data',
      title: '3. Data Schema & Event Hierarchy',
      subtitle: 'Sections 58, 84–87: Entity Models, Distinctions, Privacy',
      icon: Database
    },
    {
      id: 'ordering',
      title: '4. Low-Friction Ordering & Tap Benchmark',
      subtitle: 'Sections 38–41, 69: ≤21 Taps Target, Hybrid Courier Fulfillment',
      icon: Zap
    },
    {
      id: 'strategy',
      title: '5. Port Harcourt Pilot & UK Expansion',
      subtitle: 'Sections 70–77: Pilot Validation, Taxonomy, Merchant Economics',
      icon: Compass
    }
  ];

  return (
    <div id="prd-blueprint-view" className="py-6 sm:py-10 max-w-6xl mx-auto px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5F765A] dark:text-[#7d9b77]">
            <span>Master Technical PRD</span>
            <span>·</span>
            <span>Product Blueprint</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-[#241A17] dark:text-stone-100 mt-1">
            Personalized Food Marketplace Architecture
          </h1>
          <p className="text-xs sm:text-sm text-[#807872] dark:text-stone-400 mt-1 max-w-2xl">
            Complete technical specification and product requirements document powering the live application.
          </p>
        </div>

        <button
          onClick={() => {
            recordTap('Returned to interactive app from PRD');
            setCurrentView('home');
          }}
          className="px-5 py-2.5 rounded-full bg-[#C85C43] hover:bg-[#B44F37] text-white text-xs font-bold transition-all shrink-0 self-start md:self-auto shadow-xs"
        >
          Open Live 3-Meal App
        </button>
      </div>

      {/* Chapter Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {chapters.map(ch => {
          const IconComp = ch.icon;
          const isActive = activeSection === ch.id;

          return (
            <button
              key={ch.id}
              onClick={() => {
                recordTap(`Viewed PRD chapter ${ch.id}`);
                setActiveSection(ch.id as any);
              }}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                isActive
                  ? 'bg-white dark:bg-stone-900 border-[#C85C43] shadow-sm ring-1 ring-[#C85C43]/30 text-[#C85C43]'
                  : 'bg-[#FAF7F0] dark:bg-[#1E1B18] border-[#EAE4DC] dark:border-stone-800 hover:border-[#807872]'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                isActive ? 'bg-[#C85C43] text-white' : 'bg-white dark:bg-stone-800 text-[#807872] dark:text-stone-300 border border-[#EAE4DC] dark:border-stone-700'
              }`}>
                <IconComp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-[#241A17] dark:text-stone-100 line-clamp-1">{ch.title}</div>
                <div className="text-[10px] text-[#807872] dark:text-stone-400 mt-0.5 line-clamp-1">{ch.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* PRD Content Body */}
      <div className="bg-white dark:bg-[#1E1B18] rounded-3xl border border-[#EAE4DC] dark:border-stone-800 p-6 sm:p-8 shadow-2xs space-y-8 text-xs text-[#241A17] dark:text-stone-200 leading-relaxed">
        
        {/* CHAPTER 1 */}
        {activeSection === 'principles' && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-[#C85C43] uppercase tracking-wider block">
                Chapter 1 · Foundations & Vision
              </span>
              <h2 className="text-xl font-black text-[#241A17] dark:text-stone-100 mt-1">
                Five Core Product Principles
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#FAF7F0] dark:bg-stone-900 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 space-y-1.5">
                <h3 className="font-extrabold text-[#241A17] dark:text-stone-100 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#241A17] dark:bg-stone-800 text-white text-[10px] flex items-center justify-center font-black">1</span>
                  Personalization without pressure
                </h3>
                <p className="text-[#807872] dark:text-stone-400">
                  The system learns quietly from customer actions without constant interrogative chatbots, aggressive popups, or artificial friendliness. Prefer "This looks like a good fit today" rather than "You NEED to try this!".
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F0] dark:bg-stone-900 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 space-y-1.5">
                <h3 className="font-extrabold text-[#241A17] dark:text-stone-100 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#241A17] dark:bg-stone-800 text-white text-[10px] flex items-center justify-center font-black">2</span>
                  Three strong choices
                </h3>
                <p className="text-[#807872] dark:text-stone-400">
                  The primary home dashboard presents exactly 3 curated recommendations (1 dominant hero + 2 secondary choices) to eliminate decision fatigue, while keeping Discovery Mode available underneath.
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F0] dark:bg-stone-900 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 space-y-1.5">
                <h3 className="font-extrabold text-[#241A17] dark:text-stone-100 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#241A17] dark:bg-stone-800 text-white text-[10px] flex items-center justify-center font-black">3</span>
                  User choice superior to system assumptions
                </h3>
                <p className="text-[#807872] dark:text-stone-400">
                  Remembered preferences are suggestions, never commands. The user can override, customize, or reject any recommendation at any moment without penalty.
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F0] dark:bg-stone-900 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 space-y-1.5">
                <h3 className="font-extrabold text-[#241A17] dark:text-stone-100 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#241A17] dark:bg-stone-800 text-white text-[10px] flex items-center justify-center font-black">4</span>
                  Meal first, restaurant second
                </h3>
                <p className="text-[#807872] dark:text-stone-400">
                  Discovery flow aligns with real human psychology: <em>Person → Context → Meal → Restaurant → Fulfillment</em>, rather than dumping restaurant directories.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#5F765A]/10 dark:bg-[#5F765A]/20 border border-[#5F765A]/30 text-[#241A17] dark:text-stone-200">
              <span className="font-bold text-[#5F765A] dark:text-[#7d9b77] block mb-1">
                Strategic Differentiator
              </span>
              <p className="text-xs text-[#807872] dark:text-stone-400">
                Major platforms optimize for infinite supply catalogs. Our platform attacks the opposite consumer pain point: <strong>"There are too many choices. Help me narrow them intelligently without friction."</strong>
              </p>
            </div>
          </div>
        )}

        {/* CHAPTER 2 */}
        {activeSection === 'recommendation' && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-[#C85C43] uppercase tracking-wider block">
                Chapter 2 · Mathematical Model
              </span>
              <h2 className="text-xl font-black text-[#241A17] dark:text-stone-100 mt-1">
                5-Layer Hybrid Recommendation Scoring Pipeline
              </h2>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-[#FAF7F0] dark:bg-stone-900 rounded-2xl border border-[#EAE4DC] dark:border-stone-800">
                <div className="font-extrabold text-sm text-[#241A17] dark:text-stone-100 mb-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-[10px] font-bold">Layer 1</span>
                  Hard Operational & Safety Constraints
                </div>
                <p className="text-[#807872] dark:text-stone-400">
                  Filters out closed kitchens, unavailable dishes, delivery unfeasibility, and <strong>strictly enforces declared safety allergens (peanuts, shellfish, dairy, etc.)</strong>. Safety sits above all promotional ranking.
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F0] dark:bg-stone-900 rounded-2xl border border-[#EAE4DC] dark:border-stone-800">
                <div className="font-extrabold text-sm text-[#241A17] dark:text-stone-100 mb-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold">Layer 2</span>
                  Explicit Preference Authority (+30 / -40 pts)
                </div>
                <p className="text-[#807872] dark:text-stone-400">
                  Explicit user declarations carry highest weight (preferred African cuisines +30, spice tolerance alignment +15, disliked ingredients -40 penalty).
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F0] dark:bg-stone-900 rounded-2xl border border-[#EAE4DC] dark:border-stone-800">
                <div className="font-extrabold text-sm text-[#241A17] dark:text-stone-100 mb-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">Layer 3</span>
                  Behavioral History & Ratings Signals (+25 / -45 pts)
                </div>
                <p className="text-[#807872] dark:text-stone-400">
                  Repeated re-orders (+15), high star ratings ≥4.8 (+30), poor ratings ≤2.5 (-45 penalty), soft rejection decay (-20 pts).
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F0] dark:bg-stone-900 rounded-2xl border border-[#EAE4DC] dark:border-stone-800">
                <div className="font-extrabold text-sm text-[#241A17] dark:text-stone-100 mb-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">Layer 4</span>
                  Contextual Time & Location Engine (+25 pts)
                </div>
                <p className="text-[#807872] dark:text-stone-400">
                  Active meal period alignment (Breakfast, Lunch, Snack, Dinner, Late Night), real-time distance radius, and budget feasibility.
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F0] dark:bg-stone-900 rounded-2xl border border-[#EAE4DC] dark:border-stone-800">
                <div className="font-extrabold text-sm text-[#241A17] dark:text-stone-100 mb-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-[10px] font-bold">Layer 5</span>
                  Top 3 Selection & Calm Light Explainability
                </div>
                <p className="text-[#807872] dark:text-stone-400">
                  Calculates composite rank and attaches 1 concise rationale (e.g. <em>"Fits your usual lunch"</em>, <em>"Similar to meals you rated highly"</em>, <em>"Fresh Nigerian favorite"</em>).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CHAPTER 3 */}
        {activeSection === 'data' && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-[#C85C43] uppercase tracking-wider block">
                Chapter 3 · Architecture & Schemas
              </span>
              <h2 className="text-xl font-black text-[#241A17] dark:text-stone-100 mt-1">
                Data Architecture & Event Bus
              </h2>
            </div>

            <div className="p-4 bg-[#FAF7F0] dark:bg-stone-900 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 font-mono text-[11px] overflow-x-auto text-[#241A17] dark:text-stone-200">
              <pre>{`User Entity
 ├── Profile (id, name, email, phone, locationId)
 ├── Preferences (explicitCuisines, preferredSpice, dietaryFlags, dislikedIngredients)
 ├── SafetyProfile (allergies[], strictSafetyEnforcement: boolean)
 ├── SavedLocations[] (max 10: Home, Office, Mum's place, Studio)
 ├── BehavioralSignals (orderedCount, ratings[], rejections[], rememberedCustomizations)
 └── OrderHistory[]

Restaurant Entity
 ├── Profile (id, name, tagline, city, coordinates, verified: boolean)
 ├── OperatingState (isOpen, orderAcceptanceMode: 'manual' | 'auto', hours)
 ├── Fulfillment (deliveryFee, minOrder, estMinutesMin, estMinutesMax)
 └── Menus -> Meal[]

Meal Entity
 ├── Details (id, name, nativeName, category, priceNGN, priceGBP, rating)
 ├── Ingredients[] & Allergens[] (peanuts, shellfish, gluten, dairy, fish)
 ├── SpiceLevel ('none' | 'mild' | 'medium' | 'hot' | 'extra_hot')
 ├── MealPeriods[] (breakfast, lunch, snack, dinner, late_night)
 └── CustomizationOptions[] (priceDelta, category, isDefault)

Event Schema (Learning Stream)
 ├── meal_viewed, meal_rejected, customization_selected, order_completed
 └── rating_submitted (separated: foodRating, restaurantRating, deliveryRating)`}</pre>
            </div>
          </div>
        )}

        {/* CHAPTER 4 */}
        {activeSection === 'ordering' && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-[#C85C43] uppercase tracking-wider block">
                Chapter 4 · UX & Efficiency
              </span>
              <h2 className="text-xl font-black text-[#241A17] dark:text-stone-100 mt-1">
                Low-Friction Ordering: ≤21 Taps Target
              </h2>
            </div>

            <div className="p-4 bg-[#FAF7F0] dark:bg-stone-900 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 space-y-3">
              <p className="text-[#807872] dark:text-stone-400">
                A returning user completes an order in <strong>≤21 taps</strong> from opening the app to order confirmation.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white dark:bg-stone-800 p-3 rounded-xl border border-[#EAE4DC] dark:border-stone-700">
                  <span className="font-extrabold text-[#C85C43] text-lg block">1 Tap</span>
                  <span className="text-[#807872] dark:text-stone-400">Open App / Select 3-Meal</span>
                </div>
                <div className="bg-white dark:bg-stone-800 p-3 rounded-xl border border-[#EAE4DC] dark:border-stone-700">
                  <span className="font-extrabold text-[#C85C43] text-lg block">1 Tap</span>
                  <span className="text-[#807872] dark:text-stone-400">1-Tap Quick Add to Cart</span>
                </div>
                <div className="bg-white dark:bg-stone-800 p-3 rounded-xl border border-[#EAE4DC] dark:border-stone-700">
                  <span className="font-extrabold text-[#C85C43] text-lg block">1 Tap</span>
                  <span className="text-[#807872] dark:text-stone-400">Open Fast Checkout</span>
                </div>
                <div className="bg-white dark:bg-stone-800 p-3 rounded-xl border border-[#EAE4DC] dark:border-stone-700">
                  <span className="font-extrabold text-[#5F765A] dark:text-[#7d9b77] text-lg block">1 Tap</span>
                  <span className="text-[#807872] dark:text-stone-400">Confirm & Place Order</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHAPTER 5 */}
        {activeSection === 'strategy' && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold text-[#C85C43] uppercase tracking-wider block">
                Chapter 5 · Growth & Expansion
              </span>
              <h2 className="text-xl font-black text-[#241A17] dark:text-stone-100 mt-1">
                Port Harcourt Pilot → UK African-Food Expansion
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#FAF7F0] dark:bg-stone-900 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 space-y-2">
                <span className="text-[11px] font-black text-[#C85C43] uppercase tracking-wider">
                  Phase 5 · Port Harcourt Pilot
                </span>
                <p className="text-[#807872] dark:text-stone-400">
                  Initial test cohort in Port Harcourt (Old GRA, Peter Odili, Trans-Amadi) validating recommendation click-through, tap efficiency, and repeat ordering behavior under real operational logistics.
                </p>
              </div>

              <div className="p-4 bg-[#FAF7F0] dark:bg-stone-900 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 space-y-2">
                <span className="text-[11px] font-black text-[#5F765A] dark:text-[#7d9b77] uppercase tracking-wider">
                  Phase 6 · Strategic UK Expansion
                </span>
                <p className="text-[#807872] dark:text-stone-400">
                  Deploying to London (Peckham, Woolwich, Tottenham), Manchester, and Birmingham with native GBP pricing, UK postcode geocoding, hybrid delivery providers, and comprehensive African cuisine taxonomy.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
