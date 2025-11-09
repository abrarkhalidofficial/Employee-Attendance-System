"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileEdit } from "@/components/employee/profile-edit";
import { useSession } from "@/components/providers/session-provider";
import { Id } from "@/convex/_generated/dataModel";

export default function ProfilePage() {
  const router = useRouter();
  const { user, hydrated } = useSession();

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "employee") {
      router.replace("/");
    }
  }, [hydrated, router, user]);

  if (!hydrated || !user || user.role !== "employee") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-gray-100">
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">👤 My Profile</h1>
          <p className="text-sm text-gray-600">
            View and update your personal information
          </p>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <ProfileEdit userId={user._id as Id<"users">} />
      </main>
    </div>
  );
}
