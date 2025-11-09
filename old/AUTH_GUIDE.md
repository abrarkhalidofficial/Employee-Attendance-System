# Authentication System Documentation

## Overview

The Employee Attendance System uses a cookie-based authentication system with role-based access control (RBAC). Users can have one of two roles: **Admin** or **Employee**.

## Authentication Flow

### 1. Sign Up

- Users register with email, name, password, and role selection
- Backend creates user in Convex database with hashed password
- Role is stored as `ADMIN` or `EMPLOYEE` in the database
- After successful signup, user is automatically signed in

### 2. Sign In

- Users provide email and password
- Backend validates credentials against Convex database
- On success, user data is stored in cookies (expires in 7 days)
- Frontend maps backend role (`ADMIN`/`EMPLOYEE`) to frontend role (`admin`/`employee`)
- User is automatically redirected to appropriate dashboard

### 3. Protected Routes

- All dashboard routes are protected using the `ProtectedRoute` component
- Unauthenticated users are redirected to the login page
- Users with wrong roles are redirected to their appropriate dashboard

### 4. Logout

- Clicking logout button clears auth cookies and user state
- User is redirected to login page

## Cookie Management

### Implementation

Authentication data is stored in browser cookies using custom utility functions (`lib/cookies.ts`):

```typescript
cookieUtils.set("currentUser", userData, 7); // Set cookie for 7 days
cookieUtils.get("currentUser"); // Retrieve user data
cookieUtils.remove("currentUser"); // Clear on logout
```

### Cookie Structure

```json
{
  "_id": "user_convex_id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "admin" | "employee",
  "isActive": true
}
```

## Role-Based Access Control

### Roles

- **Admin**: Full access to admin panel, employee management, leave approvals
- **Employee**: Access to personal dashboard, time tracking, leave requests

### Route Protection

```typescript
// Admin routes
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>

// Employee routes
<ProtectedRoute requiredRole="employee">
  <EmployeeDashboard />
</ProtectedRoute>
```

### Role Mapping

- **Backend** (Convex): Stores roles as `ADMIN` or `EMPLOYEE`
- **Frontend**: Maps to `admin` or `employee` for consistency
- Mapping occurs in `auth-context.tsx` when user data is received

## Auto-Redirect Logic

### Main Page (Login)

- Checks if user is already authenticated
- If authenticated, redirects to:
  - `/admin/dashboard` for admin users
  - `/employee/dashboard` for employee users

### Protected Routes

- Checks authentication status
- Validates role requirements
- Redirects to login if not authenticated
- Redirects to correct dashboard if wrong role

## Components

### AuthContext (`lib/auth-context.tsx`)

Provides authentication state and methods throughout the app:

- `user`: Current user data or null
- `employee`: Employee-specific data (for employee role)
- `isLoading`: Loading state
- `signIn(email, password)`: Sign in method
- `signUp(email, name, password, role)`: Sign up method
- `signOut()`: Logout method

### ProtectedRoute (`components/protected-route.tsx`)

Wrapper component for protected pages:

- Shows loading spinner while checking auth
- Redirects unauthorized users
- Enforces role requirements

### ResponsiveSidebar (`components/responsive-sidebar.tsx`)

Navigation sidebar with:

- User profile display (avatar, name, role)
- Logout button in dropdown menu
- Mobile-responsive hamburger menu

### DashboardHeader (`components/dashboard-header.tsx`)

Header component for dashboard pages:

- Page title and subtitle
- User role badge
- Notification bell icon

## Backend Functions

### Sign Up (`convex/authSimple.ts::signUpMutation`)

```typescript
signUpMutation({ email, name, password, role });
```

- Validates email uniqueness
- Hashes password (simple hash for development)
- Creates user with role as `ADMIN` or `EMPLOYEE`

### Sign In (`convex/authSimple.ts::signInQuery`)

```typescript
signInQuery({ email, password });
```

- Validates credentials
- Returns user data with `ADMIN`/`EMPLOYEE` role
- Frontend maps role to lowercase

## Security Notes

⚠️ **Development Mode**: The current implementation uses a simple hash function for passwords. In production, you should:

1. Use proper password hashing (bcrypt, argon2)
2. Add CSRF protection
3. Implement rate limiting
4. Add secure cookie flags (HttpOnly, Secure, SameSite=Strict)
5. Add refresh token mechanism

## Usage Examples

### Accessing Auth in Components

```typescript
import { useAuth } from "@/lib/auth-context";

function MyComponent() {
  const { user, signOut } = useAuth();

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

### Creating Protected Pages

```typescript
import { ProtectedRoute } from "@/components/protected-route";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Admin Content</div>
    </ProtectedRoute>
  );
}
```

## Testing Authentication

### Create Test Users

1. Go to `/` (login page)
2. Click "Sign Up" tab
3. Fill in details:
   - Email: `admin@test.com`
   - Name: `Admin User`
   - Password: `admin123`
   - Role: `Admin`
4. Repeat for employee user

### Test Flow

1. Sign up as admin → should redirect to `/admin/dashboard`
2. Logout → should redirect to `/`
3. Try accessing `/employee/dashboard` as admin → should redirect to `/admin/dashboard`
4. Sign in as employee → should redirect to `/employee/dashboard`

## Troubleshooting

### User Not Redirecting After Login

- Check browser console for errors
- Verify cookie is being set (DevTools → Application → Cookies)
- Ensure Convex is running (`npx convex dev`)

### Role-Based Redirect Not Working

- Check role mapping in `auth-context.tsx`
- Verify backend returns `ADMIN` or `EMPLOYEE`
- Check `ProtectedRoute` component logic

### Cookie Not Persisting

- Verify cookie utils are working
- Check browser cookie settings
- Ensure domain/path are correct in cookie options
