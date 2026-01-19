/**
 * QR Code Sync - Visual sync between devices
 * Uses QR codes for easy mobile-desktop sync
 */

import { Expense } from '../types';

class QRSyncService {
  private readonly STORAGE_KEY = 'legal_success_expenses';
  private readonly SYNC_KEY = 'legal_success_last_sync';

  // Generate QR code for sync
  async generateSyncQR(): Promise<string> {
    const expenses = this.getExpenses();
    const syncData = {
      expenses,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    const jsonData = JSON.stringify(syncData);
    const compressed = btoa(jsonData); // Base64 encode
    
    // Generate QR code using online service
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(compressed)}`;
    
    return qrUrl;
  }

  // Show QR sync modal
  showQRSyncModal(): void {
    this.generateSyncQR().then(qrUrl => {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
      modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full text-center">
          <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">QR Code Sync</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">Scan this QR code with your other device:</p>
          
          <div class="bg-white p-4 rounded-lg mb-4 inline-block">
            <img src="${qrUrl}" alt="Sync QR Code" class="w-48 h-48 mx-auto">
          </div>
          
          <div class="text-xs text-gray-500 dark:text-gray-400 mb-4">
            QR Code contains ${this.getExpenses().length} expenses
          </div>
          
          <div class="flex space-x-2">
            <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">Close</button>
            <button onclick="window.qrSync.showManualSync()" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">Manual Sync</button>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">Or paste sync code:</p>
            <input type="text" placeholder="Paste sync code here..." class="w-full p-2 border rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 mb-2" id="qrSyncInput">
            <button onclick="window.qrSync.importSyncCode(document.getElementById('qrSyncInput').value)" class="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors">Import Data</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    });
  }

  // Show manual sync with text code
  showManualSync(): void {
    const expenses = this.getExpenses();
    const syncData = {
      expenses,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    const jsonData = JSON.stringify(syncData);
    const compressed = btoa(jsonData);
    
    // Close existing modal
    document.querySelector('.fixed.inset-0')?.remove();
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Manual Sync Code</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">Copy this code and paste it on your other device:</p>
        <textarea class="w-full h-32 p-2 border rounded text-xs font-mono bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" readonly>${compressed}</textarea>
        <div class="flex space-x-2 mt-4">
          <button onclick="navigator.clipboard.writeText('${compressed}').then(() => this.innerText='Copied!').catch(() => this.innerText='Copy manually')" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">Copy Code</button>
          <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Import sync code
  importSyncCode(syncCode: string): boolean {
    if (!syncCode.trim()) {
      alert('Please enter a sync code first.');
      return false;
    }

    try {
      const jsonData = atob(syncCode.trim());
      const syncData = JSON.parse(jsonData);
      
      if (syncData.expenses && Array.isArray(syncData.expenses)) {
        // Merge with existing data
        const existingExpenses = this.getExpenses();
        const importedExpenses = syncData.expenses;
        
        const mergedMap = new Map();
        
        // Add existing expenses
        existingExpenses.forEach(exp => mergedMap.set(exp.id, exp));
        
        // Add imported expenses (will overwrite if same ID)
        importedExpenses.forEach(exp => mergedMap.set(exp.id, exp));
        
        // Convert back to array and sort by timestamp
        const mergedExpenses = Array.from(mergedMap.values())
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        this.saveExpenses(mergedExpenses);
        
        // Show success message
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg animate-fade-in z-50';
        toast.innerText = `Successfully imported ${importedExpenses.length} expenses!`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
        
        // Close modal and refresh
        document.querySelector('.fixed.inset-0')?.remove();
        setTimeout(() => window.location.reload(), 1000);
        
        return true;
      }
      
      alert('Invalid sync code format.');
      return false;
    } catch (error) {
      console.error('Import failed:', error);
      alert('Invalid sync code. Please check and try again.');
      return false;
    }
  }

  // Local storage methods
  getExpenses(): Expense[] {
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
        
        this.saveExpenses(sampleExpenses);
        return sampleExpenses;
      }
      
      return expenses;
    } catch (error) {
      console.error('Error reading expenses:', error);
      return [];
    }
  }

  saveExpenses(expenses: Expense[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(expenses));
      localStorage.setItem(this.SYNC_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  }

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

  deleteExpense(id: string): void {
    const expenses = this.getExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    this.saveExpenses(filtered);
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  getSyncStatus() {
    return {
      lastSync: localStorage.getItem(this.SYNC_KEY),
      isOnline: true,
      hasData: this.getExpenses().length > 0
    };
  }
}

export default QRSyncService;