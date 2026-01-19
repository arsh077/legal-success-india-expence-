import { Expense, User } from '../types';

/**
 * Unified Storage Service with Cross-Device Sync
 * Syncs data between mobile (localStorage) and laptop (backend)
 */

const STORAGE_KEY = 'legal_success_expenses';
const SYNC_KEY = 'legal_success_sync_timestamp';

export class SyncStorageService {
  private apiUrl: string | null;
  private isProduction: boolean;

  constructor(apiUrl: string | null, isProduction: boolean) {
    this.apiUrl = apiUrl;
    this.isProduction = isProduction;
  }

  // Get all expenses with sync
  async getAll(): Promise<Expense[]> {
    try {
      if (this.isProduction || !this.apiUrl) {
        // Production: Use localStorage
        return this.getLocalExpenses();
      } else {
        // Development: Try backend first, fallback to localStorage
        try {
          const response = await fetch(`${this.apiUrl}/expenses`);
          if (response.ok) {
            const backendExpenses = await response.json();
            // Sync with localStorage
            this.saveLocalExpenses(backendExpenses);
            return backendExpenses;
          }
        } catch (error) {
          console.log('Backend not available, using localStorage');
        }
        
        return this.getLocalExpenses();
      }
    } catch (error) {
      console.error('Error getting expenses:', error);
      return this.getLocalExpenses();
    }
  }

  // Add expense with sync
  async add(expense: Omit<Expense, 'id' | 'timestamp'>): Promise<Expense> {
    const newExpense: Expense = {
      ...expense,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    };

    try {
      // Always save to localStorage first
      const localExpenses = this.getLocalExpenses();
      localExpenses.unshift(newExpense);
      this.saveLocalExpenses(localExpenses);

      // Try to sync with backend if available
      if (!this.isProduction && this.apiUrl) {
        try {
          const response = await fetch(`${this.apiUrl}/add-expense`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense),
          });
          
          if (response.ok) {
            console.log('Synced with backend');
          }
        } catch (error) {
          console.log('Backend sync failed, saved locally');
        }
      }

      this.updateSyncTimestamp();
      return newExpense;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  // Delete expense with sync
  async delete(id: string): Promise<void> {
    try {
      // Always delete from localStorage first
      const localExpenses = this.getLocalExpenses();
      const updatedExpenses = localExpenses.filter(e => e.id !== id);
      this.saveLocalExpenses(updatedExpenses);

      // Try to sync with backend if available
      if (!this.isProduction && this.apiUrl) {
        try {
          await fetch(`${this.apiUrl}/expenses/${id}`, { method: 'DELETE' });
          console.log('Deleted from backend');
        } catch (error) {
          console.log('Backend delete failed, deleted locally');
        }
      }

      this.updateSyncTimestamp();
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  // Login with sync
  async login(email: string, password: string): Promise<User> {
    if (!this.isProduction && this.apiUrl) {
      try {
        const response = await fetch(`${this.apiUrl}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        
        if (response.ok) {
          const user = await response.json();
          // Trigger sync after login
          this.syncData();
          return user;
        } else {
          throw new Error('Invalid credentials');
        }
      } catch (error) {
        console.log('Backend login failed, using offline mode');
      }
    }

    // Offline/Production login
    if (email === 'arshad@legalsuccessindia.com' && password === 'Khurshid@1997') {
      return { email, name: 'Arshad Khan', token: 'offline-token' };
    } else {
      throw new Error('Invalid credentials');
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem('user_session');
  }

  // Sync data between devices
  async syncData(): Promise<void> {
    if (this.isProduction || !this.apiUrl) return;

    try {
      // Get backend data
      const response = await fetch(`${this.apiUrl}/expenses`);
      if (response.ok) {
        const backendExpenses = await response.json();
        const localExpenses = this.getLocalExpenses();
        
        // Merge data (backend takes priority for conflicts)
        const mergedExpenses = this.mergeExpenses(localExpenses, backendExpenses);
        this.saveLocalExpenses(mergedExpenses);
        
        console.log('Data synced successfully');
      }
    } catch (error) {
      console.log('Sync failed:', error);
    }
  }

  // Private helper methods
  private getLocalExpenses(): Expense[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return [];
    }
  }

  private saveLocalExpenses(expenses: Expense[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private updateSyncTimestamp(): void {
    localStorage.setItem(SYNC_KEY, new Date().toISOString());
  }

  private mergeExpenses(local: Expense[], backend: Expense[]): Expense[] {
    const merged = new Map();
    
    // Add local expenses
    local.forEach(expense => merged.set(expense.id, expense));
    
    // Add/update with backend expenses (backend takes priority)
    backend.forEach(expense => merged.set(expense.id, expense));
    
    return Array.from(merged.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Get sync status
  getSyncStatus(): { lastSync: string | null, isOnline: boolean } {
    return {
      lastSync: localStorage.getItem(SYNC_KEY),
      isOnline: !this.isProduction && !!this.apiUrl
    };
  }
}

export default SyncStorageService;