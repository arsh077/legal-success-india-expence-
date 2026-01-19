import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import AddExpenseModal from './components/AddExpenseModal';
import Footer from './components/Footer';
import { User } from './types';
import { authService } from './services/storage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger to reload dashboard
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('user_session', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      authService.logout();
      setUser(null);
    }
  };

  const handleExpenseAdded = () => {
    setRefreshTrigger(prev => prev + 1); // Cause Dashboard to re-fetch
    // Toast notification can go here
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-primary text-white px-6 py-3 rounded shadow-lg animate-fade-in z-50';
    toast.innerText = 'Expense added successfully to Sheet!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // If not logged in, show Login page
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col min-h-screen transition-colors bg-gray-50 dark:bg-gray-900">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onOpenAddExpense={() => setIsModalOpen(true)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      
      <div className="flex-grow">
        <Dashboard refreshTrigger={refreshTrigger} />
      </div>

      <Footer />

      <AddExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleExpenseAdded}
      />
      
      {/* Custom Styles for Animations that Tailwind doesn't provide by default */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fadeIn 0.2s ease-out;
        }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
            animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default App;