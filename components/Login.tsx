import React, { useState } from 'react';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { authService } from '../services/storage';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Login attempt:', { email, password: '***' });

    try {
      const user = await authService.login(email, password);
      console.log('Login successful:', user);
      onLogin(user);
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500); // Reset shake class
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
            {/* Legal Success India Logo */}
            <div className="mx-auto h-20 w-20 mb-4 flex items-center justify-center">
               <img src="/logo.svg" alt="Legal Success India" className="h-full w-full" />
            </div>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
            Legal Success India
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Internal Expense Tracking System
            </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100 dark:border-gray-700 ${shake ? 'animate-shake' : ''}`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="arshad@legalsuccessindia.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
              >
                {loading ? 'Verifying...' : (
                    <>
                    Sign in <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                )}
              </button>
            </div>
            
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Login Credentials</span>
                    </div>
                </div>
                <div className="mt-2 text-center text-xs text-gray-500">
                    <div>Email: arshad@legalsuccessindia.com</div>
                    <div>Password: Khurshid@1997</div>
                </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;