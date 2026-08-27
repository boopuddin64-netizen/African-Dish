import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  MapPin, 
  CreditCard, 
  Bike, 
  ShoppingBag, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  Clock
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cartItems,
    cartSubtotal,
    cartDeliveryFee,
    cartServiceFee,
    cartTotal,
    currentLocation,
    savedLocations,
    selectLocation,
    placeOrder,
    tapCount,
    recordTap
  } = useApp();

  const [fulfillmentMethod, setFulfillmentMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'bank_transfer' | 'apple_pay' | 'cash'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    recordTap('Submitted Final Order Confirmation');
    setTimeout(() => {
      placeOrder(fulfillmentMethod);
      setIsSubmitting(false);
    }, 600);
  };

  const finalTotal = fulfillmentMethod === 'delivery' ? cartTotal : (cartSubtotal + cartServiceFee);

  return (
    <div 
      id="checkout-modal-backdrop" 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={() => setIsCheckoutOpen(false)}
    >
      <div 
        id="checkout-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1E1B18] w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-[#EAE4DC] dark:border-stone-800 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAE4DC] dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#5F765A]/15 text-[#5F765A] dark:text-[#88a881] flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#241A17] dark:text-stone-100">
                Fast Secure Checkout
              </h2>
              <p className="text-xs text-[#807872] dark:text-stone-400">
                Instant dispatch to {currentLocation.label}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-[#FAF7F0] dark:hover:bg-stone-800 flex items-center justify-center text-[#807872] dark:text-stone-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-[#241A17] dark:text-stone-100">
          
          {/* Fulfillment Method */}
          <div>
            <label className="font-bold text-[#807872] dark:text-stone-400 uppercase tracking-wider block mb-2">
              Fulfillment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  recordTap('Selected Delivery');
                  setFulfillmentMethod('delivery');
                }}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  fulfillmentMethod === 'delivery'
                    ? 'bg-[#FAF7F0] dark:bg-stone-900 border-[#C85C43] dark:border-[#C85C43] font-bold text-[#C85C43]'
                    : 'bg-white dark:bg-[#1E1B18] border-[#EAE4DC] dark:border-stone-800 text-[#807872] dark:text-stone-400'
                }`}
              >
                <Bike className="w-5 h-5" />
                <div>
                  <div className="text-xs font-bold text-[#241A17] dark:text-stone-100">Doorstep Delivery</div>
                  <div className="text-[11px] text-[#807872] dark:text-stone-400">20–35 min · Hybrid courier</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  recordTap('Selected Pickup / Collection');
                  setFulfillmentMethod('pickup');
                }}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  fulfillmentMethod === 'pickup'
                    ? 'bg-[#FAF7F0] dark:bg-stone-900 border-[#C85C43] dark:border-[#C85C43] font-bold text-[#C85C43]'
                    : 'bg-white dark:bg-[#1E1B18] border-[#EAE4DC] dark:border-stone-800 text-[#807872] dark:text-stone-400'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <div>
                  <div className="text-xs font-bold text-[#241A17] dark:text-stone-100">Direct Pickup</div>
                  <div className="text-[11px] text-[#807872] dark:text-stone-400">Ready in 15 min · Free</div>
                </div>
              </button>
            </div>
          </div>

          {/* Delivery Location Selector */}
          {fulfillmentMethod === 'delivery' && (
            <div>
              <label className="font-bold text-[#807872] dark:text-stone-400 uppercase tracking-wider block mb-2">
                Delivering to Saved Address
              </label>
              <div className="space-y-2">
                {savedLocations.filter(l => l.city === currentLocation.city).map(loc => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      recordTap(`Switched checkout address to ${loc.label}`);
                      selectLocation(loc.id);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      loc.id === currentLocation.id
                        ? 'bg-[#FAF7F0] dark:bg-stone-900 border-[#C85C43] dark:border-[#C85C43] font-bold'
                        : 'bg-white dark:bg-[#1E1B18] border-[#EAE4DC] dark:border-stone-800 hover:border-[#807872]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className={`w-4 h-4 ${loc.id === currentLocation.id ? 'text-[#C85C43]' : 'text-[#807872] dark:text-stone-400'}`} />
                      <div>
                        <div className="text-xs font-bold text-[#241A17] dark:text-stone-100">{loc.label}</div>
                        <div className="text-[11px] text-[#807872] dark:text-stone-400">{loc.address}</div>
                      </div>
                    </div>
                    {loc.id === currentLocation.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#C85C43]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="font-bold text-[#807872] dark:text-stone-400 uppercase tracking-wider block mb-2">
              Payment Method
            </label>
            <div className="space-y-2">
              {[
                { id: 'card', label: 'Debit / Credit Card (Instant Paystack/Stripe)', desc: 'Ending in •••• 4242' },
                { id: 'bank_transfer', label: 'Direct Bank Transfer / USSD (Nigeria Pilot)', desc: 'Instant account confirmation' },
                { id: 'apple_pay', label: 'Apple Pay / Google Pay', desc: '1-tap biometric auth' },
                { id: 'cash', label: 'Cash on Delivery (Verified Accounts Only)', desc: 'Exact change appreciated' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    recordTap(`Selected payment method: ${opt.id}`);
                    setSelectedPayment(opt.id as any);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    selectedPayment === opt.id
                      ? 'bg-[#FAF7F0] dark:bg-stone-900 border-[#C85C43] dark:border-[#C85C43] font-bold'
                      : 'bg-white dark:bg-[#1E1B18] border-[#EAE4DC] dark:border-stone-800 hover:border-[#807872]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className={`w-4 h-4 ${selectedPayment === opt.id ? 'text-[#C85C43]' : 'text-[#807872] dark:text-stone-400'}`} />
                    <div>
                      <div className="text-xs font-bold text-[#241A17] dark:text-stone-100">{opt.label}</div>
                      <div className="text-[11px] text-[#807872] dark:text-stone-400">{opt.desc}</div>
                    </div>
                  </div>
                  {selectedPayment === opt.id && (
                    <CheckCircle2 className="w-4 h-4 text-[#C85C43]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary Recap */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 space-y-1.5">
            <div className="flex justify-between text-[#807872] dark:text-stone-400">
              <span>Items ({cartItems.length})</span>
              <span>{currentLocation.currency === 'NGN' ? `₦${cartSubtotal.toLocaleString()}` : `£${cartSubtotal.toFixed(2)}`}</span>
            </div>
            {fulfillmentMethod === 'delivery' && (
              <div className="flex justify-between text-[#807872] dark:text-stone-400">
                <span>Delivery Dispatch</span>
                <span>{currentLocation.currency === 'NGN' ? `₦${cartDeliveryFee.toLocaleString()}` : `£${cartDeliveryFee.toFixed(2)}`}</span>
              </div>
            )}
            <div className="flex justify-between text-[#807872] dark:text-stone-400">
              <span>Packaging & Technology Fee</span>
              <span>{currentLocation.currency === 'NGN' ? `₦${cartServiceFee.toLocaleString()}` : `£${cartServiceFee.toFixed(2)}`}</span>
            </div>
            <div className="pt-2 border-t border-[#EAE4DC] dark:border-stone-800 flex justify-between font-extrabold text-sm text-[#241A17] dark:text-stone-100">
              <span>Final Total</span>
              <span>{currentLocation.currency === 'NGN' ? `₦${finalTotal.toLocaleString()}` : `£${finalTotal.toFixed(2)}`}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#5F765A] dark:text-emerald-400 font-semibold text-[11px]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Allergen filters and meal custom notes verified by kitchen partner.</span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#EAE4DC] dark:border-stone-800 bg-white dark:bg-[#1E1B18] flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-[#807872] dark:text-stone-400 block">Total Due</span>
            <span className="text-base sm:text-lg font-black text-[#241A17] dark:text-stone-100">
              {currentLocation.currency === 'NGN' ? `₦${finalTotal.toLocaleString()}` : `£${finalTotal.toFixed(2)}`}
            </span>
          </div>

          <button
            id="confirm-place-order-btn"
            disabled={isSubmitting}
            onClick={handlePlaceOrder}
            className="flex-1 py-3.5 px-6 rounded-full bg-[#C85C43] hover:bg-[#B44F37] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Confirming with Kitchen...</span>
            ) : (
              <>
                <span>Place Order Now</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
