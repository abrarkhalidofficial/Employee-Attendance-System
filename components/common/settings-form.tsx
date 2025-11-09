"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SettingsIcon, Save } from "lucide-react"

interface SettingsFormProps {
  userType: "employee" | "admin"
}

export function SettingsForm({ userType }: SettingsFormProps) {
  const [formData, setFormData] = useState({
    email: userType === "employee" ? "alex.johnson@company.com" : "admin@company.com",
    phone: "+1 (555) 123-4567",
    timezone: "UTC-5",
    notifications: true,
    emailAlerts: true,
    darkMode: true,
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-slate-50">Settings</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-50 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 hover:border-slate-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-50 mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 hover:border-slate-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-50 mb-2">Timezone</label>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 hover:border-slate-600 focus:border-blue-500 focus:outline-none"
          >
            <option>UTC-8 (PST)</option>
            <option>UTC-6 (CST)</option>
            <option>UTC-5 (EST)</option>
            <option>UTC+0 (UTC)</option>
            <option>UTC+1 (CET)</option>
          </select>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-700">
          <h4 className="text-sm font-medium text-slate-50">Notifications</h4>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notifications}
              onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700"
            />
            <span className="text-sm text-slate-300">Enable push notifications</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.emailAlerts}
              onChange={(e) => setFormData({ ...formData, emailAlerts: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700"
            />
            <span className="text-sm text-slate-300">Email alerts for leave approvals</span>
          </label>
        </div>

        <div className="pt-4 border-t border-slate-700">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.darkMode}
              onChange={(e) => setFormData({ ...formData, darkMode: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700"
            />
            <span className="text-sm text-slate-300">Dark mode</span>
          </label>
        </div>

        <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>

        {saved && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-green-400 text-sm">
            Settings saved successfully!
          </div>
        )}
      </div>
    </Card>
  )
}
