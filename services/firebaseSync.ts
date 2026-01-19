/**
 * Firebase Firestore Sync - Backend-free real-time sync
 * Uses Firebase free tier for cross-device synchronization
 */

import { Expense } from '../types';

// Firebase configuration (free tier)
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBvOQIFb5eR4FqYjVxGHnKpL8mN2oP3qRs", // Public API key (safe to expose)
  authDomain: "legal-success-expenses.firebaseapp.com",
  projectId: "legal-success-expenses",
  storageBucket: "legal-success-expenses.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345678"
};

class FirebaseSyncService {
  private db: any = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Dynamically import Firebase (CDN)
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
      const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } = 
        await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');

      const app = initializeApp(FIREBASE_CONFIG);
      this.db = getFirestore(app);
      this.initialized = true;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      this.initialized = false;
    }
  }

  async getExpenses(): Promise<Expense[]> {
    if (!this.initialized) {
      return this.getLocalExpenses();
    }

    try {
      const { getDocs, collection } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
      const querySnapshot = await getDocs(collection(this.db, 'expenses'));
      const expenses: Expense[] = [];
      
      querySnapshot.forEach((doc) => {
        expenses.push({ id: doc.id, ...doc.data() } as Expense);
      });

      // Sort by timestamp
      expenses.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Backup to localStorage
      this.saveLocalExpenses(expenses);
      
      return expenses;
    } catch (error) {
      console.error('Firebase read failed, using localStorage:', error);
      return this.getLocalExpenses();
    }
  }

  async addExpense(expense: Omit<Expense, 'id' | 'timestamp'>): Promise<Expense> {
    const newExpense: Expense = {
      ...expense,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    };

    // Always save locally first
    const localExpenses = this.getLocalExpenses();
    localExpenses.unshift(newExpense);
    this.saveLocalExpenses(localExpenses);

    // Try to sync with Firebase
    if (this.initialized) {
      try {
        const { addDoc, collection } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
        await addDoc(collection(this.db, 'expenses'), {
          date: newExpense.date,
          amount: newExpense.amount,
          reason: newExpense.reason,
          timestamp: newExpense.timestamp
        });
        console.log('Expense synced to Firebase');
      } catch (error) {
        console.error('Firebase sync failed:', error);
      }
    }

    return newExpense;
  }

  async deleteExpense(id: string): Promise<void> {
    // Delete locally first
    const localExpenses = this.getLocalExpenses();
    const filtered = localExpenses.filter(e => e.id !== id);
    this.saveLocalExpenses(filtered);

    // Try to delete from Firebase
    if (this.initialized) {
      try {
        const { deleteDoc, doc } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js');
        await deleteDoc(doc(this.db, 'expenses', id));
        console.log('Expense deleted from Firebase');
      } catch (error) {
        console.error('Firebase delete failed:', error);
      }
    }
  }

  // Local storage fallback methods
  private getLocalExpenses(): Expense[] {
    try {
      const stored = localStorage.getItem('legal_success_expenses');
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
      localStorage.setItem('legal_success_expenses', JSON.stringify(expenses));
      localStorage.setItem('legal_success_last_sync', new Date().toISOString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  getSyncStatus() {
    return {
      lastSync: localStorage.getItem('legal_success_last_sync'),
      isOnline: this.initialized,
      hasData: this.getLocalExpenses().length > 0
    };
  }

  async forceSync(): Promise<boolean> {
    try {
      await this.initialize();
      if (this.initialized) {
        // Refresh data from Firebase
        await this.getExpenses();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Force sync failed:', error);
      return false;
    }
  }
}

export default FirebaseSyncService;