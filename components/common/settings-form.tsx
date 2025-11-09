"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SettingsIcon, Save } from "lucide-react";

interface SettingsFormProps {
  userType: "employee" | "admin";
}

export function SettingsForm({ userType }: SettingsFormProps) {
  const [formData, setFormData] = useState({
    email:
      userType === "employee"
        ? "alex.johnson@company.com"
        : "admin@company.com",
    phone: "+1 (555) 123-4567",
    timezone: "UTC-5",
    notifications: true,
    emailAlerts: true,
    darkMode: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Settings</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full bg-background border rounded-lg px-3 py-2 text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full bg-background border rounded-lg px-3 py-2 text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) =>
              setFormData({ ...formData, timezone: e.target.value })
            }
            className="w-full bg-background border rounded-lg px-3 py-2 text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          >
            <option>UTC-8 (PST)</option>
            <option>UTC-6 (CST)</option>
            <option>UTC-5 (EST)</option>
            <option>UTC+0 (UTC)</option>
            <option>UTC+1 (CET)</option>
          </select>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-medium text-foreground">Notifications</h4>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notifications}
              onChange={(e) =>
                setFormData({ ...formData, notifications: e.target.checked })
              }
              className="w-4 h-4 rounded bg-background border"
            />
            <span className="text-sm text-muted-foreground">
              Enable push notifications
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.emailAlerts}
              onChange={(e) =>
                setFormData({ ...formData, emailAlerts: e.target.checked })
              }
              className="w-4 h-4 rounded bg-background border"
            />
            <span className="text-sm text-muted-foreground">
              Email alerts for leave approvals
            </span>
          </label>
        </div>

        <div className="pt-4 border-t">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.darkMode}
              onChange={(e) =>
                setFormData({ ...formData, darkMode: e.target.checked })
              }
              className="w-4 h-4 rounded bg-background border"
            />
            <span className="text-sm text-muted-foreground">Dark mode</span>
          </label>
        </div>

        <Button onClick={handleSave} className="w-full mt-6">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>

        {saved && (
          <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg p-3 text-green-700 dark:text-green-400 text-sm">
            Settings saved successfully!
          </div>
        )}
      </div>
    </Card>
  );
}
