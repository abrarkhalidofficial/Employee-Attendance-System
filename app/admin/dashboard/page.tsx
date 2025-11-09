"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  // Using the list query to get employees
  const employeesData = useQuery(api.employees.list, {});
  const employees = employeesData?.items || [];

  const stats =
    employees.length > 0
      ? {
          totalEmployees: employees.length,
          activeEmployees: employees.filter((e: any) => e.isActive === true)
            .length,
          inactiveEmployees: employees.filter((e: any) => e.isActive === false)
            .length,
        }
      : null;

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Admin Dashboard"
        subtitle="Overview of employee attendance and status"
      />
      <div className="flex-1 overflow-auto p-8 space-y-6">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Employees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-chart-1">
                  {stats.activeEmployees}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Inactive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-chart-2">
                  {stats.inactiveEmployees}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-chart-3">
                  {stats.totalEmployees}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Employee List</CardTitle>
            <CardDescription>
              All registered employees in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!employeesData ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : employees.length === 0 ? (
              <p className="text-muted-foreground">
                No employees found. Create employees to get started.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((employee: any) => (
                  <Card
                    key={employee._id}
                    className="border-l-4 border-l-primary"
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {employee.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Code: {employee.employeeCode}
                        </p>
                        <Badge
                          variant={employee.isActive ? "default" : "secondary"}
                        >
                          {employee.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
