import { Expense, User } from '../types';
import { getApiUrl, isProduction } from '../config';
import SyncStorageService from './syncStorage';

/**
 * Smart storage service with cross-device sync:
 * - Mobile (Production): Uses localStorage with sync capability
 * - Laptop (Local): Uses backend with localStorage backup
 * - Auto-sync between devices when possible
 */

const API_URL = getApiUrl();
const IS_PRODUCTION = isProduction();

// Create unified sync service
const syncService = new SyncStorageService(API_URL, IS_PRODUCTION);

// Mock Data for fallback
const MOCK_EXPENSES: Expense[] = [
  { id: '1', date: '2023-10-25', amount: 1500, reason: 'Office Stationery', timestamp: new Date().toISOString() },
  { id: '2', date: '2023-10-26', amount: 500, reason: 'Client Refreshments', timestamp: new Date().toISOString() },
  { id: '3', date: '2023-10-27', amount: 2000, reason: 'Travel Allowance (Petrol)', timestamp: new Date().toISOString() },
];

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    return syncService.login(email, password);
  },

  logout: () => {
    syncService.logout();
  }
};

export const expenseService = {
  getAll: async (): Promise<Expense[]> => {
    try {
      return await syncService.getAll();
    } catch (error) {
      console.error('Error getting expenses:', error);
      return MOCK_EXPENSES;
    }
  },

  add: async (expense: Omit<Expense, 'id' | 'timestamp'>): Promise<Expense> => {
    try {
      return await syncService.add(expense);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await syncService.delete(id);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  },

  // Manual sync function
  sync: async (): Promise<void> => {
    try {
      await syncService.syncData();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  },

  // Get sync status
  getSyncStatus: () => {
    return syncService.getSyncStatus();
  }
};