# 🔌 Frontend-Backend Connection Reference

## Quick Start

```bash
# Terminal 1
pnpm convex dev

# Terminal 2
pnpm dev
```

## 🔑 Authentication

### Using the Auth Hook

```typescript
import { useAuth } from "@/lib/auth-context";

function MyComponent() {
  const { user, employee, signIn, signOut } = useAuth();

  // user: { _id, email, name, role, status }
  // employee: { _id, userId, name, department, position, currentStatus }
}
```

## 📡 Convex Queries & Mutations

### Import API

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
```

### Common Patterns

#### Query Data

```typescript
// Get all employees
const employees = useQuery(api.employees.getAllEmployees);

// Get specific employee
const employee = useQuery(api.employees.getEmployeeById, {
  employeeId: "j57...",
});

// Conditional query (skip if no ID)
const data = useQuery(
  api.workingHours.getTodayWorkingHours,
  employeeId ? { employeeId } : "skip"
);
```

#### Mutate Data

```typescript
const updateStatus = useMutation(api.employees.updateEmployeeStatus);

await updateStatus({
  employeeId: employee._id,
  status: "break",
  reason: "Lunch",
  userId: user._id,
});
```

## 🛠️ Available Backend Functions

### Auth (`convex/auth.ts`)

- `signUp({ email, name, password, role })` - Action
- `signIn({ email, password })` - Action

### Users (`convex/users.ts`)

- `getCurrentUser()` - Query
- `checkUserExists({ email })` - Internal
- `getUserByEmail({ email })` - Internal
- `createUser({ ...data })` - Internal

### Employees (`convex/employees.ts`)

- `getAllEmployees()` - Query
- `getEmployeeById({ employeeId })` - Query
- `getEmployeeByUserId({ userId })` - Query ⭐ NEW
- `createEmployee({ userId, name, email, department, position })` - Mutation
- `updateEmployeeStatus({ employeeId, status, reason, userId })` - Mutation
- `deactivateEmployee({ employeeId, userId })` - Mutation

### Working Hours (`convex/workingHours.ts`)

- `getTodayWorkingHours({ employeeId? })` - Query
- `getWorkingHoursByEmployee({ employeeId })` - Query
- `startWorkDay({ employeeId })` - Mutation
- `endWorkDay({ employeeId })` - Mutation

### Leaves (`convex/leaves.ts`)

- `getAllLeaves()` - Query
- `getLeavesByEmployee({ employeeId })` - Query
- `createLeaveRequest({ employeeId, startDate, endDate, type, reason, userId })` - Mutation
- `approveLeave({ leaveId, comments?, userId })` - Mutation
- `rejectLeave({ leaveId, comments, userId })` - Mutation

### Status History (`convex/statusHistory.ts`)

- `getEmployeeStatusHistory({ employeeId, limit? })` - Query
- `getRecentStatusHistory({ limit? })` - Query

### Activity Log (`convex/activityLog.ts`)

- `getActivityLogs()` - Query

## 🎨 Component Examples

### Protected Page

```typescript
"use client";
import { ProtectedRoute } from "@/components/protected-route";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Admin only content</div>
    </ProtectedRoute>
  );
}
```

### Data Fetching

```typescript
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function EmployeeList() {
  const employees = useQuery(api.employees.getAllEmployees);

  if (employees === undefined) return <div>Loading...</div>;
  if (employees.length === 0) return <div>No employees</div>;

  return (
    <ul>
      {employees.map((emp) => (
        <li key={emp._id}>{emp.name}</li>
      ))}
    </ul>
  );
}
```

### Form Submission

```typescript
"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth-context";

export default function LeaveRequestForm() {
  const { employee, user } = useAuth();
  const createLeave = useMutation(api.leaves.createLeaveRequest);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !user) return;

    await createLeave({
      employeeId: employee._id,
      startDate: Date.now(),
      endDate: Date.now() + 86400000, // +1 day
      type: "sick",
      reason: "Feeling unwell",
      userId: user._id,
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## 🔄 Real-time Updates

Convex queries are **automatically reactive**:

```typescript
// This automatically updates when data changes!
const employees = useQuery(api.employees.getAllEmployees);
```

No need for manual refetching or polling.

## 🎯 Common Use Cases

### Get Current User's Employee Record

```typescript
const { user, employee } = useAuth();
// employee automatically fetched if user.role === "employee"
```

### Start Work Day

```typescript
const { employee } = useAuth();
const startWork = useMutation(api.workingHours.startWorkDay);

await startWork({ employeeId: employee._id });
```

### Update Employee Status

```typescript
const { user, employee } = useAuth();
const updateStatus = useMutation(api.employees.updateEmployeeStatus);

await updateStatus({
  employeeId: employee._id,
  status: "break",
  reason: "Coffee break",
  userId: user._id,
});
```

### Create Employee (Admin)

```typescript
const { user } = useAuth();
const createEmployee = useMutation(api.employees.createEmployee);

await createEmployee({
  userId: user._id,
  name: "John Doe",
  email: "john@example.com",
  department: "Engineering",
  position: "Developer",
});
```

## 🧪 Testing Checklist

- [ ] Sign up as admin
- [ ] Sign in as admin
- [ ] View admin dashboard
- [ ] Create employee
- [ ] Sign up as employee
- [ ] Sign in as employee
- [ ] Start work day
- [ ] Update status
- [ ] End work day
- [ ] Submit leave request
- [ ] Approve leave (as admin)
- [ ] View activity log

## 🐛 Common Issues

### 1. "employeeId is null"

✅ **Fixed!** Query now handles optional `employeeId`

### 2. User data not available

```typescript
// Always check before using
if (!user || !employee) return null;
```

### 3. Query not updating

- Ensure `pnpm convex dev` is running
- Check browser console for errors

### 4. Type errors with IDs

```typescript
import { Id } from "@/convex/_generated/dataModel";

// Correct
const id: Id<"employees"> = "j57...";
```

## 📚 Resources

- Convex Docs: https://docs.convex.dev
- Dashboard: https://dashboard.convex.dev
- Next.js Docs: https://nextjs.org/docs

---

**All connections are complete and working! 🎉**
