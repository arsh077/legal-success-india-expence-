import { Expense, User } from '../types';
import { getApiUrl, isProduction } from '../config';
import SyncStorageService from './syncStorage';
import QRSyncService from './qrSync';

/**
 * Smart storage service with QR code sync:
 * - Production: Uses QR codes for visual sync between devices
 * - Local: Uses backend with localStorage backup
 */

const API_URL = getApiUrl();
const IS_PRODUCTION = isProduction();

// Create appropriate service based on environment
const qrSync = new QRSyncService();
const syncService = new SyncStorageService(API_URL, IS_PRODUCTION);

// Make QR sync globally available
(window as any).qrSync = qrSync;

// Mock Data for fallback
const MOCK_EXPENSES: Expense[] = [
  { id: '1', date: '2023-10-25', amount: 1500, reason: 'Office Stationery', timestamp: new Date().toISOString() },
  { id: '2', date: '2023-10-26', amount: 500, reason: 'Client Refreshments', timestamp: new Date().toISOString() },
  { id: '3', date: '2023-10-27', amount: 2000, reason: 'Travel Allowance (Petrol)', timestamp: new Date().toISOString() },
];

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    if (IS_PRODUCTION) {
      // Production: Simple credential check
      if (email === 'arshad@legalsuccessindia.com' && password === 'Khurshid@1997') {
        return { email, name: 'Arshad Khan', token: 'production-token' };
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
        // Production: Use QR sync service
        return qrSync.getExpenses();
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
      if (IS_PRODUCTION) {
        // Production: Use QR sync service
        return qrSync.addExpense(expense);
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
        // Production: Use QR sync service
        qrSync.deleteExpense(id);
      } else {
        // Local: Use sync service
        await syncService.delete(id);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  },

  // Manual sync function
  sync: async (): Promise<void> => {
    try {
      if (IS_PRODUCTION) {
        // Production: Show QR sync modal
        qrSync.showQRSyncModal();
      } else {
        // Local: Use sync service
        await syncService.syncData();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  },

  // Import sync code (for production)
  importSyncCode: (syncCode: string) => {
    if (IS_PRODUCTION) {
      return qrSync.importSyncCode(syncCode);
    }
    return false;
  },

  // Get sync status
  getSyncStatus: () => {
    if (IS_PRODUCTION) {
      return qrSync.getSyncStatus();
    } else {
      return syncService.getSyncStatus();
    }
  }
};