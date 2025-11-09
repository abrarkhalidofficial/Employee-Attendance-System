export interface Employee {
  id: string
  name: string
  email: string
  department: string
  position: string
  joinDate: string
  status: "active" | "inactive"
}

export interface TimeLog {
  id: string
  employeeId: string
  date: string
  checkIn: string
  checkOut: string | null
  breakTime: number // in minutes
  totalHours: number
}

export interface LeaveRequest {
  id: string
  employeeId: string
  type: "sick" | "vacation" | "personal" | "unpaid"
  startDate: string
  endDate: string
  reason: string
  status: "pending" | "approved" | "rejected"
  requestDate: string
}

export interface BreakSession {
  id: string
  employeeId: string
  date: string
  startTime: string
  endTime: string | null
  duration: number // in minutes
}

export interface WorkLog {
  id: string
  employeeId: string
  date: string
  taskDescription: string
  timeSpent: number // in minutes
  createdAt: string
}

export interface AdminUser {
  id: string
  email: string
  password: string
  name: string
}

export const mockAdminUser: AdminUser = {
  id: "admin_001",
  email: "admin@gmail.com",
  password: "12345678",
  name: "Administrator",
}

// Mock employees
export const mockEmployees: Employee[] = [
  {
    id: "emp_001",
    name: "Alex Johnson",
    email: "alex.johnson@company.com",
    department: "Engineering",
    position: "Senior Developer",
    joinDate: "2022-03-15",
    status: "active",
  },
  {
    id: "emp_002",
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    department: "Product",
    position: "Product Manager",
    joinDate: "2021-06-20",
    status: "active",
  },
  {
    id: "emp_003",
    name: "Michael Rodriguez",
    email: "michael.r@company.com",
    department: "Sales",
    position: "Sales Director",
    joinDate: "2020-01-10",
    status: "active",
  },
  {
    id: "emp_004",
    name: "Emma Williams",
    email: "emma.williams@company.com",
    department: "Marketing",
    position: "Marketing Specialist",
    joinDate: "2023-02-01",
    status: "active",
  },
  {
    id: "emp_005",
    name: "David Kumar",
    email: "david.kumar@company.com",
    department: "Engineering",
    position: "Junior Developer",
    joinDate: "2023-08-15",
    status: "active",
  },
]

// Mock time logs for today
export const mockTimeLogs: TimeLog[] = [
  {
    id: "log_001",
    employeeId: "emp_001",
    date: new Date().toISOString().split("T")[0],
    checkIn: "09:00",
    checkOut: "17:30",
    breakTime: 60,
    totalHours: 8.5,
  },
  {
    id: "log_002",
    employeeId: "emp_002",
    date: new Date().toISOString().split("T")[0],
    checkIn: "08:45",
    checkOut: null,
    breakTime: 45,
    totalHours: 0,
  },
  {
    id: "log_003",
    employeeId: "emp_003",
    date: new Date().toISOString().split("T")[0],
    checkIn: "09:15",
    checkOut: "18:00",
    breakTime: 60,
    totalHours: 8.75,
  },
]

// Mock leave requests
export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: "leave_001",
    employeeId: "emp_001",
    type: "vacation",
    startDate: "2025-12-20",
    endDate: "2025-12-27",
    reason: "Christmas holiday",
    status: "approved",
    requestDate: "2025-10-01",
  },
  {
    id: "leave_002",
    employeeId: "emp_002",
    type: "sick",
    startDate: "2025-11-10",
    endDate: "2025-11-10",
    reason: "Flu",
    status: "pending",
    requestDate: "2025-11-09",
  },
  {
    id: "leave_003",
    employeeId: "emp_003",
    type: "personal",
    startDate: "2025-11-15",
    endDate: "2025-11-15",
    reason: "Personal appointment",
    status: "approved",
    requestDate: "2025-10-20",
  },
]

// Mock break sessions
export const mockBreakSessions: BreakSession[] = [
  {
    id: "break_001",
    employeeId: "emp_001",
    date: new Date().toISOString().split("T")[0],
    startTime: "12:00",
    endTime: "13:00",
    duration: 60,
  },
  {
    id: "break_002",
    employeeId: "emp_002",
    date: new Date().toISOString().split("T")[0],
    startTime: "12:30",
    endTime: null,
    duration: 0,
  },
]

// Mock work logs
export const mockWorkLogs: WorkLog[] = [
  {
    id: "work_001",
    employeeId: "emp_001",
    date: new Date().toISOString().split("T")[0],
    taskDescription: "Completed backend API implementation for user authentication",
    timeSpent: 120,
    createdAt: "09:30",
  },
  {
    id: "work_002",
    employeeId: "emp_001",
    date: new Date().toISOString().split("T")[0],
    taskDescription: "Code review for team members PR requests",
    timeSpent: 90,
    createdAt: "11:45",
  },
  {
    id: "work_003",
    employeeId: "emp_001",
    date: new Date().toISOString().split("T")[0],
    taskDescription: "Fixed critical bug in payment module",
    timeSpent: 45,
    createdAt: "14:00",
  },
  {
    id: "work_004",
    employeeId: "emp_001",
    date: new Date().toISOString().split("T")[0],
    taskDescription: "Team standup and planning for next sprint",
    timeSpent: 60,
    createdAt: "16:00",
  },
  {
    id: "work_005",
    employeeId: "emp_002",
    date: new Date().toISOString().split("T")[0],
    taskDescription: "Product roadmap planning for Q1 2025",
    timeSpent: 150,
    createdAt: "10:00",
  },
  {
    id: "work_006",
    employeeId: "emp_002",
    date: new Date().toISOString().split("T")[0],
    taskDescription: "Reviewed feature requirements from stakeholders",
    timeSpent: 90,
    createdAt: "14:30",
  },
  {
    id: "work_007",
    employeeId: "emp_003",
    date: new Date().toISOString().split("T")[0],
    taskDescription: "Client meeting - Q4 sales strategy discussion",
    timeSpent: 120,
    createdAt: "09:00",
  },
  {
    id: "work_008",
    employeeId: "emp_003",
    date: new Date().toISOString().split("T")[0],
    taskDescription: "Updated sales pipeline and pipeline review",
    timeSpent: 75,
    createdAt: "13:00",
  },
  {
    id: "work_009",
    employeeId: "emp_004",
    date: new Date().toISOString().split("T")[0],
    taskDescription: "Created marketing campaign assets for new product launch",
    timeSpent: 180,
    createdAt: "09:30",
  },
  {
    id: "work_010",
    employeeId: "emp_005",
    date: new Date().toISOString().split("T")[0],
    taskDescription: "Database optimization for search queries",
    timeSpent: 120,
    createdAt: "10:15",
  },
  {
    id: "work_011",
    employeeId: "emp_005",
    date: new Date().toISOString().split("T")[0],
    taskDescription: "Helped senior dev with API integration",
    timeSpent: 90,
    createdAt: "14:00",
  },
]
