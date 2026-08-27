import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bike, 
  MapPin, 
  Clock, 
  Navigation, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Store,
  User,
  Radio,
  Coffee,
  Check
} from 'lucide-react';
import { LiveCourierChatModal } from './LiveCourierChatModal';

export const CourierDashboard: React.FC = () => {
  const {
    userProfile,
    updateCourierProfile,
    orders,
    updateOrderStatus,
    recordTap,
    currentLocation,
    setCurrentView
  } = useApp();

  const courier = userProfile.courier || {
    courierId: 'RID-PH-4091',
    riderName: userProfile.name || 'Courier Partner',
    phone: userProfile.phone || '+234 802 443 1928',
    vehicleType: 'motorcycle',
    vehicleModel: 'Honda Ace 125cc Motorbike',
    plateNumber: 'RVS-482-PH',
    licenseNumber: 'DL-RV-829104-B',
    activeStatus: 'active',
    rating: 4.96,
    totalDeliveries: 842,
    onTimeRate: 99.1,
    todayEarningsNGN: 18500,
    todayEarningsGBP: 48.50,
    activeZone: `${currentLocation.city} Pilot Zone`,
    payoutBank: {
      bankName: 'Access Bank PLC',
      accountNumber: '0129849201',
      accountName: 'Courier Partner'
    },
    emergencyContact: {
      name: 'Grace Okonkwo',
      phone: '+234 803 771 9021',
      relationship: 'Sister'
    },
    equipmentVerified: {
      insulatedThermalBag: true,
      protectiveHelmet: true,
      phoneMountReady: true,
      tamperSealKit: true
    },
    preferredNavApp: 'google_maps'
  };

  const isUK = currentLocation.currency === 'GBP';
  const currencySymbol = isUK ? '£' : '₦';
  const todayEarnings = isUK ? courier.todayEarningsGBP : courier.todayEarningsNGN;

  // Active in-flight orders that courier can fulfill
  const activeDeliveryOrders = orders.filter(
    o => o.status === 'out_for_delivery' || o.status === 'preparing' || o.status === 'ready_for_pickup'
  );

  const [selectedChatOrderId, setSelectedChatOrderId] = useState<string | null>(null);
  const [selectedOrderTab, setSelectedOrderTab] = useState<'active' | 'available' | 'completed'>('active');

  // Simulated available dispatches in the area
  const [availableDispatches, setAvailableDispatches] = useState([
    {
      id: 'disp_001',
      restaurantName: 'Native Bole Spot & Seafood Grill',
      restaurantAddress: '14 Forces Avenue, Old GRA',
      customerName: 'Amina K.',
      customerAddress: 'Plot 12, Tombia St, GRA Phase 2',
      itemsCount: 3,
      payout: isUK ? 4.80 : 1950,
      distanceKm: 2.1,
      estimatedMins: 16,
      readyInMins: 4
    },
    {
      id: 'disp_002',
      restaurantName: 'The Jollof & Grill Embassy',
      restaurantAddress: '28 Peter Odili Road, Trans-Amadi',
      customerName: 'Tunde B.',
      customerAddress: 'Block 4, Golf Estate Phase 1',
      itemsCount: 2,
      payout: isUK ? 5.50 : 2300,
      distanceKm: 3.4,
      estimatedMins: 22,
      readyInMins: 8
    }
  ]);

  const handleAcceptDispatch = (dispatchId: string) => {
    recordTap(`Courier accepted dispatch ${dispatchId}`);
    const accepted = availableDispatches.find(d => d.id === dispatchId);
    if (!accepted) return;
    setAvailableDispatches(prev => prev.filter(d => d.id !== dispatchId));
    // Provide instant feedback
    alert(`Dispatch accepted! Proceed to ${accepted.restaurantName} for pickup.`);
  };

  const handleStatusUpdate = (orderId: string, nextStatus: any) => {
    recordTap(`Courier updated order ${orderId} to ${nextStatus}`);
    updateOrderStatus(orderId, nextStatus);
  };

  const handleToggleStatus = (newStatus: 'active' | 'on_break' | 'offline') => {
    recordTap(`Courier status changed to ${newStatus}`);
    updateCourierProfile({ activeStatus: newStatus });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Courier Header Bar */}
      <div className="bg-white dark:bg-[#1E1B18] rounded-3xl p-5 sm:p-7 border border-[#EAE4DC] dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-2xl shrink-0">
            <Bike className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#241A17] dark:text-stone-100 tracking-tight">
                {courier.riderName}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#FAF7F0] dark:bg-stone-800 text-[#807872] dark:text-stone-300 border border-[#EAE4DC] dark:border-stone-700">
                {courier.courierId}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                ⭐ {courier.rating.toFixed(2)} ({courier.totalDeliveries} trips)
              </span>
            </div>
            <p className="text-xs text-[#807872] dark:text-stone-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>{courier.vehicleModel} ({courier.plateNumber})</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#C85C43]" /> {courier.activeZone}
              </span>
            </p>
          </div>
        </div>

        {/* Status Control & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Duty Status Selector */}
          <div className="flex items-center p-1 bg-[#FAF7F0] dark:bg-stone-900 rounded-full border border-[#EAE4DC] dark:border-stone-800 text-xs font-bold">
            <button
              onClick={() => handleToggleStatus('active')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                courier.activeStatus === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17]'
              }`}
            >
              <Radio className={`w-3 h-3 ${courier.activeStatus === 'active' ? 'animate-pulse' : ''}`} />
              <span>On Duty</span>
            </button>
            <button
              onClick={() => handleToggleStatus('on_break')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                courier.activeStatus === 'on_break'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17]'
              }`}
            >
              <Coffee className="w-3 h-3" />
              <span>Break</span>
            </button>
            <button
              onClick={() => handleToggleStatus('offline')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                courier.activeStatus === 'offline'
                  ? 'bg-stone-600 text-white shadow-xs'
                  : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17]'
              }`}
            >
              <span>Offline</span>
            </button>
          </div>

          <button
            onClick={() => {
              recordTap('Courier opened profile settings');
              setCurrentView('profile');
            }}
            className="px-4 py-2 rounded-full border border-[#EAE4DC] dark:border-stone-800 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-200 text-xs font-bold hover:border-[#C85C43]/50 transition-colors"
          >
            Courier Profile & Wallet
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#1E1B18] p-4 sm:p-5 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#807872] dark:text-stone-400 mb-1">
            <span>Today's Shift Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#241A17] dark:text-stone-100">
            {currencySymbol}{todayEarnings.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +15% vs yesterday
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E1B18] p-4 sm:p-5 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#807872] dark:text-stone-400 mb-1">
            <span>Completed Trips</span>
            <Bike className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#241A17] dark:text-stone-100">
            7 Deliveries
          </div>
          <p className="text-[11px] text-[#807872] dark:text-stone-400 mt-1">
            Avg speed: 18 min / trip
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E1B18] p-4 sm:p-5 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#807872] dark:text-stone-400 mb-1">
            <span>On-Time Rate</span>
            <Clock className="w-4 h-4 text-[#5F765A]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#5F765A]">
            {courier.onTimeRate}%
          </div>
          <p className="text-[11px] text-[#807872] dark:text-stone-400 mt-1">
            Target: ≥98.0%
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E1B18] p-4 sm:p-5 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#807872] dark:text-stone-400 mb-1">
            <span>Equipment Check</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Thermal Bag & Seals OK</span>
          </div>
          <p className="text-[11px] text-[#807872] dark:text-stone-400 mt-1">
            Inspected for food safety
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation: Active In-Flight vs Available Dispatches vs Delivery History */}
      <div className="flex items-center gap-2 border-b border-[#EAE4DC] dark:border-stone-800 pb-2">
        <button
          onClick={() => setSelectedOrderTab('active')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            selectedOrderTab === 'active'
              ? 'bg-[#241A17] dark:bg-stone-800 text-white'
              : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17]'
          }`}
        >
          <span>Active In-Flight Deliveries</span>
          <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">
            {activeDeliveryOrders.length}
          </span>
        </button>

        <button
          onClick={() => setSelectedOrderTab('available')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            selectedOrderTab === 'available'
              ? 'bg-[#241A17] dark:bg-stone-800 text-white'
              : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17]'
          }`}
        >
          <span>Available Nearby Dispatches</span>
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-black">
            {availableDispatches.length}
          </span>
        </button>

        <button
          onClick={() => setSelectedOrderTab('completed')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            selectedOrderTab === 'completed'
              ? 'bg-[#241A17] dark:bg-stone-800 text-white'
              : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17]'
          }`}
        >
          Completed Today
        </button>
      </div>

      {/* Tab Contents */}
      {selectedOrderTab === 'active' && (
        <div className="space-y-4">
          {activeDeliveryOrders.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1B18] rounded-3xl p-10 border border-[#EAE4DC] dark:border-stone-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center font-bold">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#241A17] dark:text-stone-100">
                No active delivery in transit
              </h3>
              <p className="text-xs text-[#807872] dark:text-stone-400 max-w-md mx-auto">
                You are currently online and eligible for instant dispatch assignments. Check available nearby orders below to accept your next delivery!
              </p>
              <button
                onClick={() => setSelectedOrderTab('available')}
                className="px-5 py-2.5 rounded-full bg-[#C85C43] text-white text-xs font-bold hover:bg-[#B44F37] transition-all"
              >
                Browse Available Dispatches ({availableDispatches.length})
              </button>
            </div>
          ) : (
            activeDeliveryOrders.map(order => {
              const isPickedUp = order.status === 'out_for_delivery';
              return (
                <div 
                  key={order.id}
                  className="bg-white dark:bg-[#1E1B18] rounded-3xl p-5 sm:p-6 border-2 border-amber-500/40 dark:border-amber-500/30 shadow-md space-y-5"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE4DC] dark:border-stone-800">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-[#241A17] dark:text-stone-100">
                            Order #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300">
                            {order.status === 'out_for_delivery' ? '🚴 In Transit to Customer' : '👨‍🍳 Kitchen Preparing Order'}
                          </span>
                        </div>
                        <p className="text-xs text-[#807872] dark:text-stone-400">
                          {order.items.length} items · Total value {order.currency === 'GBP' ? '£' : '₦'}{(order.total ?? 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Quick Live Chat Button with Customer */}
                    <button
                      onClick={() => {
                        recordTap('Courier opened live chat with customer');
                        setSelectedChatOrderId(order.id);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-[#FAF7F0] dark:bg-stone-800 hover:bg-[#EAE4DC] dark:hover:bg-stone-700 text-[#241A17] dark:text-stone-100 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#C85C43]" />
                      <span>Chat with Customer</span>
                      {order.courierMessages && order.courierMessages.length > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#C85C43] text-white text-[9px] flex items-center justify-center font-bold">
                          {order.courierMessages.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Two-Column Delivery Route Details: Pickup vs Dropoff */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pickup Point: Restaurant */}
                    <div className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#807872] dark:text-stone-400 uppercase tracking-wider">
                        <Store className="w-4 h-4 text-[#C85C43]" />
                        <span>1. Kitchen Pickup Point</span>
                      </div>
                      <p className="font-extrabold text-sm text-[#241A17] dark:text-stone-100">
                        {order.items[0]?.restaurantName || 'Assigned Restaurant'}
                      </p>
                      <p className="text-xs text-[#807872] dark:text-stone-400">
                        14 Forces Avenue, Old GRA, Port Harcourt
                      </p>
                      <div className="pt-1 flex items-center gap-2">
                        <a 
                          href="tel:+2348030000000" 
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-[#EAE4DC] dark:border-stone-700 text-[11px] font-semibold text-[#241A17] dark:text-stone-200 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-[#5F765A]" /> Call Kitchen
                        </a>
                        <button
                          onClick={() => alert('Opening turn-by-turn navigation in ' + courier.preferredNavApp)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-[#EAE4DC] dark:border-stone-700 text-[11px] font-semibold text-[#241A17] dark:text-stone-200 flex items-center gap-1"
                        >
                          <Navigation className="w-3 h-3 text-blue-500" /> Navigate
                        </button>
                      </div>
                    </div>

                    {/* Dropoff Point: Customer */}
                    <div className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#807872] dark:text-stone-400 uppercase tracking-wider">
                        <User className="w-4 h-4 text-[#5F765A]" />
                        <span>2. Customer Dropoff Point</span>
                      </div>
                      <p className="font-extrabold text-sm text-[#241A17] dark:text-stone-100">
                        {order.deliveryAddress?.label || 'Home'} ({order.deliveryAddress?.address || 'Customer Location'})
                      </p>
                      <p className="text-xs text-[#807872] dark:text-stone-400">
                        Note: "Please call on arrival at the estate security gate."
                      </p>
                      <div className="pt-1 flex items-center gap-2">
                        <a 
                          href="tel:+2348035550192" 
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-[#EAE4DC] dark:border-stone-700 text-[11px] font-semibold text-[#241A17] dark:text-stone-200 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-[#5F765A]" /> Call Customer
                        </a>
                        <button
                          onClick={() => alert('Opening turn-by-turn navigation in ' + courier.preferredNavApp)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-[#EAE4DC] dark:border-stone-700 text-[11px] font-semibold text-[#241A17] dark:text-stone-200 flex items-center gap-1"
                        >
                          <Navigation className="w-3 h-3 text-blue-500" /> Navigate
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-950 border border-[#EAE4DC] dark:border-stone-800">
                    <p className="text-xs font-bold text-[#807872] dark:text-stone-400 mb-2">
                      Package Verification Items ({order.items.length}):
                    </p>
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-[#241A17] dark:text-stone-200">
                          <span className="font-semibold">{item.quantity}x {item.mealName}</span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Sealed in Thermal Bag
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Courier Action Transition Controls */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    {!isPickedUp ? (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'out_for_delivery')}
                        className="w-full sm:w-auto px-6 py-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm Pickup from Kitchen (Seals Verified)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'delivered')}
                        className="w-full sm:w-auto px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete Delivery & Hand Over to Customer</span>
                      </button>
                    )}

                    <div className="text-[11px] text-[#807872] dark:text-stone-400">
                      Standard Payout for this trip: <strong className="text-[#241A17] dark:text-stone-200">{currencySymbol}{isUK ? '4.50' : '1,800'}</strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Available Dispatches Tab */}
      {selectedOrderTab === 'available' && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
            <Radio className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-bold">Live Dispatch Broadcast Active</p>
              <p className="mt-0.5 text-[11px]">
                Orders ready or in prep at partnered restaurants within your {courier.activeZone}. Tap to claim instant delivery dispatch.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableDispatches.map(disp => (
              <div
                key={disp.id}
                className="bg-white dark:bg-[#1E1B18] p-5 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-xs space-y-4 hover:border-amber-500/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF7F0] dark:bg-stone-800 text-[#807872] dark:text-stone-400">
                      {disp.distanceKm} km · ~{disp.estimatedMins} min delivery
                    </span>
                    <h3 className="font-extrabold text-base text-[#241A17] dark:text-stone-100 mt-1.5">
                      {disp.restaurantName}
                    </h3>
                    <p className="text-xs text-[#807872] dark:text-stone-400">
                      Pickup: {disp.restaurantAddress}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">
                      +{currencySymbol}{disp.payout.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#807872] dark:text-stone-400">
                      Estimated payout
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 text-xs space-y-1">
                  <div className="text-[#807872] dark:text-stone-400 flex items-center justify-between">
                    <span>Dropoff: <strong>{disp.customerAddress}</strong></span>
                    <span>{disp.itemsCount} items</span>
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                    Kitchen ready in ~{disp.readyInMins} mins
                  </div>
                </div>

                <button
                  onClick={() => handleAcceptDispatch(disp.id)}
                  className="w-full py-2.5 rounded-full bg-[#C85C43] hover:bg-[#B44F37] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept Dispatch & Start Trip</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Today Tab */}
      {selectedOrderTab === 'completed' && (
        <div className="bg-white dark:bg-[#1E1B18] rounded-3xl p-6 border border-[#EAE4DC] dark:border-stone-800 space-y-4">
          <h3 className="font-extrabold text-sm text-[#241A17] dark:text-stone-100">
            Completed Trips for Today's Shift
          </h3>
          <div className="divide-y divide-[#EAE4DC] dark:divide-stone-800 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-[#241A17] dark:text-stone-200">
                  Native Bole Spot ➔ Forces Ave Residence
                </p>
                <p className="text-[11px] text-[#807872] dark:text-stone-400">
                  Delivered at 1:42 PM · 14 mins · ⭐ 5.0 Rating (Customer tipped {currencySymbol}{isUK ? '1.50' : '500'})
                </p>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +{currencySymbol}{isUK ? '5.50' : '2,300'}
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-[#241A17] dark:text-stone-200">
                  Jollof & Grill Embassy ➔ Peter Odili Office
                </p>
                <p className="text-[11px] text-[#807872] dark:text-stone-400">
                  Delivered at 12:15 PM · 19 mins · ⭐ 5.0 Rating
                </p>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +{currencySymbol}{isUK ? '4.20' : '1,750'}
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-[#241A17] dark:text-stone-200">
                  Mama Put Heritage ➔ Old GRA Phase 2
                </p>
                <p className="text-[11px] text-[#807872] dark:text-stone-400">
                  Delivered at 11:02 AM · 16 mins · ⭐ 5.0 Rating
                </p>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +{currencySymbol}{isUK ? '4.80' : '1,900'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Live Courier Chat Modal */}
      {selectedChatOrderId && (
        <LiveCourierChatModal
          orderId={selectedChatOrderId}
          onClose={() => setSelectedChatOrderId(null)}
        />
      )}

    </div>
  );
};
