"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import { User, Phone, MapPin, Users, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProfileEditProps {
  userId: Id<"users">;
}

export function ProfileEdit({ userId }: ProfileEditProps) {
  const { toast } = useToast();
  const profile = useQuery(api.profile.getProfile, { userId });
  const updateProfile = useMutation(api.profile.updateProfile);
  const changePassword = useMutation(api.profile.changePassword);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Initialize form data when profile loads
  useState(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || "",
        address: profile.address || "",
        emergencyContact: profile.emergencyContact || "",
        emergencyPhone: profile.emergencyPhone || "",
      });
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        userId,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        emergencyContact: formData.emergencyContact || undefined,
        emergencyPhone: formData.emergencyPhone || undefined,
      });
      toast({
        title: "✅ Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "❌ Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "❌ Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        userId,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast({
        title: "✅ Password Changed",
        description: "Your password has been changed successfully.",
      });
      setIsPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            View and update your profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Read-only Fields */}
          <div className="space-y-4">
            <div>
              <Label className="text-gray-600">Name</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded border">
                {profile.name}
              </div>
            </div>
            <div>
              <Label className="text-gray-600">Email</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded border">
                {profile.email}
              </div>
            </div>
            <div>
              <Label className="text-gray-600">Department</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded border">
                {profile.department}
              </div>
            </div>
          </div>

          <Separator />

          {/* Editable Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={!isEditing}
                placeholder="+92 300 1234567"
              />
            </div>

            <div>
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Enter your address"
                rows={3}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Emergency Contact
              </Label>
              <div>
                <Label
                  htmlFor="emergencyContact"
                  className="text-sm text-gray-600"
                >
                  Contact Name
                </Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label
                  htmlFor="emergencyPhone"
                  className="text-sm text-gray-600"
                >
                  Contact Phone
                </Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyPhone: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="flex-1">
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data
                    setFormData({
                      phone: profile.phone || "",
                      address: profile.address || "",
                      emergencyContact: profile.emergencyContact || "",
                      emergencyPhone: profile.emergencyPhone || "",
                    });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog
            open={isPasswordDialogOpen}
            onOpenChange={setIsPasswordDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your current password and choose a new one.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="w-full"
                >
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
