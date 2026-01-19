/**
 * Simple Cloud Sync for Production (No Backend Required)
 * Uses browser localStorage with manual export/import for sync
 */

import { Expense } from '../types';

const STORAGE_KEY = 'legal_success_expenses';
const SYNC_KEY = 'legal_success_last_sync';

export class CloudSyncService {
  
  // Get all expenses from localStorage
  getExpenses(): Expense[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const expenses = stored ? JSON.parse(stored) : [];
      
      // If no expenses, add some sample data
      if (expenses.length === 0) {
        const sampleExpenses: Expense[] = [
          {
            id: this.generateId(),
            date: '2026-01-19',
            amount: 1500,
            reason: 'Office Supplies',
            timestamp: new Date().toISOString()
          },
          {
            id: this.generateId(),
            date: '2026-01-18',
            amount: 2500,
            reason: 'Client Meeting Refreshments',
            timestamp: new Date().toISOString()
          },
          {
            id: this.generateId(),
            date: '2026-01-17',
            amount: 800,
            reason: 'Travel Expenses',
            timestamp: new Date().toISOString()
          }
        ];
        
        this.saveExpenses(sampleExpenses);
        return sampleExpenses;
      }
      
      return expenses;
    } catch (error) {
      console.error('Error reading expenses:', error);
      return [];
    }
  }

  // Save expenses to localStorage
  saveExpenses(expenses: Expense[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
      localStorage.setItem(SYNC_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  }

  // Add new expense
  addExpense(expense: Omit<Expense, 'id' | 'timestamp'>): Expense {
    const newExpense: Expense = {
      ...expense,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    };

    const expenses = this.getExpenses();
    expenses.unshift(newExpense);
    this.saveExpenses(expenses);
    
    return newExpense;
  }

  // Delete expense
  deleteExpense(id: string): void {
    const expenses = this.getExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    this.saveExpenses(filtered);
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Export data for manual sync
  exportData(): string {
    const expenses = this.getExpenses();
    const syncData = {
      expenses,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(syncData, null, 2);
  }

  // Import data for manual sync
  importData(jsonData: string): boolean {
    try {
      const syncData = JSON.parse(jsonData);
      if (syncData.expenses && Array.isArray(syncData.expenses)) {
        // Merge with existing data
        const existingExpenses = this.getExpenses();
        const importedExpenses = syncData.expenses;
        
        // Create a map to avoid duplicates
        const mergedMap = new Map();
        
        // Add existing expenses
        existingExpenses.forEach(exp => mergedMap.set(exp.id, exp));
        
        // Add imported expenses (will overwrite if same ID)
        importedExpenses.forEach(exp => mergedMap.set(exp.id, exp));
        
        // Convert back to array and sort by timestamp
        const mergedExpenses = Array.from(mergedMap.values())
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        this.saveExpenses(mergedExpenses);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Get sync status
  getSyncStatus() {
    const lastSync = localStorage.getItem(SYNC_KEY);
    return {
      lastSync,
      isOnline: false, // Production mode is always "offline" (no backend)
      hasData: this.getExpenses().length > 0
    };
  }

  // Manual sync via copy-paste
  generateSyncCode(): string {
    const data = this.exportData();
    const compressed = btoa(data); // Base64 encode for easy copy-paste
    return compressed;
  }

  // Import from sync code
  importFromSyncCode(syncCode: string): boolean {
    try {
      const data = atob(syncCode); // Base64 decode
      return this.importData(data);
    } catch (error) {
      console.error('Invalid sync code:', error);
      return false;
    }
  }
}

export default CloudSyncService;