import React, { useEffect, useState } from 'react';
import { ShieldCheck, Check, X, Store, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  RoleRequest,
  approveRoleRequest,
  rejectRoleRequest,
  setRestaurantVerification,
  subscribeToPendingRestaurants,
  subscribeToPendingRoleRequests
} from '../services/roleService';

/** Minimal admin panel: approve/reject role requests and verify restaurants. Enforcement is in Firestore rules. */
export const AdminDashboard: React.FC = () => {
  const { userProfile, showToast } = useApp();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [pendingRestaurants, setPendingRestaurants] = useState<{ id: string; name?: string; city?: string; ownerId?: string }[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const isAdmin = userProfile.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    const u1 = subscribeToPendingRoleRequests(setRequests);
    const u2 = subscribeToPendingRestaurants(setPendingRestaurants);
    return () => {
      u1();
      u2();
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-sm text-[#807872] dark:text-stone-400">
        Admin access required.
      </div>
    );
  }

  const run = async (id: string, fn: () => Promise<void>, okMsg: string) => {
    setBusyId(id);
    try {
      await fn();
      showToast(okMsg, 'success');
    } catch (err) {
      showToast((err as { message?: string })?.message || 'Action failed.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-[#C85C43]" aria-hidden="true" />
        <h1 className="text-xl font-extrabold text-[#241A17] dark:text-stone-100">Admin console</h1>
      </div>

      <section aria-labelledby="role-requests-h" className="bg-white dark:bg-[#1E1B18] rounded-3xl border border-[#EAE4DC] dark:border-stone-800 p-5 space-y-3">
        <h2 id="role-requests-h" className="text-sm font-extrabold flex items-center gap-2 text-[#241A17] dark:text-stone-100">
          <UserCheck className="w-4 h-4" aria-hidden="true" /> Role requests ({requests.length})
        </h2>
        {requests.length === 0 && <p className="text-xs text-[#807872] dark:text-stone-400">No pending requests.</p>}
        {requests.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 text-xs">
            <div>
              <div className="font-bold text-[#241A17] dark:text-stone-100">{r.requestedRole.replace('_', ' ')}</div>
              <div className="text-[#807872] dark:text-stone-400">user {r.userId}{r.restaurantId ? ` · restaurant ${r.restaurantId}` : ''}</div>
              {r.note && <div className="italic text-[#807872] dark:text-stone-400">“{r.note}”</div>}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busyId === r.id}
                onClick={() => run(r.id, () => approveRoleRequest(r, userProfile.id), 'Role approved.')}
                className="px-3 py-1.5 rounded-full bg-[#5F765A] text-white font-bold flex items-center gap-1 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" /> Approve
              </button>
              <button
                type="button"
                disabled={busyId === r.id}
                onClick={() => run(r.id, () => rejectRoleRequest(r, userProfile.id), 'Request rejected.')}
                className="px-3 py-1.5 rounded-full border border-red-300 text-red-700 dark:text-red-400 font-bold flex items-center gap-1 disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" /> Reject
              </button>
            </div>
          </div>
        ))}
      </section>

      <section aria-labelledby="pending-rest-h" className="bg-white dark:bg-[#1E1B18] rounded-3xl border border-[#EAE4DC] dark:border-stone-800 p-5 space-y-3">
        <h2 id="pending-rest-h" className="text-sm font-extrabold flex items-center gap-2 text-[#241A17] dark:text-stone-100">
          <Store className="w-4 h-4" aria-hidden="true" /> Restaurants awaiting verification ({pendingRestaurants.length})
        </h2>
        {pendingRestaurants.length === 0 && <p className="text-xs text-[#807872] dark:text-stone-400">Nothing to verify.</p>}
        {pendingRestaurants.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 text-xs">
            <div>
              <div className="font-bold text-[#241A17] dark:text-stone-100">{r.name || r.id}</div>
              <div className="text-[#807872] dark:text-stone-400">{r.city} · owner {r.ownerId}</div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busyId === r.id}
                onClick={() => run(r.id, () => setRestaurantVerification(r.id, true), 'Restaurant verified.')}
                className="px-3 py-1.5 rounded-full bg-[#5F765A] text-white font-bold disabled:opacity-50"
              >
                Verify
              </button>
              <button
                type="button"
                disabled={busyId === r.id}
                onClick={() => run(r.id, () => setRestaurantVerification(r.id, false), 'Restaurant rejected.')}
                className="px-3 py-1.5 rounded-full border border-red-300 text-red-700 dark:text-red-400 font-bold disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
