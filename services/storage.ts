import { Expense, User } from '../types';
import { getApiUrl } from '../config';

/**
 * NOTE: This service connects to the Flask backend API.
 * Automatically detects if running on mobile/desktop and uses appropriate URL.
 */

const API_URL = getApiUrl(); // Automatically uses correct URL for environment
const USE_MOCK = false; // Set to false to use real Flask backend

// Mock Data
const MOCK_EXPENSES: Expense[] = [
  { id: '1', date: '2023-10-25', amount: 1500, reason: 'Office Stationery', timestamp: new Date().toISOString() },
  { id: '2', date: '2023-10-26', amount: 500, reason: 'Client Refreshments', timestamp: new Date().toISOString() },
  { id: '3', date: '2023-10-27', amount: 2000, reason: 'Travel Allowance (Petrol)', timestamp: new Date().toISOString() },
];

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Mock login logic
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email && password) {
            resolve({ email, name: 'Admin User', token: 'mock-jwt-token' });
          } else {
            reject(new Error('Invalid credentials'));
          }
        }, 800);
      });
    }
    
    // Real API Call to Flask
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  logout: () => {
    localStorage.removeItem('user_session');
  }
};

export const expenseService = {
  getAll: async (): Promise<Expense[]> => {
    if (USE_MOCK) {
      const stored = localStorage.getItem('expenses');
      return stored ? JSON.parse(stored) : MOCK_EXPENSES;
    }

    const res = await fetch(`${API_URL}/expenses`);
    return res.json();
  },

  add: async (expense: Omit<Expense, 'id' | 'timestamp'>): Promise<Expense> => {
    const newExpense: Expense = {
      ...expense,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };

    if (USE_MOCK) {
      const current = await expenseService.getAll();
      const updated = [newExpense, ...current];
      localStorage.setItem('expenses', JSON.stringify(updated));
      return new Promise((resolve) => setTimeout(() => resolve(newExpense), 500));
    }

    const res = await fetch(`${API_URL}/add-expense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const current = await expenseService.getAll();
      const updated = current.filter(e => e.id !== id);
      localStorage.setItem('expenses', JSON.stringify(updated));
      return;
    }

    await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
  }
};