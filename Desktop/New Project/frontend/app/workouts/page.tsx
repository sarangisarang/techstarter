"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthProvider";
import { deleteWorkout, getWorkouts, type WorkoutRead } from "@/lib/api";

export default function WorkoutsPage() {
  return (
    <Protected>
      <WorkoutsInner />
    </Protected>
  );
}

function WorkoutsInner() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    setErr(null);
    try {
      const all = await getWorkouts({ auth: true });
      const mine = all.filter((w) => !w.user_id || w.user_id === user?.id);
      // newest first
      mine.sort((a, b) => (a.date < b.date ? 1 : -1));
      setWorkouts(mine);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load workouts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function onDelete(id: string) {
    if (!confirm("Delete this workout?")) return;
    try {
      await deleteWorkout(id);
      await reload();
    } catch (e: any) {
      alert(e?.message ?? "Failed to delete");
    }
  }

  const empty = !loading && !err && workouts.length === 0;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="h1">📅 Workouts</h1>
            <p className="muted mt-2">Your saved workouts.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="btn-primary" href="/cart">
              + New workout
            </Link>
            <button className="btn-ghost" type="button" onClick={reload}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {err && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{err}</div>
      )}

      {loading ? <p className="muted">Loading…</p> : null}

      {empty ? (
        <div className="card p-6">
          <p className="muted">No workouts yet. Create one from your cart.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {workouts.map((w) => (
            <div key={w.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/workouts/${w.id}`} className="font-medium hover:underline">
                    {new Date(w.date).toLocaleDateString()} — {w.workout_exercises?.length ?? 0} exercises
                  </Link>
                  {w.notes ? <p className="muted mt-2">{w.notes}</p> : <p className="muted mt-2">No notes</p>}
                </div>
                <div className="flex gap-2">
                  <Link className="btn-primary" href={`/workouts/${w.id}/start`}>Start</Link>
                  <Link className="btn-ghost" href={`/workouts/${w.id}`}>View</Link>
                  <button className="btn-ghost" type="button" onClick={() => onDelete(w.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
