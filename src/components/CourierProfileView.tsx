import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bike, 
  MapPin, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Phone, 
  User, 
  CreditCard, 
  Check, 
  Edit3, 
  Radio, 
  Coffee, 
  AlertCircle, 
  Navigation, 
  Award,
  TrendingUp,
  FileText,
  Sliders
} from 'lucide-react';

export const CourierProfileView: React.FC = () => {
  const {
    userProfile,
    updateCourierProfile,
    currentLocation,
    setCurrentView,
    recordTap
  } = useApp();

  const courier = userProfile.courier || {
    courierId: 'RID-PH-4091',
    riderName: userProfile.name || 'Emmanuel Okonkwo',
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
    activeZone: `${currentLocation.city} (Old GRA, Trans-Amadi, Peter Odili & Stadium Rd)`,
    payoutBank: {
      bankName: 'Access Bank PLC',
      accountNumber: '0129849201',
      accountName: 'Emmanuel Okonkwo'
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

  const [activeSubTab, setActiveSubTab] = useState<'rider_vehicle' | 'wallet' | 'equipment' | 'settings'>('rider_vehicle');
  const [isEditingRider, setIsEditingRider] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);

  // Edit rider state
  const [riderName, setRiderName] = useState(courier.riderName);
  const [riderPhone, setRiderPhone] = useState(courier.phone);
  const [vehicleModel, setVehicleModel] = useState(courier.vehicleModel);
  const [plateNumber, setPlateNumber] = useState(courier.plateNumber);
  const [licenseNumber, setLicenseNumber] = useState(courier.licenseNumber);
  const [activeZone, setActiveZone] = useState(courier.activeZone);

  // Edit bank state
  const [bankName, setBankName] = useState(courier.payoutBank.bankName);
  const [accountNumber, setAccountNumber] = useState(courier.payoutBank.accountNumber);
  const [accountName, setAccountName] = useState(courier.payoutBank.accountName);

  const handleSaveRiderInfo = (e: React.FormEvent) => {
    e.preventDefault();
    recordTap('Saved courier profile updates');
    updateCourierProfile({
      riderName,
      phone: riderPhone,
      vehicleModel,
      plateNumber,
      licenseNumber,
      activeZone
    });
    setIsEditingRider(false);
  };

  const handleSaveBankInfo = (e: React.FormEvent) => {
    e.preventDefault();
    recordTap('Saved courier payout bank updates');
    updateCourierProfile({
      payoutBank: {
        bankName,
        accountNumber,
        accountName
      }
    });
    setIsEditingBank(false);
  };

  const handleToggleEquipment = (key: keyof typeof courier.equipmentVerified) => {
    recordTap(`Toggled courier equipment: ${String(key)}`);
    updateCourierProfile({
      equipmentVerified: {
        ...courier.equipmentVerified,
        [key]: !courier.equipmentVerified[key]
      }
    });
  };

  const handleToggleStatus = (newStatus: 'active' | 'on_break' | 'offline') => {
    recordTap(`Courier switched status to ${newStatus}`);
    updateCourierProfile({ activeStatus: newStatus });
  };

  return (
    <div className="space-y-6">
      
      {/* Courier Header Card */}
      <div className="bg-white dark:bg-[#1E1B18] rounded-3xl p-5 sm:p-7 border border-[#EAE4DC] dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-2xl shrink-0">
            <Bike className="w-9 h-9" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#241A17] dark:text-stone-100 tracking-tight">
                {courier.riderName}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#FAF7F0] dark:bg-stone-800 text-[#807872] dark:text-stone-300 border border-[#EAE4DC] dark:border-stone-700">
                {courier.courierId}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                ⭐ {courier.rating.toFixed(2)} ({courier.totalDeliveries} trips)
              </span>
            </div>
            <p className="text-xs text-[#807872] dark:text-stone-400 mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#241A17] dark:text-stone-200">
                {courier.vehicleModel}
              </span>
              <span>({courier.plateNumber})</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C85C43]" /> {courier.activeZone}
              </span>
            </p>
          </div>
        </div>

        {/* Duty Status Selector & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center p-1 bg-[#FAF7F0] dark:bg-stone-900 rounded-full border border-[#EAE4DC] dark:border-stone-800 text-xs font-bold">
            <button
              onClick={() => handleToggleStatus('active')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                courier.activeStatus === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-[#807872] dark:text-stone-400'
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
                  : 'text-[#807872] dark:text-stone-400'
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
                  : 'text-[#807872] dark:text-stone-400'
              }`}
            >
              <span>Offline</span>
            </button>
          </div>

          <button
            onClick={() => {
              recordTap('Courier navigated to live dispatch queue');
              setCurrentView('courier');
            }}
            className="px-4 py-2.5 rounded-full bg-[#C85C43] hover:bg-[#B44F37] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Go to Dispatch Queue</span>
          </button>

          <button
            onClick={() => setIsEditingRider(!isEditingRider)}
            className="px-3.5 py-2.5 rounded-full border border-[#EAE4DC] dark:border-stone-700 bg-[#FAF7F0] dark:bg-stone-800 text-[#241A17] dark:text-stone-200 text-xs font-bold hover:border-[#C85C43]/50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Edit Rider Form Drawer */}
      {isEditingRider && (
        <form
          onSubmit={handleSaveRiderInfo}
          className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border-2 border-amber-500/40 shadow-md space-y-4 animate-in fade-in duration-100"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE4DC] dark:border-stone-800">
            <h3 className="font-extrabold text-sm text-[#241A17] dark:text-stone-100">
              Edit Courier & Vehicle Information
            </h3>
            <span className="text-[11px] text-[#807872] dark:text-stone-400">
              Courier ID: {courier.courierId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Rider Full Name</label>
              <input
                type="text"
                value={riderName}
                onChange={e => setRiderName(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Mobile Phone Number</label>
              <input
                type="text"
                value={riderPhone}
                onChange={e => setRiderPhone(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Vehicle Make & Model</label>
              <input
                type="text"
                value={vehicleModel}
                onChange={e => setVehicleModel(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Vehicle License Plate</label>
              <input
                type="text"
                value={plateNumber}
                onChange={e => setPlateNumber(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Driver's License Number</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Active Service Zone</label>
              <input
                type="text"
                value={activeZone}
                onChange={e => setActiveZone(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingRider(false)}
              className="px-4 py-1.5 rounded-full border border-[#EAE4DC] dark:border-stone-700 text-xs font-semibold text-[#807872]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-full bg-amber-600 text-white text-xs font-bold shadow-xs hover:bg-amber-700"
            >
              Save Rider Info
            </button>
          </div>
        </form>
      )}

      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#EAE4DC] dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveSubTab('rider_vehicle')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'rider_vehicle'
              ? 'bg-[#241A17] dark:bg-stone-800 text-white shadow-xs'
              : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17]'
          }`}
        >
          <Bike className="w-3.5 h-3.5 text-amber-500" />
          <span>Rider & Vehicle Details</span>
        </button>

        <button
          onClick={() => setActiveSubTab('wallet')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'wallet'
              ? 'bg-[#241A17] dark:bg-stone-800 text-white shadow-xs'
              : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17]'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
          <span>Earnings & Payout Wallet</span>
        </button>

        <button
          onClick={() => setActiveSubTab('equipment')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'equipment'
              ? 'bg-[#241A17] dark:bg-stone-800 text-white shadow-xs'
              : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Safety & Equipment Checklist</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'settings'
              ? 'bg-[#241A17] dark:bg-stone-800 text-white shadow-xs'
              : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-[#5F765A]" />
          <span>Dispatch & Nav Preferences</span>
        </button>
      </div>

      {/* Tab 1: Rider & Vehicle Details */}
      {activeSubTab === 'rider_vehicle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-[#241A17] dark:text-stone-100 flex items-center gap-2">
              <Bike className="w-4 h-4 text-amber-500" />
              <span>Assigned Vehicle & Registration</span>
            </h3>

            <div className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#807872] dark:text-stone-400">Vehicle Type:</span>
                <span className="font-bold text-[#241A17] dark:text-stone-100 capitalize">{courier.vehicleType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#807872] dark:text-stone-400">Model:</span>
                <span className="font-bold text-[#241A17] dark:text-stone-100">{courier.vehicleModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#807872] dark:text-stone-400">Plate Number:</span>
                <span className="font-bold text-[#241A17] dark:text-stone-100">{courier.plateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#807872] dark:text-stone-400">Driver's License:</span>
                <span className="font-bold text-[#241A17] dark:text-stone-100">{courier.licenseNumber}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Vehicle Inspection & Roadworthiness Certificate Active</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-[#241A17] dark:text-stone-100 flex items-center gap-2">
              <User className="w-4 h-4 text-[#5F765A]" />
              <span>Rider Contact & Emergency Info</span>
            </h3>

            <div className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#807872] dark:text-stone-400">Direct Phone:</span>
                <span className="font-bold text-[#241A17] dark:text-stone-100">{courier.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#807872] dark:text-stone-400">Assigned Zone:</span>
                <span className="font-bold text-[#241A17] dark:text-stone-100">{courier.activeZone}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 text-xs space-y-2">
              <div className="font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-red-600" />
                <span>Next of Kin & Emergency Contact</span>
              </div>
              <div className="flex justify-between text-[#241A17] dark:text-stone-300">
                <span>{courier.emergencyContact.name} ({courier.emergencyContact.relationship}):</span>
                <strong className="text-red-700 dark:text-red-400">{courier.emergencyContact.phone}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Earnings & Payout Wallet */}
      {activeSubTab === 'wallet' && (
        <div className="space-y-5">
          {/* Earnings Overview Card */}
          <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE4DC] dark:border-stone-800">
              <div>
                <span className="text-xs font-bold text-[#807872] dark:text-stone-400">Available Payout Balance</span>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {currencySymbol}{todayEarnings.toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => alert(`Instant payout request for ${currencySymbol}${todayEarnings.toLocaleString()} initiated to ${courier.payoutBank.bankName}.`)}
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Instant Withdraw to Bank
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
              <div className="p-3 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900">
                <span className="text-[#807872] dark:text-stone-400 block">Base Delivery Pay</span>
                <span className="font-extrabold text-sm text-[#241A17] dark:text-stone-100">
                  {currencySymbol}{(todayEarnings * 0.75).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900">
                <span className="text-[#807872] dark:text-stone-400 block">Customer Tips</span>
                <span className="font-extrabold text-sm text-[#241A17] dark:text-stone-100">
                  {currencySymbol}{(todayEarnings * 0.18).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900">
                <span className="text-[#807872] dark:text-stone-400 block">Peak Demand Surge Bonus</span>
                <span className="font-extrabold text-sm text-[#241A17] dark:text-stone-100">
                  {currencySymbol}{(todayEarnings * 0.07).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Payout Bank Account Card */}
          <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#241A17] dark:text-stone-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#C85C43]" />
                <span>Registered Settlement Bank Account</span>
              </h3>
              <button
                onClick={() => setIsEditingBank(!isEditingBank)}
                className="text-xs font-bold text-[#C85C43] hover:underline"
              >
                {isEditingBank ? 'Close' : 'Update Account'}
              </button>
            </div>

            {isEditingBank ? (
              <form onSubmit={handleSaveBankInfo} className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">Account Name</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingBank(false)}
                    className="px-4 py-1 rounded-full border border-[#EAE4DC] dark:border-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 rounded-full bg-emerald-600 text-white font-bold"
                  >
                    Save Settlement Details
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#807872] dark:text-stone-400">Financial Institution:</span>
                  <span className="font-bold text-[#241A17] dark:text-stone-100">{courier.payoutBank.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#807872] dark:text-stone-400">Account Number:</span>
                  <span className="font-bold text-[#241A17] dark:text-stone-100">{courier.payoutBank.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#807872] dark:text-stone-400">Account Name:</span>
                  <span className="font-bold text-[#241A17] dark:text-stone-100">{courier.payoutBank.accountName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Safety & Equipment Checklist */}
      {activeSubTab === 'equipment' && (
        <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs space-y-5">
          <div>
            <h3 className="font-extrabold text-base text-[#241A17] dark:text-stone-100">
              Courier Safety & Equipment Inspection
            </h3>
            <p className="text-xs text-[#807872] dark:text-stone-400 mt-0.5">
              Verified daily to guarantee hot meal delivery integrity and road safety.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleToggleEquipment('insulatedThermalBag')}
              className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all ${
                courier.equipmentVerified.insulatedThermalBag
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                  : 'bg-white dark:bg-stone-900 border-[#EAE4DC] dark:border-stone-800 text-[#807872]'
              }`}
            >
              <div>
                <span className="font-bold text-xs block">Insulated Thermal Food Bag</span>
                <span className="text-[11px] text-[#807872] dark:text-stone-400 mt-0.5 block">
                  Guarantees meals arrive at safe temperature (&gt;60°C).
                </span>
              </div>
              {courier.equipmentVerified.insulatedThermalBag && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
            </button>

            <button
              onClick={() => handleToggleEquipment('protectiveHelmet')}
              className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all ${
                courier.equipmentVerified.protectiveHelmet
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                  : 'bg-white dark:bg-stone-900 border-[#EAE4DC] dark:border-stone-800 text-[#807872]'
              }`}
            >
              <div>
                <span className="font-bold text-xs block">Certified Helmet & Hi-Vis Vest</span>
                <span className="text-[11px] text-[#807872] dark:text-stone-400 mt-0.5 block">
                  Mandatory rider personal protective equipment.
                </span>
              </div>
              {courier.equipmentVerified.protectiveHelmet && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
            </button>

            <button
              onClick={() => handleToggleEquipment('phoneMountReady')}
              className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all ${
                courier.equipmentVerified.phoneMountReady
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                  : 'bg-white dark:bg-stone-900 border-[#EAE4DC] dark:border-stone-800 text-[#807872]'
              }`}
            >
              <div>
                <span className="font-bold text-xs block">Shockproof Phone Mount & Power Bank</span>
                <span className="text-[11px] text-[#807872] dark:text-stone-400 mt-0.5 block">
                  Ensures uninterrupted live GPS tracking and customer communication.
                </span>
              </div>
              {courier.equipmentVerified.phoneMountReady && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
            </button>

            <button
              onClick={() => handleToggleEquipment('tamperSealKit')}
              className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all ${
                courier.equipmentVerified.tamperSealKit
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                  : 'bg-white dark:bg-stone-900 border-[#EAE4DC] dark:border-stone-800 text-[#807872]'
              }`}
            >
              <div>
                <span className="font-bold text-xs block">Tamper-Evident Security Seal Inspection</span>
                <span className="text-[11px] text-[#807872] dark:text-stone-400 mt-0.5 block">
                  Ensures no bag is opened between the kitchen and the customer.
                </span>
              </div>
              {courier.equipmentVerified.tamperSealKit && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Dispatch & Nav Preferences */}
      {activeSubTab === 'settings' && (
        <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-base text-[#241A17] dark:text-stone-100">
            Dispatch & Navigation Preferences
          </h3>

          <div className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 space-y-3 text-xs">
            <label className="font-bold text-[#807872] dark:text-stone-400 block">
              Default Turn-by-Turn Navigation App
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['google_maps', 'waze', 'apple_maps'] as const).map(app => (
                <button
                  key={app}
                  onClick={() => updateCourierProfile({ preferredNavApp: app })}
                  className={`p-3 rounded-xl border text-center font-bold capitalize transition-all ${
                    courier.preferredNavApp === app
                      ? 'bg-[#241A17] dark:bg-stone-800 text-white border-transparent'
                      : 'bg-white dark:bg-stone-900 border-[#EAE4DC] dark:border-stone-700 text-[#807872]'
                  }`}
                >
                  {app.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
