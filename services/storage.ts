import { Expense, User } from '../types';
import { getApiUrl, isProduction } from '../config';
import SyncStorageService from './syncStorage';
import CloudSyncService from './cloudSync';

/**
 * Smart storage service with cross-device sync:
 * - Production: Uses simple localStorage with manual sync
 * - Local: Uses backend with localStorage backup
 */

const API_URL = getApiUrl();
const IS_PRODUCTION = isProduction();

// Create appropriate service based on environment
const cloudSync = new CloudSyncService();
const syncService = new SyncStorageService(API_URL, IS_PRODUCTION);

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
        // Production: Use cloud sync service
        return cloudSync.getExpenses();
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
        // Production: Use cloud sync service
        return cloudSync.addExpense(expense);
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
        // Production: Use cloud sync service
        cloudSync.deleteExpense(id);
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
        // Production: Generate sync code for manual sharing
        const syncCode = cloudSync.generateSyncCode();
        
        // Show sync code to user
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 class="text-lg font-bold mb-4">Manual Sync Code</h3>
            <p class="text-sm text-gray-600 mb-4">Copy this code and paste it on your other device:</p>
            <textarea class="w-full h-32 p-2 border rounded text-xs font-mono" readonly>${syncCode}</textarea>
            <div class="flex space-x-2 mt-4">
              <button onclick="navigator.clipboard.writeText('${syncCode}'); this.innerText='Copied!'" class="flex-1 bg-blue-500 text-white px-4 py-2 rounded">Copy Code</button>
              <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white px-4 py-2 rounded">Close</button>
            </div>
            <div class="mt-4 pt-4 border-t">
              <p class="text-sm text-gray-600 mb-2">Or paste sync code from another device:</p>
              <input type="text" placeholder="Paste sync code here..." class="w-full p-2 border rounded text-xs" id="syncCodeInput">
              <button onclick="expenseService.importSyncCode(document.getElementById('syncCodeInput').value)" class="w-full mt-2 bg-green-500 text-white px-4 py-2 rounded">Import Data</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
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
    if (IS_PRODUCTION && syncCode.trim()) {
      const success = cloudSync.importFromSyncCode(syncCode.trim());
      if (success) {
        // Refresh page to show new data
        window.location.reload();
      } else {
        alert('Invalid sync code. Please check and try again.');
      }
    }
  },

  // Get sync status
  getSyncStatus: () => {
    if (IS_PRODUCTION) {
      return cloudSync.getSyncStatus();
    } else {
      return syncService.getSyncStatus();
    }
  }
};