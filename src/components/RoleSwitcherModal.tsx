import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Store, 
  Bike, 
  Check, 
  X, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UserRole } from '../types';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, setUserRole, recordTap } = useApp();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const roles: {
    id: UserRole;
    title: string;
    subtitle: string;
    description: string;
    icon: any;
    badge: string;
    highlightColor: string;
    features: string[];
  }[] = [
    {
      id: 'customer',
      title: 'Customer Experience',
      subtitle: 'Personalized Food Discovery',
      description: 'Clean, distraction-free view with curated meals, dietary/allergen protection, and 1-tap ordering.',
      icon: User,
      badge: 'Active Default',
      highlightColor: '#C85C43',
      features: [
        'Curated contextual recommendations matched to palate',
        'Strict allergen & ingredient exclusion filters',
        'Macro & nutritional transparency breakdown',
        'Live courier chat & direct call support',
        '1-tap fast reorder shelf'
      ]
    },
    {
      id: 'restaurant_staff',
      title: 'Restaurant Partner Portal',
      subtitle: 'Kitchen & Menu Operations',
      description: 'Dedicated merchant operations interface for restaurant staff and chefs to accept orders and manage live stock.',
      icon: Store,
      badge: 'Staff Only',
      highlightColor: '#5F765A',
      features: [
        'Real-time order incoming queue & status updates',
        'Instant dish availability & 86 toggle',
        'Operating hours & auto-acceptance controls',
        'Customer allergen notes & prep alerts'
      ]
    },
    {
      id: 'courier',
      title: 'Delivery Courier',
      subtitle: 'Dispatch & Route Operations',
      description: 'Streamlined logistics interface for active delivery riders and couriers.',
      icon: Bike,
      badge: 'Rider App',
      highlightColor: '#C9A45C',
      features: [
        'Live turn-by-turn route dispatch & ETA',
        'Customer delivery notes & gate access codes',
        'In-app live customer chat & call sync'
      ]
    }
  ];

  const handleSelectRole = (role: UserRole) => {
    setUserRole(role);
    recordTap(`Switched role to ${role}`);
    onClose();
  };

  return createPortal(
    <div 
      id="role-switcher-backdrop"
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="role-switcher-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1E1B18] w-full max-w-xl rounded-t-[28px] sm:rounded-3xl overflow-hidden shadow-2xl border-t sm:border border-[#EAE4DC] dark:border-stone-800 flex flex-col max-h-[88vh] sm:max-h-[90vh] my-0 sm:my-auto animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="w-12 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#EAE4DC] dark:border-stone-800 flex items-start sm:items-center justify-between bg-[#FAF7F0] dark:bg-[#181512] shrink-0">
          <div className="pr-2">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#807872] dark:text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C85C43]" />
              <span>Role-Based Authentication</span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-[#241A17] dark:text-stone-100 mt-0.5 sm:mt-1">
              Select Workspace Mode
            </h2>
            <p className="text-[11px] sm:text-xs text-[#807872] dark:text-stone-400 mt-0.5">
              Switch roles to experience Customer, Restaurant Staff, or Courier mode.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-[#807872] dark:text-stone-300 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Roles List */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4">
          {roles.map(role => {
            const IconComp = role.icon;
            const isCurrent = userProfile.role === role.id;

            return (
              <button
                type="button"
                id={`role-select-${role.id}`}
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                className={`w-full p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer text-left relative block ${
                  isCurrent 
                    ? 'bg-[#FAF7F0] dark:bg-stone-900/90 shadow-sm ring-2' 
                    : 'bg-white dark:bg-[#1E1B18] border-[#EAE4DC] dark:border-stone-800 hover:border-[#241A17] dark:hover:border-stone-600'
                }`}
                style={{
                  borderColor: isCurrent ? role.highlightColor : undefined,
                  boxShadow: isCurrent ? `0 0 0 1px ${role.highlightColor}` : undefined
                }}
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div 
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs font-bold"
                      style={{ backgroundColor: role.highlightColor }}
                    >
                      <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm sm:text-base font-extrabold text-[#241A17] dark:text-stone-100 truncate">
                          {role.title}
                        </h3>
                        {isCurrent && (
                          <span 
                            className="px-2 py-0.5 rounded-full text-white text-[9px] sm:text-[10px] font-bold shadow-2xs shrink-0"
                            style={{ backgroundColor: role.highlightColor }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#807872] dark:text-stone-400 truncate">
                        {role.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isCurrent ? (
                      <div 
                        className="w-7 h-7 rounded-full text-white flex items-center justify-center shadow-2xs"
                        style={{ backgroundColor: role.highlightColor }}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 rounded-full border border-[#EAE4DC] dark:border-stone-700 text-[11px] sm:text-xs font-bold text-[#807872] dark:text-stone-300 flex items-center gap-1 hover:bg-[#FAF7F0] dark:hover:bg-stone-800">
                        <span>Switch</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#241A17]/80 dark:text-stone-300 mt-1 mb-2.5 leading-relaxed">
                  {role.description}
                </p>

                {/* Features preview */}
                <div className="space-y-1 pt-2 border-t border-[#EAE4DC]/60 dark:border-stone-800 text-[11px] text-[#807872] dark:text-stone-400">
                  {role.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 min-w-0">
                      <span 
                        className="w-1.5 h-1.5 rounded-full shrink-0" 
                        style={{ backgroundColor: role.highlightColor }}
                      />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-5 border-t border-[#EAE4DC] dark:border-stone-800 bg-[#FAF7F0] dark:bg-[#181512] flex items-center justify-between text-xs text-[#807872] dark:text-stone-400 shrink-0">
          <span className="truncate pr-2">Role: <strong className="text-[#241A17] dark:text-stone-200 capitalize">{userProfile.role.replace('_', ' ')}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-white dark:bg-stone-800 border border-[#EAE4DC] dark:border-stone-700 font-bold text-[#241A17] dark:text-stone-200 hover:bg-[#FAF7F0] dark:hover:bg-stone-700 transition-colors shrink-0 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
