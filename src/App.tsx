import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HomeRecommendations } from './components/HomeRecommendations';
import { DiscoveryMode } from './components/DiscoveryMode';
import { ProfilePage } from './components/ProfilePage';
import { MerchantDashboard } from './components/MerchantDashboard';
import { CourierDashboard } from './components/CourierDashboard';
import { PrdBlueprintModal } from './components/PrdBlueprintModal';
import { MealDetailModal } from './components/MealDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { PreferenceSafetyModal } from './components/PreferenceSafetyModal';
import { RestaurantDetailsModal } from './components/RestaurantDetailsModal';

const MainContent: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    currentLocation, 
    userProfile,
    isRestaurantDetailsModalOpen,
    selectedRestaurantForDetails,
    closeRestaurantDetailsModal
  } = useApp();

  const isCustomer = userProfile.role === 'customer';
  const isMerchant = userProfile.role === 'restaurant_staff';
  const isCourier = userProfile.role === 'courier';

  return (
    <div className="min-h-screen bg-[#FAF7F0] dark:bg-[#141210] text-[#241A17] dark:text-stone-100 flex flex-col font-sans selection:bg-[#C85C43]/20 transition-colors">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main View Area with Calm Fade-in Transition */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
          >
            {currentView === 'home' && <HomeRecommendations />}
            {currentView === 'discovery' && <DiscoveryMode />}
            {currentView === 'profile' && <ProfilePage />}
            {currentView === 'merchant' && <MerchantDashboard />}
            {currentView === 'courier' && <CourierDashboard />}
            {currentView === 'prd' && <PrdBlueprintModal />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Modals & Drawers */}
      <MealDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackingModal />
      <PreferenceSafetyModal />
      <RestaurantDetailsModal
        isOpen={isRestaurantDetailsModalOpen}
        restaurant={selectedRestaurantForDetails}
        onClose={closeRestaurantDetailsModal}
      />

      {/* Product Footer */}
      <footer className="border-t border-[#EAE4DC] dark:border-stone-800 bg-white/70 dark:bg-[#181512]/70 backdrop-blur-xs py-8 mt-12 text-xs text-[#807872] dark:text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#C85C43] text-white flex items-center justify-center font-black text-sm">
                O
              </div>
              <div>
                <span className="font-extrabold text-[#241A17] dark:text-stone-100">Ounjé</span>
                <span className="text-[11px] text-[#807872] dark:text-stone-400 block">
                  Personalized African Cuisine Marketplace · Port Harcourt & UK
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#807872] dark:text-stone-400">
              {isCustomer && (
                <>
                  <button 
                    onClick={() => setCurrentView('home')} 
                    className="hover:text-[#241A17] dark:hover:text-stone-100 transition-colors"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => setCurrentView('discovery')} 
                    className="hover:text-[#241A17] dark:hover:text-stone-100 transition-colors"
                  >
                    Discovery
                  </button>
                </>
              )}
              {isMerchant && (
                <button 
                  onClick={() => setCurrentView('merchant')} 
                  className="hover:text-[#241A17] dark:hover:text-stone-100 transition-colors"
                >
                  Kitchen Portal
                </button>
              )}
              {isCourier && (
                <button 
                  onClick={() => setCurrentView('courier')} 
                  className="hover:text-[#241A17] dark:hover:text-stone-100 transition-colors"
                >
                  Courier Portal
                </button>
              )}
              <button 
                onClick={() => setCurrentView('profile')} 
                className="hover:text-[#241A17] dark:hover:text-stone-100 transition-colors"
              >
                Profile & Settings
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#807872] dark:text-stone-400">
              <span className="inline-block w-2 h-2 rounded-full bg-[#5F765A]" />
              <span>{currentLocation.city} Pilot Active</span>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
