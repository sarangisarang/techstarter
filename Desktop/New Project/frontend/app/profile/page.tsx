"use client";

import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthProvider";

export default function ProfilePage() {
  return (
    <Protected>
      <ProfileInner />
    </Protected>
  );
}

function ProfileInner() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="h1">Profile</h1>
        <p className="muted mt-2">Your account details.</p>
      </div>

      <div className="card p-6 space-y-3">
        <div>
          <p className="muted">Name</p>
          <p className="mt-1 font-medium">{user?.name || "-"}</p>
        </div>
        <div>
          <p className="muted">Email</p>
          <p className="mt-1 font-medium">{user?.email}</p>
        </div>
        <div>
          <p className="muted">User ID</p>
          <p className="mt-1 font-mono text-sm text-neutral-300">{user?.id}</p>
        </div>
      </div>
    </div>
  );
}
