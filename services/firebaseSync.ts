/**
 * Firebase Firestore Sync - Real-time cross-device sync
 * Uses Firebase free tier for seamless mobile-laptop synchronization
 */

import { Expense } from '../types';

// Firebase configuration - Update with your actual project details
const FIREBASE_CONFIG = {
  apiKey: "your-api-key", // Get from Firebase Project Settings
  authDomain: "expense-project-id.firebaseapp.com", // Replace with your project ID
  projectId: "expense", // Your actual project ID
  storageBucket: "expense-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

class FirebaseSyncService {
  private db: any = null;
  private auth: any = null;
  private initialized = false;
  private user: any = null;

  async initialize() {
    if (this.initialized) return;

    try {
      // Import Firebase modules
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, query, orderBy } = 
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const { getAuth, signInWithEmailAndPassword, onAuthStateChanged } = 
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

      const app = initializeApp(FIREBASE_CONFIG);
      this.db = getFirestore(app);
      this.auth = getAuth(app);
      
      // Check if user is already logged in
      return new Promise((resolve) => {
        onAuthStateChanged(this.auth, (user) => {
          this.user = user;
          this.initialized = true;
          console.log('Firebase initialized successfully', user ? 'with user' : 'without user');
          resolve(true);
        });
      });
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      this.initialized = false;
      return false;
    }
  }

  async login(email: string, password: string) {
    await this.initialize();
    
    try {
      const { signInWithEmailAndPassword } = 
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
      
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.user = userCredential.user;
      console.log('Firebase login successful');
      return {
        email: this.user.email,
        name: 'Arshad Khan',
        token: await this.user.getIdToken()
      };
    } catch (error) {
      console.error('Firebase login failed:', error);
      throw new Error('Invalid credentials or network error');
    }
  }

  async getExpenses(): Promise<Expense[]> {
    if (!this.initialized || !this.user) {
      return this.getLocalExpenses();
    }

    try {
      const { getDocs, collection, query, orderBy } = 
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      
      const q = query(collection(this.db, 'expenses'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const expenses: Expense[] = [];
      
      querySnapshot.forEach((doc) => {
        expenses.push({ id: doc.id, ...doc.data() } as Expense);
      });

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

    // Try to sync with Firebase if logged in
    if (this.initialized && this.user) {
      try {
        const { addDoc, collection } = 
          await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const docRef = await addDoc(collection(this.db, 'expenses'), {
          date: newExpense.date,
          amount: newExpense.amount,
          reason: newExpense.reason,
          timestamp: newExpense.timestamp,
          userId: this.user.uid
        });
        
        // Update local expense with Firebase ID
        newExpense.id = docRef.id;
        const updatedExpenses = localExpenses.map(e => 
          e.timestamp === newExpense.timestamp ? newExpense : e
        );
        this.saveLocalExpenses(updatedExpenses);
        
        console.log('Expense synced to Firebase with ID:', docRef.id);
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

    // Try to delete from Firebase if logged in
    if (this.initialized && this.user) {
      try {
        const { deleteDoc, doc } = 
          await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        await deleteDoc(doc(this.db, 'expenses', id));
        console.log('Expense deleted from Firebase');
      } catch (error) {
        console.error('Firebase delete failed:', error);
      }
    }
  }

  // Real-time listener for expenses
  async setupRealtimeListener(callback: (expenses: Expense[]) => void) {
    if (!this.initialized || !this.user) return;

    try {
      const { collection, onSnapshot, query, orderBy } = 
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      
      const q = query(collection(this.db, 'expenses'), orderBy('timestamp', 'desc'));
      
      return onSnapshot(q, (snapshot) => {
        const expenses: Expense[] = [];
        snapshot.forEach((doc) => {
          expenses.push({ id: doc.id, ...doc.data() } as Expense);
        });
        
        // Update localStorage backup
        this.saveLocalExpenses(expenses);
        callback(expenses);
      });
    } catch (error) {
      console.error('Failed to setup realtime listener:', error);
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
      isOnline: this.initialized && !!this.user,
      hasData: this.getLocalExpenses().length > 0,
      user: this.user?.email || null
    };
  }

  async forceSync(): Promise<boolean> {
    try {
      if (this.initialized && this.user) {
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

  logout() {
    if (this.auth) {
      this.auth.signOut();
    }
    this.user = null;
  }
}

export default FirebaseSyncService;