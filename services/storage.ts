import { Expense, User } from '../types';
import { getApiUrl, isProduction } from '../config';
import SyncStorageService from './syncStorage';

/**
 * Simple storage service with manual sync:
 * - Production: Uses localStorage with manual sync via export/import
 * - Local: Uses backend with localStorage backup
 */

const API_URL = getApiUrl();
const IS_PRODUCTION = isProduction();

// Create sync service for local development
const syncService = new SyncStorageService(API_URL, IS_PRODUCTION);

// Mock Data for fallback
const MOCK_EXPENSES: Expense[] = [
  { id: '1', date: '2026-01-19', amount: 1500, reason: 'Office Stationery', timestamp: new Date().toISOString() },
  { id: '2', date: '2026-01-18', amount: 500, reason: 'Client Refreshments', timestamp: new Date().toISOString() },
  { id: '3', date: '2026-01-17', amount: 2000, reason: 'Travel Allowance (Petrol)', timestamp: new Date().toISOString() },
];

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    if (IS_PRODUCTION) {
      // Production: Simple credential check
      if (email === 'arshad@legalsuccessindia.com' && password === 'Khurshid@1997') {
        console.log('Production login successful');
        return { email, name: 'Arshad Khan', token: 'production-token-' + Date.now() };
      } else {
        throw new Error('Invalid credentials');
      }
    } else {
      // Local: Use sync service
      return syncService.login(email, password);
    }
  },

  logout: () => {
    localStorage.removeItem('user_session');
  }
};

export const expenseService = {
  getAll: async (): Promise<Expense[]> => {
    try {
      if (IS_PRODUCTION) {
        // Production: Use localStorage only
        return getLocalExpenses();
      } else {
        // Local: Use sync service
        return await syncService.getAll();
      }
    } catch (error) {
      console.error('Error getting expenses:', error);
      return MOCK_EXPENSES;
    }
  },

  add: async (expense: Omit<Expense, 'id' | 'timestamp'>): Promise<Expense> => {
    try {
      const newExpense: Expense = {
        ...expense,
        id: generateId(),
        timestamp: new Date().toISOString()
      };

      if (IS_PRODUCTION) {
        // Production: Save to localStorage
        const expenses = getLocalExpenses();
        expenses.unshift(newExpense);
        saveLocalExpenses(expenses);
        return newExpense;
      } else {
        // Local: Use sync service
        return await syncService.add(expense);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      if (IS_PRODUCTION) {
        // Production: Delete from localStorage
        const expenses = getLocalExpenses();
        const filtered = expenses.filter(e => e.id !== id);
        saveLocalExpenses(filtered);
      } else {
        // Local: Use sync service
        await syncService.delete(id);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  },

  // Manual sync functions
  exportData: (): string => {
    const expenses = getLocalExpenses();
    const syncData = {
      expenses,
      exportedAt: new Date().toISOString(),
      deviceInfo: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
    };
    return JSON.stringify(syncData, null, 2);
  },

  importData: (syncCode: string): boolean => {
    try {
      const syncData = JSON.parse(syncCode);
      if (syncData.expenses && Array.isArray(syncData.expenses)) {
        // Merge with existing data (avoid duplicates)
        const existingExpenses = getLocalExpenses();
        const newExpenses = syncData.expenses.filter((newExp: Expense) => 
          !existingExpenses.some(existing => existing.id === newExp.id)
        );
        
        const mergedExpenses = [...existingExpenses, ...newExpenses];
        saveLocalExpenses(mergedExpenses);
        
        // Update sync status
        localStorage.setItem('legal_success_last_sync', new Date().toISOString());
        localStorage.setItem('legal_success_sync_source', syncData.deviceInfo || 'Unknown');
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  },

  // Get sync status
  getSyncStatus: () => {
    return {
      lastSync: localStorage.getItem('legal_success_last_sync'),
      isOnline: !IS_PRODUCTION, // Only local has "online" backend
      hasData: getLocalExpenses().length > 0,
      syncSource: localStorage.getItem('legal_success_sync_source')
    };
  }
};

// Helper functions
function getLocalExpenses(): Expense[] {
  try {
    const stored = localStorage.getItem('legal_success_expenses');
    const expenses = stored ? JSON.parse(stored) : [];
    
    // Add sample data if empty
    if (expenses.length === 0) {
      saveLocalExpenses(MOCK_EXPENSES);
      return MOCK_EXPENSES;
    }
    
    return expenses;
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return MOCK_EXPENSES;
  }
}

function saveLocalExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem('legal_success_expenses', JSON.stringify(expenses));
    localStorage.setItem('legal_success_last_update', new Date().toISOString());
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}