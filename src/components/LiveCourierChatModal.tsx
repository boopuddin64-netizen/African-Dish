import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Send, 
  Bike, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  CheckCheck, 
  MapPin,
  MessageSquare
} from 'lucide-react';
import { Order } from '../types';

interface LiveCourierChatModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const LiveCourierChatModal: React.FC<LiveCourierChatModalProps> = ({ order, isOpen, onClose }) => {
  const { sendCourierMessage, recordTap } = useApp();
  const [inputText, setInputText] = useState('');
  const [callActive, setCallActive] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendCourierMessage(order.id, inputText);
    setInputText('');
  };

  const quickPrompts = [
    "Please call when at the gate",
    "Leave at door / reception",
    "Gate code is #4029",
    "Extra pepper sauce included?"
  ];

  const messages = order.courierMessages || [
    {
      id: 'init_1',
      sender: 'system',
      text: `Order #${order.orderNumber} confirmed. ${order.driverName || 'Emmanuel'} has been assigned as your delivery partner.`,
      timestamp: 'Just now'
    },
    {
      id: 'init_2',
      sender: 'courier',
      text: `Hello! I have picked up your order from ${order.restaurantName} in an insulated thermal pack. On my way to ${order.deliveryAddress.label}!`,
      timestamp: '2 mins ago'
    }
  ];

  return (
    <div 
      id="live-courier-chat-backdrop" 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div 
        id="live-courier-chat-modal"
        className="bg-white dark:bg-[#1E1B18] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-[#EAE4DC] dark:border-stone-800 flex flex-col h-[600px] max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAE4DC] dark:border-stone-800 bg-[#FAF7F0] dark:bg-[#181512] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#C85C43] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <Bike className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base text-[#241A17] dark:text-stone-100">
                  {order.driverName || 'Emmanuel O.'}
                </h3>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold">
                  Active Courier
                </span>
              </div>
              <p className="text-[11px] text-[#807872] dark:text-stone-400 flex items-center gap-1">
                <span>Honda 125cc · White Helmet</span>
                <span>·</span>
                <span className="text-[#C85C43] font-semibold">{order.estimatedDeliveryTime}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Direct Call Button */}
            <button
              onClick={() => {
                recordTap('Triggered simulated courier call');
                setCallActive(true);
                setTimeout(() => setCallActive(false), 4000);
              }}
              className={`p-2 rounded-full border transition-all ${
                callActive 
                  ? 'bg-emerald-600 border-emerald-600 text-white animate-pulse' 
                  : 'bg-white dark:bg-stone-800 border-[#EAE4DC] dark:border-stone-700 text-[#241A17] dark:text-stone-200 hover:border-emerald-600 hover:text-emerald-600'
              }`}
              title="Direct Call Delivery Partner"
            >
              <Phone className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white dark:hover:bg-stone-800 flex items-center justify-center text-[#807872] dark:text-stone-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Call Banner if Active */}
        {callActive && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs flex items-center justify-between animate-in slide-in-from-top duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>Connecting encrypted voice line to {order.driverName || 'Emmanuel'} ({order.driverPhone || '+234 802 443 1928'})...</span>
            </div>
            <button
              onClick={() => setCallActive(false)}
              className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-[11px] font-bold"
            >
              End Call
            </button>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 bg-[#FAF7F0]/40 dark:bg-[#141210]/40 text-xs">
          {messages.map(msg => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="px-3 py-1 rounded-full bg-[#EAE4DC]/80 dark:bg-stone-800 text-[11px] text-[#807872] dark:text-stone-400 inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#5F765A]" />
                    <span>{msg.text}</span>
                  </span>
                </div>
              );
            }

            const isMe = msg.sender === 'customer';

            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-2xs ${
                    isMe 
                      ? 'bg-[#C85C43] text-white rounded-br-xs' 
                      : 'bg-white dark:bg-stone-800 text-[#241A17] dark:text-stone-100 border border-[#EAE4DC] dark:border-stone-700 rounded-bl-xs'
                  }`}
                >
                  <p className="text-xs leading-relaxed">{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-[#807872] dark:text-stone-500 px-1">
                  <span>{msg.timestamp}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-[#C85C43]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Prompts */}
        <div className="p-2.5 bg-white dark:bg-[#1E1B18] border-t border-[#EAE4DC] dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map(prompt => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                sendCourierMessage(order.id, prompt);
              }}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#FAF7F0] dark:bg-stone-800 hover:bg-[#EAE4DC] dark:hover:bg-stone-700 border border-[#EAE4DC] dark:border-stone-700 text-[11px] font-medium text-[#241A17] dark:text-stone-200 transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white dark:bg-[#1E1B18] border-t border-[#EAE4DC] dark:border-stone-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Message your courier directly..."
            className="flex-1 px-4 py-2.5 rounded-full bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-700 text-xs text-[#241A17] dark:text-stone-100 focus:outline-none focus:border-[#C85C43]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-full bg-[#C85C43] hover:bg-[#B44F37] disabled:opacity-40 text-white transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
