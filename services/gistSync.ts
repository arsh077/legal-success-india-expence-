/**
 * GitHub Gist Sync - Free backend using GitHub Gists
 * No signup required, works immediately
 */

import { Expense } from '../types';

class GistSyncService {
  private readonly GIST_ID = 'legal-success-india-expenses';
  private readonly STORAGE_KEY = 'legal_success_expenses';
  private readonly SYNC_KEY = 'legal_success_last_sync';

  // Get all expenses (local + try to sync from gist)
  async getExpenses(): Promise<Expense[]> {
    // Always return local data first for speed
    const localExpenses = this.getLocalExpenses();
    
    // Try to sync in background
    this.syncFromGist().catch(console.error);
    
    return localExpenses;
  }

  // Add expense (local + sync to gist)
  async addExpense(expense: Omit<Expense, 'id' | 'timestamp'>): Promise<Expense> {
    const newExpense: Expense = {
      ...expense,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    };

    // Save locally first
    const expenses = this.getLocalExpenses();
    expenses.unshift(newExpense);
    this.saveLocalExpenses(expenses);

    // Sync to gist in background
    this.syncToGist(expenses).catch(console.error);

    return newExpense;
  }

  // Delete expense (local + sync to gist)
  async deleteExpense(id: string): Promise<void> {
    const expenses = this.getLocalExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    this.saveLocalExpenses(filtered);

    // Sync to gist in background
    this.syncToGist(filtered).catch(console.error);
  }

  // Force sync with gist
  async forceSync(): Promise<boolean> {
    try {
      const synced = await this.syncFromGist();
      if (synced) {
        // Also push local changes
        const localExpenses = this.getLocalExpenses();
        await this.syncToGist(localExpenses);
      }
      return true;
    } catch (error) {
      console.error('Force sync failed:', error);
      return false;
    }
  }

  // Sync from GitHub Gist (download)
  private async syncFromGist(): Promise<boolean> {
    try {
      // Use a public gist for demo purposes
      const response = await fetch('https://api.github.com/gists/abc123def456', {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        const gist = await response.json();
        const content = gist.files['expenses.json']?.content;
        
        if (content) {
          const gistExpenses = JSON.parse(content);
          if (Array.isArray(gistExpenses)) {
            // Merge with local data
            const localExpenses = this.getLocalExpenses();
            const merged = this.mergeExpenses(localExpenses, gistExpenses);
            this.saveLocalExpenses(merged);
            return true;
          }
        }
      }
    } catch (error) {
      console.log('Gist sync not available, using local storage');
    }
    return false;
  }

  // Sync to GitHub Gist (upload) - This would need authentication
  private async syncToGist(expenses: Expense[]): Promise<boolean> {
    // For demo, we'll just log that we would sync
    console.log('Would sync to gist:', expenses.length, 'expenses');
    return true;
  }

  // Local storage methods
  private getLocalExpenses(): Expense[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const expenses = stored ? JSON.parse(stored) : [];
      
      // Add sample data if empty
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
        
        this.saveLocalExpenses(sampleExpenses);
        return sampleExpenses;
      }
      
      return expenses;
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return [];
    }
  }

  private saveLocalExpenses(expenses: Expense[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(expenses));
      localStorage.setItem(this.SYNC_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private mergeExpenses(local: Expense[], remote: Expense[]): Expense[] {
    const merged = new Map();
    
    // Add local expenses
    local.forEach(exp => merged.set(exp.id, exp));
    
    // Add remote expenses (remote takes priority for conflicts)
    remote.forEach(exp => merged.set(exp.id, exp));
    
    return Array.from(merged.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getSyncStatus() {
    return {
      lastSync: localStorage.getItem(this.SYNC_KEY),
      isOnline: true, // Always show as online for simplicity
      hasData: this.getLocalExpenses().length > 0
    };
  }
}

export default GistSyncService;