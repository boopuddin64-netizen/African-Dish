import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Bike, 
  ChefHat, 
  PackageCheck, 
  Star, 
  ThumbsUp, 
  Sparkles, 
  Phone, 
  MapPin,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { OrderStatus } from '../types';
import { LiveCourierChatModal } from './LiveCourierChatModal';

export const OrderTrackingModal: React.FC = () => {
  const {
    activeOrder,
    setActiveOrder,
    submitOrderRating,
    cancelActiveOrder,
    recordTap,
    currentLocation
  } = useApp();

  const [simulatedStatus, setSimulatedStatus] = useState<OrderStatus>('confirmed');
  const [foodRating, setFoodRating] = useState(5);
  const [restaurantRating, setRestaurantRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Great taste', 'Arrived hot']);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (activeOrder) {
      setSimulatedStatus('confirmed');
      setFeedbackSubmitted(false);

      // Simulation steps for live tracking demonstration
      const t1 = setTimeout(() => setSimulatedStatus('preparing'), 3000);
      const t2 = setTimeout(() => setSimulatedStatus('ready'), 7000);
      const t3 = setTimeout(() => setSimulatedStatus('on_the_way'), 11000);
      const t4 = setTimeout(() => setSimulatedStatus('delivered'), 16000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [activeOrder?.id]);

  if (!activeOrder) return null;

  const quickFeedbackOptions = [
    'Great taste',
    'Good portion',
    'Arrived hot',
    'Good value',
    'Accurate description',
    'Tender meat',
    'Too slow',
    'Poor packaging',
    'Not spicy enough'
  ];

  const toggleTag = (tag: string) => {
    recordTap(`Toggled rating tag: ${tag}`);
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitFeedback = () => {
    submitOrderRating(activeOrder.id, foodRating, restaurantRating, deliveryRating, selectedTags);
    setFeedbackSubmitted(true);
  };

  const steps: { key: OrderStatus; label: string; icon: any; time: string }[] = [
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2, time: '1 min ago' },
    { key: 'preparing', label: 'Kitchen Preparing Food', icon: ChefHat, time: 'In progress' },
    { key: 'ready', label: 'Food Packed & Ready', icon: PackageCheck, time: 'Next' },
    { key: 'on_the_way', label: 'Courier on the Way', icon: Bike, time: '15-20 min' },
    { key: 'delivered', label: 'Delivered Fresh', icon: Sparkles, time: 'Done' }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.key === simulatedStatus);
  };

  const activeIndex = getCurrentStepIndex();

  return (
    <div 
      id="order-tracking-backdrop" 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div 
        id="order-tracking-modal"
        className="bg-white dark:bg-[#1E1B18] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-[#EAE4DC] dark:border-stone-800 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAE4DC] dark:border-stone-800 flex items-center justify-between bg-[#FAF7F0] dark:bg-[#181512]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#807872] dark:text-stone-400">
              <span>Order #{activeOrder.orderNumber}</span>
              <span>·</span>
              <span className="text-[#C85C43]">{activeOrder.restaurantName}</span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#241A17] dark:text-stone-100 mt-0.5">
              {simulatedStatus === 'delivered' ? '🎉 Order Delivered!' : 'Live Order Tracking'}
            </h2>
          </div>

          <button
            onClick={() => setActiveOrder(null)}
            className="w-8 h-8 rounded-full hover:bg-white dark:hover:bg-stone-800 flex items-center justify-center text-[#807872] dark:text-stone-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-[#241A17] dark:text-stone-200">
          
          {/* Tracking Step Progression */}
          <div className="bg-[#FAF7F0] dark:bg-stone-900 p-4 rounded-2xl border border-[#EAE4DC] dark:border-stone-800">
            <div className="space-y-4">
              {steps.map((step, idx) => {
                const IconComponent = step.icon;
                const isCompleted = idx <= activeIndex;
                const isCurrent = idx === activeIndex;

                return (
                  <div key={step.key} className="flex items-start gap-3 relative">
                    {/* Connecting line */}
                    {idx < steps.length - 1 && (
                      <div className={`absolute left-3.5 top-7 w-0.5 h-6 transition-colors ${
                        idx < activeIndex ? 'bg-[#5F765A]' : 'bg-[#EAE4DC] dark:bg-stone-800'
                      }`} />
                    )}

                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                      isCompleted ? 'bg-[#5F765A] text-white shadow-xs' : 'bg-white dark:bg-stone-800 border border-[#EAE4DC] dark:border-stone-700 text-[#807872] dark:text-stone-400'
                    }`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <div className={`font-bold text-xs ${isCurrent ? 'text-[#C85C43]' : (isCompleted ? 'text-[#241A17] dark:text-stone-100' : 'text-[#807872] dark:text-stone-400')}`}>
                          {step.label}
                        </div>
                        {isCurrent && (
                          <div className="text-[11px] text-[#5F765A] dark:text-[#7d9b77] animate-pulse">
                            Active live update...
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-[#807872] dark:text-stone-400 font-mono">{step.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier Card & Live Chat Action */}
          {activeOrder.fulfillmentMethod === 'delivery' && (
            <div className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C85C43] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {activeOrder.driverName ? activeOrder.driverName.charAt(0) : 'E'}
                </div>
                <div>
                  <div className="font-bold text-xs text-[#241A17] dark:text-stone-100 flex items-center gap-1.5">
                    <span>{activeOrder.driverName || 'Emmanuel (Courier Partner)'}</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                      ⭐ 4.9
                    </span>
                  </div>
                  <div className="text-[11px] text-[#807872] dark:text-stone-400 flex items-center gap-1 mt-0.5">
                    <Bike className="w-3 h-3 text-[#5F765A]" />
                    <span>Insulated Box · Tamper Sealed</span>
                  </div>
                </div>
              </div>

              <button
                id="open-courier-chat-btn"
                onClick={() => {
                  recordTap('Opened live courier chat modal');
                  setIsChatOpen(true);
                }}
                className="px-3.5 py-2 rounded-full bg-white dark:bg-stone-800 border border-[#EAE4DC] dark:border-stone-700 hover:border-[#C85C43] text-[#241A17] dark:text-stone-100 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#C85C43]" />
                <span>Chat / Call</span>
              </button>
            </div>
          )}

          {/* Delivery Destination */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 text-xs">
            <MapPin className="w-4 h-4 text-[#C85C43] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#241A17] dark:text-stone-100">Delivering to: {activeOrder.deliveryAddress.label}</span>
              <p className="text-[11px] text-[#807872] dark:text-stone-400 mt-0.5">{activeOrder.deliveryAddress.address}</p>
            </div>
          </div>

          {/* Order Item Summary */}
          <div className="border-t border-[#F0EAE1] dark:border-stone-800 pt-4 space-y-2">
            <h4 className="font-bold text-xs text-[#241A17] dark:text-stone-100">Order Items</h4>
            {activeOrder.items.map(item => (
              <div key={item.id} className="flex justify-between text-[#241A17] dark:text-stone-200">
                <span>{item.quantity}x {item.meal.name}</span>
                <span className="font-semibold text-[#807872] dark:text-stone-400">
                  {activeOrder.currency === 'NGN' ? `₦${(item.itemPrice * item.quantity).toLocaleString()}` : `£${(item.itemPrice * item.quantity).toFixed(2)}`}
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-[#F0EAE1] dark:border-stone-800 flex justify-between font-extrabold text-sm text-[#241A17] dark:text-stone-100">
              <span>Total Paid</span>
              <span>{activeOrder.currency === 'NGN' ? `₦${activeOrder.total.toLocaleString()}` : `£${activeOrder.total.toFixed(2)}`}</span>
            </div>
          </div>

          {/* 3-Question Micro Rating & Feedback (Section 42 & 43) */}
          {simulatedStatus === 'delivered' && (
            <div className="bg-[#FAF7F0] dark:bg-stone-900 p-5 rounded-2xl border border-[#C9A45C]/40 dark:border-[#C9A45C]/30 space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-black text-[#8B6B23] dark:text-amber-300 uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3-Question Continuous Learning Feedback</span>
                </div>
                <p className="text-[11px] text-[#807872] dark:text-stone-400 mt-0.5">
                  Helps fine-tune future recommendations to your unique taste and temperature preference.
                </p>
              </div>

              {!feedbackSubmitted ? (
                <div className="space-y-4">
                  {/* Food Rating */}
                  <div>
                    <label className="font-bold block mb-1.5 text-xs text-[#241A17] dark:text-stone-100">1. How was the taste and temperature?</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(stars => (
                        <button
                          key={stars}
                          type="button"
                          onClick={() => setFoodRating(stars)}
                          className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all ${
                            foodRating === stars 
                              ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-200' 
                              : 'bg-white dark:bg-stone-800 border-[#EAE4DC] dark:border-stone-700 text-[#807872] dark:text-stone-300'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${foodRating >= stars ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                          <span>{stars}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Restaurant & Delivery */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-[11px] text-[#241A17] dark:text-stone-100">2. Kitchen Accuracy</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setRestaurantRating(n)}
                            className={`flex-1 py-1 rounded text-center text-xs font-bold ${
                              restaurantRating === n ? 'bg-[#5F765A] text-white' : 'bg-white dark:bg-stone-800 border border-[#EAE4DC] dark:border-stone-700 text-[#807872] dark:text-stone-300'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-bold block mb-1 text-[11px] text-[#241A17] dark:text-stone-100">3. Delivery Speed</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setDeliveryRating(n)}
                            className={`flex-1 py-1 rounded text-center text-xs font-bold ${
                              deliveryRating === n ? 'bg-[#C85C43] text-white' : 'bg-white dark:bg-stone-800 border border-[#EAE4DC] dark:border-stone-700 text-[#807872] dark:text-stone-300'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick feedback tags */}
                  <div>
                    <label className="font-bold block mb-1.5 text-[11px] text-[#241A17] dark:text-stone-100">Feedback tags</label>
                    <div className="flex flex-wrap gap-1.5">
                      {quickFeedbackOptions.map(tag => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                              isSelected 
                                ? 'bg-[#241A17] dark:bg-stone-100 text-white dark:text-[#181512]' 
                                : 'bg-white dark:bg-stone-800 border border-[#EAE4DC] dark:border-stone-700 text-[#807872] dark:text-stone-300 hover:border-[#241A17]'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitFeedback}
                    className="w-full py-2.5 rounded-full bg-[#C85C43] hover:bg-[#B44F37] text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    Submit Feedback & Refine Taste Engine
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Thank you! Your feedback has been applied to your taste affinity profile.</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EAE4DC] dark:border-stone-800 bg-[#FAF7F0] dark:bg-[#181512] flex items-center justify-between">
          {simulatedStatus !== 'delivered' && (
            <button
              onClick={() => {
                recordTap(`Cancelled order #${activeOrder.orderNumber}`);
                cancelActiveOrder(activeOrder.id);
                setActiveOrder(null);
              }}
              className="text-xs text-red-600 hover:text-red-700 font-semibold"
            >
              Cancel Order
            </button>
          )}

          <button
            onClick={() => setActiveOrder(null)}
            className="ml-auto px-5 py-2 rounded-full bg-[#241A17] dark:bg-stone-800 hover:bg-[#382b26] dark:hover:bg-stone-700 text-white text-xs font-bold transition-colors"
          >
            Close Tracking
          </button>
        </div>

      </div>

      {/* Live Courier Chat Modal */}
      <LiveCourierChatModal
        order={activeOrder}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

    </div>
  );
};
