import React, { useState } from 'react';
import { Menu, X, LogOut, LayoutDashboard, PlusCircle, Sun, Moon } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onOpenAddExpense: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onOpenAddExpense, isDarkMode, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo / Branding */}
          <div className="flex items-center space-x-3">
            <img src="/logo.svg" alt="Legal Success India" className="h-10 w-10" />
            <span className="text-xl sm:text-2xl font-bold text-primary dark:text-emerald-400 truncate">
              Legal Success India
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
              Hello, {user.name}
            </span>

            <button 
              onClick={onOpenAddExpense}
              className="flex items-center px-4 py-2 bg-primary hover:bg-emerald-600 text-white rounded-lg transition-transform transform hover:scale-105 shadow-sm"
            >
              <PlusCircle size={18} className="mr-2" />
              Add Expense
            </button>

            <button 
              onClick={onLogout}
              className="flex items-center text-red-500 hover:text-red-700 font-medium transition"
            >
              <LogOut size={18} className="mr-1" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-4">
             <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-primary"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700 animate-slide-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                Signed in as {user.name}
             </div>
             
             <button 
               onClick={() => { onOpenAddExpense(); setIsMenuOpen(false); }}
               className="w-full text-left flex items-center px-3 py-3 text-primary font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
             >
               <PlusCircle size={18} className="mr-3" />
               Add New Expense
             </button>

             <button 
               onClick={onLogout}
               className="w-full text-left flex items-center px-3 py-3 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
             >
               <LogOut size={18} className="mr-3" />
               Logout
             </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;