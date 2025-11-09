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
    <div className="min-h-screen bg-background">
      <header className="border-b shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">👤 My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and update your personal information
          </p>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileEdit userId={user._id as Id<"users">} />
      </main>
    </div>
  );
}
