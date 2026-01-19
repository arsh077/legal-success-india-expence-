// Expense data structure / Kharcha structure
export interface Expense {
  id: string;
  date: string;
  amount: number;
  reason: string;
  timestamp: string;
}

// User session structure / User info
export interface User {
  email: string;
  name: string;
  token?: string;
}

// Stats interface for dashboard
export interface DashboardStats {
  totalMonthly: number;
  totalCount: number;
}