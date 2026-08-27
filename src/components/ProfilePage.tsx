import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  ChefHat, 
  Bike, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { UserRole } from '../types';
import { CustomerProfileView } from './CustomerProfileView';
import { KitchenProfileView } from './KitchenProfileView';
import { CourierProfileView } from './CourierProfileView';

export const ProfilePage: React.FC = () => {
  const { 
    userProfile, 
    setUserRole, 
    setCurrentView,
    recordTap,
    merchantRestaurants,
    activeMerchantRestaurantId
  } = useApp();

  const [isRoleInfoOpen, setIsRoleInfoOpen] = useState(false);

  const activeRestaurant = merchantRestaurants.find(r => r.id === activeMerchantRestaurantId) || merchantRestaurants[0];

  const handleRoleSwitch = (newRole: UserRole) => {
    recordTap(`Switched user role from ${userProfile.role} to ${newRole}`);
    setUserRole(newRole, { navigate: false });
  };

  const roleMeta: Record<UserRole, { label: string; icon: React.ReactNode; badge: string; color: string; desc: string }> = {
    customer: {
      label: 'Customer Gourmet',
      icon: <User className="w-4 h-4 text-[#C85C43]" />,
      badge: 'Food Explorer',
      color: 'border-[#C85C43] bg-[#C85C43]/10 text-[#C85C43]',
      desc: 'Allergen guard, African culinary preferences, delivery addresses, past meals & saved cards.'
    },
    restaurant_staff: {
      label: 'Kitchen Staff & Chef',
      icon: <ChefHat className="w-4 h-4 text-[#5F765A]" />,
      badge: 'Food Hygiene 5/5',
      color: 'border-[#5F765A] bg-[#5F765A]/10 text-[#5F765A]',
      desc: 'Station assignments, hygiene licenses, daily cold-chain logs & live operating settings.'
    },
    courier: {
      label: 'Dispatch Rider / Courier',
      icon: <Bike className="w-4 h-4 text-amber-600" />,
      badge: 'Verified Courier',
      color: 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400',
      desc: 'Vehicle license, daily earnings wallet, thermal equipment checks & delivery zones.'
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Role Switcher Toolbar */}
      <div className="bg-white dark:bg-[#1E1B18] rounded-3xl p-4 sm:p-5 border border-[#EAE4DC] dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#807872] dark:text-stone-400">
              Active Experience Profile:
            </span>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${roleMeta[userProfile.role].color}`}>
              {roleMeta[userProfile.role].label}
            </span>
          </div>
          <p className="text-xs text-[#807872] dark:text-stone-400 mt-1">
            {roleMeta[userProfile.role].desc}
          </p>
        </div>

        {/* Role Switcher Pills & Portal Shortcut */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF7F0] dark:bg-stone-900 rounded-full border border-[#EAE4DC] dark:border-stone-800 overflow-x-auto w-full sm:w-auto shrink-0 justify-between sm:justify-start">
            <button
              onClick={() => handleRoleSwitch('customer')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                userProfile.role === 'customer'
                  ? 'bg-[#C85C43] text-white shadow-xs'
                  : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>

            <button
              onClick={() => handleRoleSwitch('restaurant_staff')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                userProfile.role === 'restaurant_staff'
                  ? 'bg-[#5F765A] text-white shadow-xs'
                  : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Kitchen Staff</span>
            </button>

            <button
              onClick={() => handleRoleSwitch('courier')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                userProfile.role === 'courier'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17] dark:hover:text-stone-200'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Courier</span>
            </button>
          </div>

          <button
            onClick={() => {
              recordTap(`Launched workspace for role: ${userProfile.role}`);
              if (userProfile.role === 'restaurant_staff') setCurrentView('merchant');
              else if (userProfile.role === 'courier') setCurrentView('courier');
              else setCurrentView('home');
            }}
            className="px-3.5 py-2 rounded-full text-xs font-bold bg-[#241A17] dark:bg-stone-800 text-white hover:bg-black dark:hover:bg-stone-700 flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap w-full sm:w-auto"
          >
            <span>Go to Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Role-Aware Dynamic View Rendering */}
      {userProfile.role === 'customer' && <CustomerProfileView />}
      {userProfile.role === 'restaurant_staff' && <KitchenProfileView />}
      {userProfile.role === 'courier' && <CourierProfileView />}

    </div>
  );
};
