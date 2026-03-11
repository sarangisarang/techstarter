"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createExercise } from "@/lib/api";
import Protected from "@/components/Protected";

export default function NewExercisePage() {
  return (
    <Protected>
      <NewExerciseInner />
    </Protected>
  );
}

function NewExerciseInner() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      await createExercise({
        name,
        muscle_group: muscleGroup,
        description: description.trim() ? description.trim() : undefined,
      });
      router.push("/exercises");
    } catch (e: any) {
      setErr(e?.message ?? "Failed to create exercise");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="h1">Create exercise</h1>
        <Link className="btn-ghost" href="/exercises">Back</Link>
      </div>

      <form onSubmit={onSubmit} className="card p-6 space-y-4">
        {err && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{err}</div>
        )}

        <div>
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <label className="label">Muscle group</label>
          <input className="input" value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)} required />
        </div>

        <div>
          <label className="label">Description (optional)</label>
          <textarea
            className="input min-h-[90px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create"}
          </button>
          <button className="btn-ghost" type="button" onClick={() => router.push("/exercises")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
