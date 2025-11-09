"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AttendanceDashboard } from "@/components/admin/attendance-dashboard";
import { useSession } from "@/components/providers/session-provider";

export default function AdminAttendancePage() {
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-gray-100">
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">📊 Attendance Dashboard</h1>
          <p className="text-sm text-gray-600">
            Monitor employee attendance, late arrivals, and overtime
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AttendanceDashboard />
      </main>
    </div>
  );
}
