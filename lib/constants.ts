export const LEAVE_TYPES = [
  { value: "sick", label: "Sick Leave" },
  { value: "casual", label: "Casual Leave" },
  { value: "personal", label: "Personal Leave" },
  { value: "other", label: "Other" },
] as const

export const EMPLOYEE_STATUS = [
  { value: "working", label: "Working" },
  { value: "break", label: "On Break" },
  { value: "task", label: "On Task" },
  { value: "offline", label: "Offline" },
] as const

export const LEAVE_REQUEST_STATUS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const
