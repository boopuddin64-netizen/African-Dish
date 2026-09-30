import React from 'react';
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const STYLES = {
  error: { cls: 'bg-red-50 dark:bg-red-950/70 border-red-300 dark:border-red-900 text-red-900 dark:text-red-200', Icon: AlertCircle },
  success: { cls: 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200', Icon: CheckCircle2 },
  info: { cls: 'bg-white dark:bg-stone-900 border-[#EAE4DC] dark:border-stone-700 text-[#241A17] dark:text-stone-100', Icon: Info },
  warning: { cls: 'bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200', Icon: AlertTriangle }
} as const;

/** Global toast stack (top-right). Errors from services surface here via lib/notifications. */
export const Toast: React.FC = () => {
  const { toasts, dismissToast } = useApp();
  return (
    <div
      className="fixed top-3 right-3 z-[200] flex flex-col gap-2 w-[calc(100vw-1.5rem)] max-w-sm pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => {
        const { cls, Icon } = STYLES[t.type];
        return (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-2xl border shadow-lg text-xs font-semibold ${cls}`}
          >
            <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="flex-1 leading-relaxed">{t.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 opacity-70 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
