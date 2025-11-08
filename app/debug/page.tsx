"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function DebugPage() {
  const users = useQuery(api.authSimple.listUsers);
  const deleteUser = useMutation(api.authSimple.deleteUserByEmail);
  const deleteAll = useMutation(api.authSimple.deleteAllUsers);
  const [emailToDelete, setEmailToDelete] = useState("");

  const handleDeleteUser = async () => {
    if (!emailToDelete) return;
    try {
      const result = await deleteUser({ email: emailToDelete });
      alert(result.message);
      setEmailToDelete("");
    } catch (error) {
      alert("Error: " + (error as Error).message);
    }
  };

  const handleDeleteAll = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL users? This cannot be undone!"
      )
    )
      return;
    try {
      const result = await deleteAll();
      alert(result.message);
    } catch (error) {
      alert("Error: " + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🔧 Debug & Admin Tools</h1>
        <p className="text-muted-foreground">
          Manage users and debug authentication
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Users in Database</CardTitle>
          <CardDescription>
            All registered users with partial password hashes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users === undefined ? (
            <p>Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">
              No users found. Create a new account to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user._id} className="p-3 border rounded-lg space-y-1">
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Role:</strong>{" "}
                    <span className="uppercase">{user.role}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Password Hash:</strong> {user.passwordHash}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete User by Email</CardTitle>
          <CardDescription>
            Remove a specific user from the database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="email"
            placeholder="user@example.com"
            value={emailToDelete}
            onChange={(e) => setEmailToDelete(e.target.value)}
          />
          <Button onClick={handleDeleteUser} variant="destructive">
            Delete User
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">⚠️ Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete all users (cannot be undone)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDeleteAll} variant="destructive">
            Delete All Users
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h3 className="font-semibold">If you're having login issues:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Check if your user exists in the list above</li>
              <li>
                If the user was created with old auth system, delete it using
                "Delete User by Email"
              </li>
              <li>
                Go back to{" "}
                <a href="/" className="text-primary underline">
                  /
                </a>{" "}
                and create a new account
              </li>
              <li>Try signing in with the new account</li>
            </ol>
          </div>
          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-semibold">Fresh Start:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Delete All Users" to clear the database</li>
              <li>
                Go to{" "}
                <a href="/" className="text-primary underline">
                  /
                </a>
              </li>
              <li>Create a new admin account</li>
              <li>Sign in and start using the system</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button asChild variant="outline">
          <a href="/">← Back to Login</a>
        </Button>
        <Button asChild>
          <a href="/admin/dashboard">Admin Dashboard →</a>
        </Button>
      </div>
    </div>
  );
}
