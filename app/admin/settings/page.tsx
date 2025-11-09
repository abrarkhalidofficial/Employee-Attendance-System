"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SettingsForm } from "@/components/common/settings-form";
import { LogOut } from "lucide-react";

export default function AdminSettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">⚙️ Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure system preferences and administrator profile
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Admin Profile */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Admin Profile
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Name</p>
              <p className="text-lg font-medium text-foreground">
                Administrator
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Role</p>
              <p className="text-lg font-medium text-foreground">
                System Administrator
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Access Level</p>
              <p className="text-lg font-medium text-foreground">Full Access</p>
            </div>
          </div>
        </Card>

        {/* Settings Form */}
        <SettingsForm userType="admin" />

        {/* System Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            System Settings
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded bg-background border-border"
              />
              <span className="text-sm text-foreground">
                Allow employee self-service leave requests
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded bg-background border-border"
              />
              <span className="text-sm text-foreground">
                Require two-factor authentication
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded bg-background border-border"
              />
              <span className="text-sm text-foreground">
                Enable time tracking geolocation
              </span>
            </label>
          </div>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={() => router.push("/")}
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
