import React, { useEffect, useState } from 'react';
import { Expense } from '../types';
import { expenseService } from '../services/storage';
import { Trash2, TrendingUp, Calendar, AlertCircle, PieChart, Download, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import DownloadModal from './DownloadModal';

interface DashboardProps {
  refreshTrigger: number; // Used to reload data when expense is added
}

const Dashboard: React.FC<DashboardProps> = ({ refreshTrigger }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{lastSync: string | null, isOnline: boolean}>({
    lastSync: null,
    isOnline: false
  });

  // Load Data / Data load karein
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await expenseService.getAll();
        // Sort by date descending
        const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setExpenses(sorted);
        
        // Update sync status
        setSyncStatus(expenseService.getSyncStatus());
      } catch (error) {
        console.error("Failed to fetch expenses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      await expenseService.delete(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      
      // Update sync status after delete
      setSyncStatus(expenseService.getSyncStatus());
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await expenseService.sync();
      // Refresh data after sync
      const data = await expenseService.getAll();
      const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setExpenses(sorted);
      setSyncStatus(expenseService.getSyncStatus());
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg animate-fade-in z-50';
      toast.innerText = 'Data synced successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      console.error('Sync failed:', error);
      // Show error message
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded shadow-lg animate-fade-in z-50';
      toast.innerText = 'Sync failed. Please try again.';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } finally {
      setSyncing(false);
    }
  };

  // Calculate Stats
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate Monthly Totals
  const monthlyTotals = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    acc[key] = (acc[key] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Convert monthly totals to array for Chart and Display
  const monthlyData = Object.entries(monthlyTotals).map(([name, amount]) => ({ name, amount }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Welcome & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Total Expense Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-primary transform transition hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses (All Time)</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                ₹{totalExpense.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <TrendingUp className="text-primary" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Updated just now</p>
        </div>

        {/* Recent Activity Count */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-secondary transform transition hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transactions</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {expenses.length}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Calendar className="text-secondary" size={24} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-gray-400">Recorded in system</p>
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </button>
          </div>
        </div>

        {/* Monthly Summary List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 overflow-hidden transform transition hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white">Monthly Summary</h4>
            <div className="flex items-center space-x-2">
              <PieChart className="text-purple-500" size={20} />
              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="flex items-center px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-lg transition-colors"
              >
                <Download className="h-3 w-3 mr-1" />
                Reports
              </button>
            </div>
          </div>
          <div className="space-y-3 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {monthlyData.length > 0 ? (
              monthlyData.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">{item.name}</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{item.amount.toLocaleString('en-IN')}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">No data available yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Expenses</h3>
              <div className="flex items-center space-x-2">
                {syncStatus.isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" title="Online" />
                ) : (
                  <WifiOff className="h-4 w-4 text-gray-400" title="Offline" />
                )}
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center px-2 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-xs rounded transition-colors"
                  title="Sync data between devices"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync'}
                </button>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Latest 10</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {expenses.length === 0 ? (
                   <tr>
                     <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                       <div className="flex flex-col items-center">
                         <AlertCircle className="mb-2 opacity-50" />
                         No expenses found. Add one!
                       </div>
                     </td>
                   </tr>
                ) : (
                  expenses.slice(0, 10).map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 font-medium">
                        {expense.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900 dark:text-white">
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button 
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-all"
                          title="Delete Expense"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col">
           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Monthly Trends</h3>
           <div className="flex-1 min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={monthlyData.slice(0, 6).reverse()}>
                  <XAxis dataKey="name" tick={{fontSize: 10}} stroke="#9CA3AF" interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{fontSize: 12}} stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', color: '#fff', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#10B981' }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10B981' : '#3B82F6'} />
                    ))}
                  </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

      </div>

      {/* Sync Status Footer */}
      {syncStatus.lastSync && (
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last synced: {new Date(syncStatus.lastSync).toLocaleString()} 
            {syncStatus.isOnline ? (
              <span className="ml-2 text-green-500">• Online</span>
            ) : (
              <span className="ml-2 text-gray-400">• Offline</span>
            )}
          </p>
        </div>
      )}

      {/* Download Modal */}
      <DownloadModal 
        isOpen={isDownloadModalOpen} 
        onClose={() => setIsDownloadModalOpen(false)} 
      />
    </main>
  );
};

export default Dashboard;