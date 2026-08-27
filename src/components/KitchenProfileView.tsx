import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Store, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChefHat, 
  Flame, 
  Thermometer, 
  Calendar, 
  Phone, 
  User, 
  FileText, 
  Award, 
  Sliders, 
  Check, 
  Edit3, 
  ExternalLink,
  Sparkles,
  Lock,
  Layers,
  Activity
} from 'lucide-react';
import { KitchenStaffProfile } from '../types';

export const KitchenProfileView: React.FC = () => {
  const {
    userProfile,
    updateKitchenStaffProfile,
    merchantRestaurants,
    activeMerchantRestaurantId,
    setActiveMerchantRestaurantId,
    toggleRestaurantOpenStatus,
    toggleOrderAcceptanceMode,
    openRestaurantDetails,
    setCurrentView,
    recordTap
  } = useApp();

  const activeRestaurant = merchantRestaurants.find(r => r.id === activeMerchantRestaurantId) || merchantRestaurants[0];

  const kitchen = userProfile.kitchenStaff || {
    staffId: 'STF-KITCHEN-884',
    staffName: userProfile.name || 'Chef Emeka Okafor',
    jobTitle: 'Head Chef & Kitchen Operations Lead',
    station: 'Woodfire Grill & Bole Station',
    assignedRestaurantId: activeRestaurant?.id || 'rest_ph_1',
    shiftHours: 'Morning & Evening Service (10:00 AM – 10:00 PM)',
    hygieneCertNumber: 'FSA-PH-2026-9921',
    hygieneRating: '5/5 Grade A Certified Food Hygiene',
    emergencyContact: {
      name: 'Ngozi Okafor',
      phone: '+234 803 119 4482',
      relationship: 'Spouse'
    },
    certifications: [
      'HACCP Food Safety Level 3',
      'Allergen Cross-Contamination Management',
      'Commercial Kitchen Fire & Gas Safety',
      'Cold-Chain Temperature Control'
    ],
    safetyChecklistCompleted: true,
    dailyTemperatureLogged: true
  };

  const [activeSubTab, setActiveSubTab] = useState<'station' | 'hygiene' | 'operations' | 'certifications'>('station');
  const [isEditingStaff, setIsEditingStaff] = useState(false);

  // Edit form state
  const [nameInput, setNameInput] = useState(kitchen.staffName);
  const [titleInput, setTitleInput] = useState(kitchen.jobTitle);
  const [stationInput, setStationInput] = useState(kitchen.station);
  const [shiftInput, setShiftInput] = useState(kitchen.shiftHours);
  const [emergencyName, setEmergencyName] = useState(kitchen.emergencyContact.name);
  const [emergencyPhone, setEmergencyPhone] = useState(kitchen.emergencyContact.phone);

  const handleSaveStaffInfo = (e: React.FormEvent) => {
    e.preventDefault();
    recordTap('Saved kitchen staff profile changes');
    updateKitchenStaffProfile({
      staffName: nameInput,
      jobTitle: titleInput,
      station: stationInput,
      shiftHours: shiftInput,
      emergencyContact: {
        ...kitchen.emergencyContact,
        name: emergencyName,
        phone: emergencyPhone
      }
    });
    setIsEditingStaff(false);
  };

  const toggleChecklist = () => {
    recordTap('Toggled kitchen safety checklist');
    updateKitchenStaffProfile({
      safetyChecklistCompleted: !kitchen.safetyChecklistCompleted
    });
  };

  const toggleTemperature = () => {
    recordTap('Toggled daily kitchen temperature log');
    updateKitchenStaffProfile({
      dailyTemperatureLogged: !kitchen.dailyTemperatureLogged
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Kitchen Identity & Station Banner */}
      <div className="bg-white dark:bg-[#1E1B18] rounded-3xl p-5 sm:p-7 border border-[#EAE4DC] dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#C85C43]/10 text-[#C85C43] dark:text-[#E27961] border border-[#C85C43]/20 flex items-center justify-center font-bold text-2xl shrink-0">
            <ChefHat className="w-9 h-9" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#241A17] dark:text-stone-100 tracking-tight">
                {kitchen.staffName}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#5F765A]/15 text-[#5F765A] dark:text-[#88a881] border border-[#5F765A]/20">
                {kitchen.jobTitle}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#FAF7F0] dark:bg-stone-800 text-[#807872] dark:text-stone-300 border border-[#EAE4DC] dark:border-stone-700">
                {kitchen.staffId}
              </span>
            </div>
            <p className="text-xs text-[#807872] dark:text-stone-400 mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#241A17] dark:text-stone-200">
                {activeRestaurant?.name || 'Assigned Kitchen'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#C85C43]" /> {kitchen.station}
              </span>
            </p>
          </div>
        </div>

        {/* Quick Action Links */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => {
              recordTap('Kitchen staff opened portal view');
              setCurrentView('merchant');
            }}
            className="px-4 py-2.5 rounded-full bg-[#241A17] dark:bg-stone-800 hover:bg-[#382b26] dark:hover:bg-stone-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Open Live Kitchen Portal</span>
          </button>

          {activeRestaurant && (
            <button
              onClick={() => {
                recordTap('Kitchen staff viewed public restaurant profile');
                openRestaurantDetails(activeRestaurant);
              }}
              className="px-4 py-2.5 rounded-full border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-200 text-xs font-bold hover:border-[#C85C43]/50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#807872]" />
              <span>View Customer Menu</span>
            </button>
          )}

          <button
            onClick={() => setIsEditingStaff(!isEditingStaff)}
            className="px-3.5 py-2.5 rounded-full border border-[#EAE4DC] dark:border-stone-700 bg-[#FAF7F0] dark:bg-stone-800 text-[#241A17] dark:text-stone-200 text-xs font-bold hover:border-[#C85C43]/50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Edit Staff Modal / Form Drawer if active */}
      {isEditingStaff && (
        <form 
          onSubmit={handleSaveStaffInfo}
          className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border-2 border-[#C85C43]/30 shadow-md space-y-4 animate-in fade-in duration-100"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE4DC] dark:border-stone-800">
            <h3 className="font-extrabold text-sm text-[#241A17] dark:text-stone-100">
              Edit Kitchen Staff Profile
            </h3>
            <span className="text-[11px] text-[#807872] dark:text-stone-400">
              Staff ID: {kitchen.staffId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">
                Full Name / Chef Identity
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
              />
            </div>

            <div>
              <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">
                Job Title & Role
              </label>
              <input
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
              />
            </div>

            <div>
              <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">
                Primary Kitchen Station
              </label>
              <input
                type="text"
                value={stationInput}
                onChange={e => setStationInput(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
              />
            </div>

            <div>
              <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">
                Shift Schedule & Hours
              </label>
              <input
                type="text"
                value={shiftInput}
                onChange={e => setShiftInput(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
              />
            </div>

            <div>
              <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">
                Emergency Contact Name
              </label>
              <input
                type="text"
                value={emergencyName}
                onChange={e => setEmergencyName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
              />
            </div>

            <div>
              <label className="font-bold text-[#807872] dark:text-stone-400 block mb-1">
                Emergency Contact Phone
              </label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={e => setEmergencyPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#EAE4DC] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingStaff(false)}
              className="px-4 py-1.5 rounded-full border border-[#EAE4DC] dark:border-stone-700 text-xs font-semibold text-[#807872]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-full bg-[#C85C43] text-white text-xs font-bold shadow-xs hover:bg-[#B44F37]"
            >
              Save Profile Updates
            </button>
          </div>
        </form>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#EAE4DC] dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveSubTab('station')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'station'
              ? 'bg-[#241A17] dark:bg-stone-800 text-white shadow-xs'
              : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17]'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-[#C85C43]" />
          <span>Station & Active Shift</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hygiene')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'hygiene'
              ? 'bg-[#241A17] dark:bg-stone-800 text-white shadow-xs'
              : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#5F765A]" />
          <span>Hygiene & Safety (5/5 Grade A)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('operations')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'operations'
              ? 'bg-[#241A17] dark:bg-stone-800 text-white shadow-xs'
              : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-blue-500" />
          <span>Kitchen Operating Controls</span>
        </button>

        <button
          onClick={() => setActiveSubTab('certifications')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'certifications'
              ? 'bg-[#241A17] dark:bg-stone-800 text-white shadow-xs'
              : 'text-[#807872] dark:text-stone-400 hover:text-[#241A17]'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Certifications & Standards</span>
        </button>
      </div>

      {/* Tab 1: Station & Active Shift */}
      {activeSubTab === 'station' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Station Card */}
          <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#241A17] dark:text-stone-100 flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#C85C43]" />
                <span>Station Assignment</span>
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                🟢 Live Active
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#807872] dark:text-stone-400 font-medium">Assigned Station:</span>
                <span className="font-bold text-[#241A17] dark:text-stone-100">{kitchen.station}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#807872] dark:text-stone-400 font-medium">Shift Schedule:</span>
                <span className="font-bold text-[#241A17] dark:text-stone-100">{kitchen.shiftHours}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#807872] dark:text-stone-400 font-medium">Kitchen Role:</span>
                <span className="font-bold text-[#5F765A] dark:text-[#88a881]">{kitchen.jobTitle}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-[#807872] dark:text-stone-400">Station Responsibilities:</p>
              <ul className="space-y-1.5 text-xs text-[#241A17] dark:text-stone-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5F765A] shrink-0" />
                  <span>Woodfire & Charcoal bole grilling temperature regulation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5F765A] shrink-0" />
                  <span>Fresh fish marination & spicy pepper sauce finishing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5F765A] shrink-0" />
                  <span>Tamper-evident heat seal and food safety inspection</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Restaurant & Emergency Info */}
          <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-[#241A17] dark:text-stone-100 flex items-center gap-2">
              <Store className="w-4 h-4 text-[#5F765A]" />
              <span>Assigned Restaurant Profile</span>
            </h3>

            <div className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#807872] dark:text-stone-400 font-medium">Restaurant:</span>
                <span className="font-bold text-[#241A17] dark:text-stone-100">{activeRestaurant?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#807872] dark:text-stone-400 font-medium">Location:</span>
                <span className="font-bold text-[#241A17] dark:text-stone-100">{activeRestaurant?.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#807872] dark:text-stone-400 font-medium">Pilot Region:</span>
                <span className="font-bold text-[#241A17] dark:text-stone-100">{activeRestaurant?.city || 'N/A'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 text-xs space-y-2">
              <div className="font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-red-600" />
                <span>Emergency Staff Contact</span>
              </div>
              <div className="flex justify-between text-[#241A17] dark:text-stone-300">
                <span>{kitchen.emergencyContact.name} ({kitchen.emergencyContact.relationship}):</span>
                <strong className="text-red-700 dark:text-red-400">{kitchen.emergencyContact.phone}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Hygiene & Safety (5/5 Grade A) */}
      {activeSubTab === 'hygiene' && (
        <div className="space-y-5">
          {/* Hygiene Certification Badge */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-sm">
                5/5
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-emerald-950 dark:text-emerald-100">
                    Grade A Food Hygiene & Safety Verified
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black uppercase">
                    Active Cert
                  </span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300/90 mt-0.5">
                  Official License: <strong>{kitchen.hygieneCertNumber}</strong> · Port Harcourt Health & Food Authority
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-stone-900 px-3 py-1.5 rounded-full border border-emerald-500/30">
              Valid through Dec 2026
            </span>
          </div>

          {/* Daily Kitchen Safety & Temp Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-[#241A17] dark:text-stone-100 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-blue-500" />
                  <span>Cold Chain & Food Temp Logs</span>
                </h4>
                <button
                  onClick={toggleTemperature}
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                    kitchen.dailyTemperatureLogged
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 dark:bg-stone-800 text-[#807872]'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>{kitchen.dailyTemperatureLogged ? 'Logged Today' : 'Mark Logged'}</span>
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 flex justify-between items-center">
                  <span>Refrigeration Unit 1 (Meat & Fish):</span>
                  <strong className="text-blue-600 dark:text-blue-400 font-bold">2.4°C (Target: ≤4°C)</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 flex justify-between items-center">
                  <span>Deep Freeze Storage:</span>
                  <strong className="text-blue-600 dark:text-blue-400 font-bold">-19.2°C (Target: ≤-18°C)</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 flex justify-between items-center">
                  <span>Hot Holding Serving Well:</span>
                  <strong className="text-amber-600 dark:text-amber-400 font-bold">68.5°C (Target: ≥63°C)</strong>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-[#241A17] dark:text-stone-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#5F765A]" />
                  <span>Allergen & Kitchen Safety Protocols</span>
                </h4>
                <button
                  onClick={toggleChecklist}
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                    kitchen.safetyChecklistCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 dark:bg-stone-800 text-[#807872]'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>{kitchen.safetyChecklistCompleted ? 'Verified Today' : 'Mark Verified'}</span>
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 flex items-center gap-2 text-[#241A17] dark:text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-[#5F765A] shrink-0" />
                  <span>Separate cutting boards & utensils for peanut & shellfish prep</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 flex items-center gap-2 text-[#241A17] dark:text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-[#5F765A] shrink-0" />
                  <span>Commercial hood ventilation & fire safety inspection active</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF7F0] dark:bg-stone-900 flex items-center gap-2 text-[#241A17] dark:text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-[#5F765A] shrink-0" />
                  <span>Tamper-evident heat seals verified on every delivery takeaway</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Kitchen Operating Controls */}
      {activeSubTab === 'operations' && activeRestaurant && (
        <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-[#241A17] dark:text-stone-100">
              Live Operating Controls for {activeRestaurant.name}
            </h3>
            <p className="text-xs text-[#807872] dark:text-stone-400 mt-0.5">
              Instantly adjust your live order acceptance and kitchen prep buffers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Store Open Status */}
            <div className="p-5 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 bg-[#FAF7F0] dark:bg-stone-900 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-[#241A17] dark:text-stone-100">Kitchen Store Status</p>
                <p className="text-xs text-[#807872] dark:text-stone-400 mt-0.5">
                  {activeRestaurant.isOpen ? 'Currently Open & Taking Orders' : 'Paused / Kitchen Closed'}
                </p>
              </div>
              <button
                onClick={() => toggleRestaurantOpenStatus(activeRestaurant.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeRestaurant.isOpen
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-600 text-white'
                }`}
              >
                {activeRestaurant.isOpen ? 'Store Open' : 'Store Paused'}
              </button>
            </div>

            {/* Ingestion Mode */}
            <div className="p-5 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 bg-[#FAF7F0] dark:bg-stone-900 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-[#241A17] dark:text-stone-100">Order Acceptance Mode</p>
                <p className="text-xs text-[#807872] dark:text-stone-400 mt-0.5">
                  {activeRestaurant.orderAcceptanceMode === 'auto' ? 'Auto-Accept All Incoming Orders' : 'Chef Manual Review Required'}
                </p>
              </div>
              <button
                onClick={() => toggleOrderAcceptanceMode(activeRestaurant.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeRestaurant.orderAcceptanceMode === 'auto'
                    ? 'bg-[#C85C43] text-white shadow-xs'
                    : 'bg-[#5F765A] text-white shadow-xs'
                }`}
              >
                {activeRestaurant.orderAcceptanceMode === 'auto' ? 'Auto Accept' : 'Chef Review'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between">
            <div>
              <p className="font-bold">Need to adjust meal availability or inventory counts?</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">
                Head over to the Kitchen Portal to toggle individual item stock, 1-click batch stock up, or adjust prices.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('merchant')}
              className="px-4 py-2 rounded-full bg-[#241A17] dark:bg-stone-800 text-white font-bold shrink-0 ml-3"
            >
              Go to Portal
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Certifications & Standards */}
      {activeSubTab === 'certifications' && (
        <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#EAE4DC] dark:border-stone-800 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-base text-[#241A17] dark:text-stone-100">
            Professional Chef Certifications & Accreditations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {kitchen.certifications.map((cert, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-[#EAE4DC] dark:border-stone-800 bg-[#FAF7F0] dark:bg-stone-900 flex items-center gap-3 text-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#241A17] dark:text-stone-100">{cert}</p>
                  <p className="text-[11px] text-[#807872] dark:text-stone-400">Verified by Food Safety Authority</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
