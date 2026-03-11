"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch, getApiBase, uploadExerciseImage } from "@/lib/api";
import { addToCart } from "@/lib/cart";
import { useAuth } from "@/components/AuthProvider";

type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  description?: string | null;
  image_url?: string | null;
};

export default function ExercisesPage() {
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("ALL");

  const base = useMemo(() => getApiBase(), []);
  const { user } = useAuth();
  const isLoggedIn = !!user;

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await apiFetch<Exercise[]>("/exercises/");
      setItems(data || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load exercises");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function uploadImage(exerciseId: string, file: File) {
    await uploadExerciseImage(exerciseId, file);
    await load();
  }

  function imageSrc(ex: Exercise) {
    if (ex.image_url) return ex.image_url.startsWith("http") ? ex.image_url : `${base}${ex.image_url}`;
    // fallback placeholder
    return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=60";
  }

  const muscleGroups = useMemo(() => {
    const set = new Set(items.map((x) => x.muscle_group).filter(Boolean));
    return ["ALL", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((x) => {
      const okGroup = group === "ALL" || x.muscle_group === group;
      const okQuery = !query || x.name.toLowerCase().includes(query) || (x.description || "").toLowerCase().includes(query);
      return okGroup && okQuery;
    });
  }, [items, q, group]);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="h1">🏋️ Exercises</h1>
            <p className="muted mt-2">Add exercises to your cart, upload images, and build workouts.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isLoggedIn ? (
              <Link className="btn-ghost" href="/exercises/new">+ New exercise</Link>
            ) : (
              <Link className="btn-ghost" href="/login">Login to upload</Link>
            )}
            <button onClick={load} className="btn-ghost" type="button">
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="label">Search</label>
            <input className="input mt-2" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Bench press, squat..." />
          </div>
          <div>
            <label className="label">Muscle group</label>
            <select className="input mt-2" value={group} onChange={(e) => setGroup(e.target.value)}>
              {muscleGroups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {err && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{err}</div>
      )}

      {!loading && !err && filtered.length === 0 ? (
        <div className="card p-6">
          <p className="muted">No exercises found.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ex) => (
            <div key={ex.id} className="card overflow-hidden">
              <div className="relative h-44 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSrc(ex)} alt={ex.name} className="h-full w-full object-cover" />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold">{ex.name}</h2>
                  <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-300">{ex.muscle_group}</span>
                </div>

                {ex.description ? <p className="muted mt-3 line-clamp-3">{ex.description}</p> : null}

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      addToCart({
                        exerciseId: ex.id,
                        name: ex.name,
                        muscleGroup: ex.muscle_group,
                        imageUrl: ex.image_url,
                        sets: 3,
                        reps: 10,
                        weight: null,
                        restSeconds: 30,
                        restLimitSeconds: 45,
                      });
                      alert("✅ Added to cart");
                    }}
                  >
                    ➕ Add
                  </button>

                  <Link href="/cart" className="btn-ghost">🧺 Cart</Link>

                  <label className={"btn-ghost cursor-pointer " + (!isLoggedIn ? "opacity-60" : "")}
                         title={!isLoggedIn ? "Login required" : "Upload image"}>
                    📷 Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!isLoggedIn}
                      onChange={async (e) => {
                        const input = e.currentTarget;
                        const file = input.files?.[0];
                        if (!file) return;
                        try {
                          await uploadImage(ex.id, file);
                          alert("✅ Image uploaded");
                        } catch (err: any) {
                          alert(err?.message || "Upload failed");
                        } finally {
                          input.value = "";
                        }
                      }}
                    />
                  </label>
                </div>

                {!isLoggedIn ? <p className="mt-3 text-xs text-neutral-500">Login required for uploads.</p> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
