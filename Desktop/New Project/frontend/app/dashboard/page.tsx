"use client";

import { useEffect, useMemo, useState } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthProvider";
import { getExercises, getWorkouts } from "@/lib/api";
import { readCart } from "@/lib/cart";

export default function DashboardPage() {
  return (
    <Protected>
      <DashboardInner />
    </Protected>
  );
}

function DashboardInner() {
  const { user } = useAuth();
  const [exCount, setExCount] = useState(0);
  const [woCount, setWoCount] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  const cartCount = useMemo(() => readCart().length, []);

  useEffect(() => {
    (async () => {
      setErr(null);
      try {
        const [ex, wo] = await Promise.all([getExercises(), getWorkouts({ auth: true })]);
        setExCount(ex.length);
        // Filter by current user if backend returns all workouts
        const mine = wo.filter((w) => !w.user_id || w.user_id === user?.id);
        setWoCount(mine.length);
      } catch (e: any) {
        setErr(e?.message || "Failed to load dashboard data");
      }
    })();
  }, [user?.id]);

  return (
    <div className="space-y-8">
      <div className="card p-6">
        <h1 className="h1">Dashboard</h1>
        <p className="muted mt-2">Welcome, {user?.name || user?.email}.</p>
        {err && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            {err}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-6">
          <div className="text-2xl">🏋️</div>
          <p className="muted mt-2">Exercises</p>
          <p className="mt-1 text-3xl font-semibold">{exCount}</p>
        </div>
        <div className="card p-6">
          <div className="text-2xl">📅</div>
          <p className="muted mt-2">Workouts</p>
          <p className="mt-1 text-3xl font-semibold">{woCount}</p>
        </div>
        <div className="card p-6">
          <div className="text-2xl">🧺</div>
          <p className="muted mt-2">Cart items</p>
          <p className="mt-1 text-3xl font-semibold">{cartCount}</p>
        </div>
      </div>
    </div>
  );
}
