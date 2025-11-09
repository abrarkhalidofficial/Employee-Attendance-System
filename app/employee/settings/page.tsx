"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SettingsForm } from "@/components/common/settings-form";
import { LogOut } from "lucide-react";
import { useSession } from "@/components/providers/session-provider";

export default function EmployeeSettingsPage() {
  const router = useRouter();
  const { user, hydrated, clearUser } = useSession();

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "employee") {
      router.replace("/");
    }
  }, [hydrated, router, user]);

  if (!hydrated || !user || user.role !== "employee") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">⚙️ Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile and preferences
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Profile
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Name</p>
              <p className="text-lg font-medium text-foreground">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Department</p>
              <p className="text-lg font-medium text-foreground">
                {user.department ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Position</p>
              <p className="text-lg font-medium text-foreground">
                {user.position ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Join Date</p>
              <p className="text-lg font-medium text-foreground">
                {user.joinDate
                  ? new Date(user.joinDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </Card>

        {/* Settings Form */}
        <SettingsForm userType="employee" />

        {/* Logout Button */}
        <Button
          onClick={() => {
            clearUser();
            router.push("/");
          }}
          variant="destructive"
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </main>
    </div>
  );
}
