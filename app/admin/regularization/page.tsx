"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegularizationPanel } from "@/components/admin/regularization-panel";
import { useSession } from "@/components/providers/session-provider";
import { Id } from "@/convex/_generated/dataModel";

export default function AdminRegularizationPage() {
  const router = useRouter();
  const { user, hydrated } = useSession();

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "admin") {
      router.replace("/");
    }
  }, [hydrated, router, user]);

  if (!hydrated || !user || user.role !== "admin") {
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
          <h1 className="text-3xl font-bold text-foreground">
            ✅ Regularization Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve attendance regularization requests
          </p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RegularizationPanel adminId={user._id as Id<"users">} />
      </main>
    </div>
  );
}
