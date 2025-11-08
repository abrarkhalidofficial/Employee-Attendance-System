# 🚀 Employee Attendance System - Complete Setup Guide

## 📋 Overview

This is a complete guide to connect your frontend to the Convex backend and get your Employee Attendance System running.

## ✅ What's Been Completed

### 1. **Backend (Convex)**

- ✅ Database schema defined in `convex/schema.ts`
- ✅ All queries and mutations created:
  - `auth.ts` - Sign up/Sign in actions
  - `users.ts` - User management queries
  - `employees.ts` - Employee CRUD operations
  - `workingHours.ts` - Time tracking (START/END work)
  - `leaves.ts` - Leave request management
  - `statusHistory.ts` - Employee status tracking
  - `activityLog.ts` - System activity logging

### 2. **Frontend**

- ✅ All UI components built with shadcn/ui
- ✅ Dashboard pages for Admin and Employee roles
- ✅ ConvexClientProvider configured
- ✅ **NEW:** AuthContext created for user management
- ✅ **NEW:** Protected routes for admin/employee areas
- ✅ **NEW:** All TODO sections connected with real functionality

### 3. **New Files Created**

- `lib/auth-context.tsx` - Authentication state management
- `components/protected-route.tsx` - Route protection wrapper
- `.env.example` - Environment variables template

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Set Up Convex

1. **Initialize Convex (if not already done):**

   ```bash
   npx convex dev
   ```

2. **Follow the prompts:**

   - Create a new Convex project or link existing
   - This will generate a URL like: `https://your-project.convex.cloud`

3. **Copy the Convex URL:**
   - The terminal will display your deployment URL
   - Copy it for the next step

### Step 3: Configure Environment Variables

1. **Check if `.env.local` exists:**

   ```bash
   ls .env.local
   ```

2. **If it exists, open and add your Convex URL:**

   ```env
   NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
   ```

3. **If it doesn't exist, create it:**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` and add your Convex URL.

### Step 4: Run Development Servers

You need TWO terminals running simultaneously:

**Terminal 1 - Convex Backend:**

```bash
pnpm convex dev
```

**Terminal 2 - Next.js Frontend:**

```bash
pnpm dev
```

### Step 5: Access the Application

Open your browser and go to:

```
http://localhost:3000
```

---

## 🎯 How to Use the Application

### First Time Setup

1. **Create an Admin Account:**

   - Go to `http://localhost:3000`
   - Click "Sign Up" tab
   - Fill in details:
     - Name: Your name
     - Email: admin@example.com
     - Password: your-password
     - Account Type: **Admin**
   - Click "Sign Up"

2. **Sign In:**
   - Use your credentials to sign in
   - You'll be redirected to `/admin/dashboard`

### Admin Features

#### 📊 Dashboard (`/admin/dashboard`)

- View total employees count
- See active employees
- Monitor employees on break/task
- View real-time status updates

#### 👥 Employees (`/admin/employees`)

- View all employees
- **Add New Employee:**
  - Click "Add Employee"
  - Fill in employee details
  - This creates an employee record linked to the system

#### 🏖️ Leave Requests (`/admin/leaves`)

- View all leave requests
- Approve or reject requests
- Add comments to decisions

#### 📝 Activity Log (`/admin/activity`)

- View system-wide activity
- Track all changes made

### Employee Features

#### 🏠 Dashboard (`/employee/dashboard`)

- **Start/End Work Day:**
  - Click "Start Work" to begin tracking
  - See elapsed time in real-time
  - Click "End Work" to stop tracking
- **Update Status:**
  - Click "Update Status"
  - Choose "On Break" or "On Task"
  - Add reason (e.g., "Lunch break", "Client meeting")
  - Status visible to admins

#### ⏰ Working Hours (`/employee/working-hours`)

- View your work history
- See daily/weekly totals
- Track break times

#### 🏖️ Leave Requests (`/employee/leaves`)

- Submit leave requests
- View request status (Pending/Approved/Rejected)
- Track remaining leave balance

---

## 🔗 API Integration Points

### Authentication Flow

```typescript
// Sign Up
await signUp(email, name, password, role);
// Creates user in database
// Auto signs in after successful registration

// Sign In
await signIn(email, password);
// Validates credentials
// Sets user in AuthContext
// Stores session in localStorage
```

### Employee Dashboard - Working Hours

```typescript
// Start Work
await startWorkDay({ employeeId });
// Creates entry in workingHours table
// Records start time

// End Work
await endWorkDay({ employeeId });
// Updates workingHours entry
// Calculates total hours worked
```

### Status Management

```typescript
// Update Status
await updateStatus({
  employeeId,
  status: "break" | "task" | "working" | "offline",
  reason: string,
  userId,
});
// Updates employee current status
// Logs in statusHistory
// Visible to admins in real-time
```

---

## 📁 Key Files and Their Purpose

### Backend (Convex)

| File                      | Purpose                                       |
| ------------------------- | --------------------------------------------- |
| `convex/schema.ts`        | Database schema definition                    |
| `convex/auth.ts`          | Sign up/Sign in actions (uses Node.js crypto) |
| `convex/users.ts`         | User management (internal queries)            |
| `convex/employees.ts`     | Employee CRUD + status updates                |
| `convex/workingHours.ts`  | Time tracking queries/mutations               |
| `convex/leaves.ts`        | Leave management                              |
| `convex/statusHistory.ts` | Status change tracking                        |
| `convex/activityLog.ts`   | System activity logging                       |

### Frontend (Next.js)

| File/Folder                             | Purpose                                          |
| --------------------------------------- | ------------------------------------------------ |
| `lib/auth-context.tsx`                  | **NEW** - Authentication state management        |
| `components/protected-route.tsx`        | **NEW** - Route protection wrapper               |
| `components/convex-client-provider.tsx` | Convex React client setup                        |
| `app/page.tsx`                          | **UPDATED** - Login/Sign up page (now connected) |
| `app/admin/`                            | Admin dashboard and pages                        |
| `app/employee/`                         | Employee dashboard and pages                     |
| `app/layout.tsx`                        | **UPDATED** - Root layout with AuthProvider      |

---

## 🔐 Authentication System

### How It Works

1. **Sign Up/Sign In** - Uses Convex actions (`auth.ts`)
2. **Session Management** - Stored in localStorage
3. **AuthContext** - Provides user data throughout the app
4. **Protected Routes** - Redirects unauthenticated users
5. **Role-Based Access** - Admin vs Employee dashboards

### AuthContext API

```typescript
const {
  user, // Current user object
  employee, // Employee record (if user is employee)
  isLoading, // Loading state
  signIn, // Sign in function
  signUp, // Sign up function
  signOut, // Sign out function
} = useAuth();
```

---

## 🐛 Troubleshooting

### Error: "Value does not match validator"

**Solution:** ✅ Already fixed! The query now handles optional employeeId.

### Error: "NEXT_PUBLIC_CONVEX_URL is not defined"

**Solution:**

1. Check `.env.local` exists
2. Verify the URL is correct
3. Restart the dev server (`pnpm dev`)

### Error: "User not found" on sign in

**Solution:**

1. Make sure you created an account first
2. Check Convex dashboard to verify user exists
3. Visit: https://dashboard.convex.dev

### Data not updating in real-time

**Solution:**

1. Ensure `pnpm convex dev` is running
2. Check browser console for errors
3. Verify Convex deployment status

---

## 📊 Database Schema

### Tables

- **users** - User accounts (admin/employee)
- **employees** - Employee profiles and current status
- **workingHours** - Daily time tracking
- **leaves** - Leave requests
- **statusHistory** - Status change log
- **activityLog** - System activity audit trail
- **tasks** - Task assignments

---

## 🚀 Next Steps

1. **Test the full flow:**

   - Sign up as admin
   - Create employee records
   - Sign up as employee
   - Test time tracking
   - Test status updates

2. **Customize:**

   - Add more fields to employee profile
   - Create reports and analytics
   - Add email notifications
   - Implement advanced leave policies

3. **Deploy:**
   - Deploy Next.js to Vercel
   - Convex is already hosted
   - Update environment variables in production

---

## 📞 Support

If you encounter issues:

1. Check the Convex dashboard: https://dashboard.convex.dev
2. Review browser console for errors
3. Verify both servers are running (`convex dev` and `next dev`)

---

## ✨ Features Summary

### ✅ Implemented

- User authentication (Sign up/Sign in)
- Role-based access control
- Employee management (Admin)
- Time tracking (Start/End work)
- Real-time status updates
- Activity logging
- Leave request system
- Protected routes
- Responsive UI

### 🎯 Ready to Enhance

- Email notifications
- Report generation
- Advanced analytics
- Export data functionality
- Mobile app integration
- Biometric attendance
- Geolocation tracking

---

**Your application is now fully connected and ready to use! 🎉**
