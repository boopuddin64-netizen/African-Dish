import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  MapPin, 
  Clock, 
  ShieldCheck
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    cartDeliveryFee,
    cartServiceFee,
    cartTotal,
    currentLocation,
    setIsCheckoutOpen,
    recordTap
  } = useApp();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    recordTap('Clicked proceed to checkout');
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div 
      id="cart-drawer-backdrop" 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
      onClick={() => setIsCartOpen(false)}
    >
      <div 
        id="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-[#1E1B18] h-full shadow-2xl flex flex-col justify-between border-l border-[#EAE4DC] dark:border-stone-800 animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAE4DC] dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FAF7F0] dark:bg-stone-900 flex items-center justify-center text-[#C85C43]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#241A17] dark:text-stone-100">Your Cart</h2>
              <p className="text-xs text-[#807872] dark:text-stone-400">{cartItems.length} item(s) selected</p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-[#FAF7F0] dark:hover:bg-stone-800 flex items-center justify-center text-[#807872] dark:text-stone-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map(item => (
              <div 
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 flex gap-3 text-xs justify-between"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-stone-800 shrink-0">
                  <img
                    src={item.meal.image}
                    alt={item.meal.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-[#241A17] dark:text-stone-100 text-xs sm:text-sm line-clamp-1">
                    {item.meal.name}
                  </h4>
                  <p className="text-[11px] text-[#807872] dark:text-stone-400 truncate">
                    {item.restaurant.name}
                  </p>

                  {/* Customizations summary */}
                  {item.selectedCustomizations.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.selectedCustomizations.map(c => (
                        <span key={c.id} className="text-[10px] text-[#5F765A] dark:text-emerald-400 font-semibold bg-white dark:bg-stone-800 px-1.5 py-0.5 rounded border border-[#EAE4DC] dark:border-stone-700">
                          ✓ {c.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-white dark:bg-stone-800 rounded-full p-0.5 border border-[#EAE4DC] dark:border-stone-700">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[#807872] dark:text-stone-400 hover:bg-[#FAF7F0] dark:hover:bg-stone-700"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-4 text-center font-bold text-[#241A17] dark:text-stone-100 text-[11px]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[#807872] dark:text-stone-400 hover:bg-[#FAF7F0] dark:hover:bg-stone-700"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-bold text-[#241A17] dark:text-stone-100 text-xs">
                      {currentLocation.currency === 'NGN' 
                        ? `₦${(item.itemPrice * item.quantity).toLocaleString()}` 
                        : `£${(item.itemPrice * item.quantity).toFixed(2)}`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-[#807872] dark:text-stone-400 hover:text-red-600 self-start p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-[#807872] dark:text-stone-400 space-y-2">
              <ShoppingBag className="w-10 h-10 mx-auto text-[#C85C43]/40" />
              <p className="font-bold text-[#241A17] dark:text-stone-200 text-sm">Your cart is empty</p>
              <p className="text-xs max-w-xs mx-auto">
                Explore the 3 curated meals on your home screen or discover authentic regional African dishes.
              </p>
            </div>
          )}
        </div>

        {/* Footer & Totals */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#EAE4DC] dark:border-stone-800 bg-[#FAF7F0]/60 dark:bg-stone-900/60 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#807872] dark:text-stone-400">
                <span>Subtotal</span>
                <span>
                  {currentLocation.currency === 'NGN' ? `₦${cartSubtotal.toLocaleString()}` : `£${cartSubtotal.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-[#807872] dark:text-stone-400">
                <span>Delivery</span>
                <span>
                  {currentLocation.currency === 'NGN' ? `₦${cartDeliveryFee.toLocaleString()}` : `£${cartDeliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-[#807872] dark:text-stone-400">
                <span>Service Fee (Packaging & Tech)</span>
                <span>
                  {currentLocation.currency === 'NGN' ? `₦${cartServiceFee.toLocaleString()}` : `£${cartServiceFee.toFixed(2)}`}
                </span>
              </div>
              <div className="pt-2 border-t border-[#EAE4DC] dark:border-stone-800 flex justify-between font-extrabold text-sm text-[#241A17] dark:text-stone-100">
                <span>Total</span>
                <span>
                  {currentLocation.currency === 'NGN' ? `₦${cartTotal.toLocaleString()}` : `£${cartTotal.toFixed(2)}`}
                </span>
              </div>
            </div>

            <button
              id="proceed-checkout-btn"
              onClick={handleProceedToCheckout}
              className="w-full py-3 px-4 rounded-full bg-[#C85C43] hover:bg-[#B44F37] text-white font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-md transition-all"
            >
              <span>Proceed to Fast Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
