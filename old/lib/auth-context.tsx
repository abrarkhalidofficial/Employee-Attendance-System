"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cookieUtils } from "./cookies";

interface User {
  _id: Id<"users">;
  email: string;
  name: string;
  role: "admin" | "employee";
  isActive: boolean;
}

interface Employee {
  _id: Id<"employees">;
  userId: Id<"users">;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  departmentId?: Id<"departments">;
  managerId?: Id<"employees">;
  isActive: boolean;
  hireDate: string;
  position?: string;
  salary?: number;
  _creationTime: number;
}

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    name: string,
    password: string,
    role: "admin" | "employee"
  ) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authCredentials, setAuthCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const signUpMutation = useMutation(api.authSimple.signUpMutation);
  const signInData = useQuery(
    api.authSimple.signInQuery,
    authCredentials ? authCredentials : "skip"
  );

  // Get employee data if user is an employee
  const employeeData = useQuery(
    api.employees.getEmployeeByUserId,
    user?.role === "employee" && user?._id ? { userId: user._id } : "skip"
  );

  useEffect(() => {
    // Check for stored user in cookies
    const storedUser = cookieUtils.get("currentUser");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        cookieUtils.remove("currentUser");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (employeeData) {
      setEmployee(employeeData);
    }
  }, [employeeData]);

  // Handle sign in data
  useEffect(() => {
    if (signInData) {
      // Map backend role (ADMIN/EMPLOYEE) to frontend role (admin/employee)
      const userData = {
        ...signInData,
        role: signInData.role === "ADMIN" ? "admin" : "employee",
      } as User;

      setUser(userData);
      // Store user data in cookie (expires in 7 days)
      cookieUtils.set("currentUser", JSON.stringify(userData), 7);
      setAuthCredentials(null); // Clear credentials after successful sign in
      setIsLoading(false);
    }
  }, [signInData]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      setAuthCredentials({ email, password });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    name: string,
    password: string,
    role: "admin" | "employee"
  ) => {
    setIsLoading(true);
    try {
      await signUpMutation({ email, name, password, role });
      // After sign up, automatically sign in
      await signIn(email, password);
    } catch (error) {
      console.error("Sign up error:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    setEmployee(null);
    // Remove user data from cookies
    cookieUtils.remove("currentUser");
    // Clear auth credentials
    setAuthCredentials(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
