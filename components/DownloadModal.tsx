import React, { useState, useEffect } from 'react';
import { X, Download, Calendar, FileText, TrendingUp } from 'lucide-react';
import { getApiUrl, isProduction } from '../config';
import { expenseService } from '../services/storage';

interface MonthData {
  key: string;
  name: string;
  year: number;
  month: number;
  count: number;
  total: number;
}

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const [months, setMonths] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  
  const API_URL = getApiUrl();
  const IS_PRODUCTION = isProduction();

  useEffect(() => {
    if (isOpen) {
      fetchAvailableMonths();
    }
  }, [isOpen]);

  const fetchAvailableMonths = async () => {
    setLoading(true);
    try {
      if (IS_PRODUCTION || !API_URL) {
        // Production mode: Generate months from localStorage data
        const expenses = await expenseService.getAll();
        const monthsMap = new Map();
        
        expenses.forEach(expense => {
          const date = new Date(expense.date);
          const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          const name = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          
          if (!monthsMap.has(key)) {
            monthsMap.set(key, {
              key,
              name,
              year: date.getFullYear(),
              month: date.getMonth() + 1,
              count: 0,
              total: 0
            });
          }
          
          const monthData = monthsMap.get(key);
          monthData.count++;
          monthData.total += expense.amount;
        });
        
        const monthsArray = Array.from(monthsMap.values())
          .sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month));
        
        setMonths(monthsArray);
      } else {
        // Local development: Use API
        const response = await fetch(`${API_URL}/months`);
        if (response.ok) {
          const data = await response.json();
          setMonths(data);
        }
      }
    } catch (error) {
      console.error('Error fetching months:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadAllExpenses = async () => {
    setDownloading('all');
    try {
      if (IS_PRODUCTION || !API_URL) {
        // Production mode: Generate CSV from localStorage
        const expenses = await expenseService.getAll();
        const csvContent = generateCSV(expenses, 'All Expenses');
        downloadCSV(csvContent, `Legal_Success_India_All_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        // Local development: Use API
        const response = await fetch(`${API_URL}/download/all`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Legal_Success_India_All_Expenses_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
      
      showSuccessMessage('All expenses downloaded successfully!');
    } catch (error) {
      console.error('Error downloading all expenses:', error);
      showErrorMessage('Failed to download expenses');
    } finally {
      setDownloading(null);
    }
  };

  const downloadMonthlyExpenses = async (year: number, month: number, monthName: string) => {
    const key = `${year}-${month}`;
    setDownloading(key);
    try {
      if (IS_PRODUCTION || !API_URL) {
        // Production mode: Generate CSV from localStorage
        const allExpenses = await expenseService.getAll();
        const monthlyExpenses = allExpenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getFullYear() === year && expenseDate.getMonth() + 1 === month;
        });
        
        const csvContent = generateMonthlyCSV(monthlyExpenses, monthName);
        downloadCSV(csvContent, `Legal_Success_India_${monthName.replace(' ', '_')}_Expenses.csv`);
      } else {
        // Local development: Use API
        const response = await fetch(`${API_URL}/download/monthly/${year}/${month}`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Legal_Success_India_${monthName.replace(' ', '_')}_Expenses.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
      
      showSuccessMessage(`${monthName} expenses downloaded successfully!`);
    } catch (error) {
      console.error('Error downloading monthly expenses:', error);
      showErrorMessage('Failed to download monthly expenses');
    } finally {
      setDownloading(null);
    }
  };

  // Helper functions for CSV generation in production
  const generateCSV = (expenses: any[], title: string) => {
    const headers = ['Date', 'Amount (₹)', 'Reason', 'Timestamp'];
    const rows = expenses.map(expense => [
      expense.date,
      expense.amount,
      expense.reason,
      expense.timestamp
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateMonthlyCSV = (expenses: any[], monthName: string) => {
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avgAmount = expenses.length > 0 ? totalAmount / expenses.length : 0;
    
    const lines = [
      `Legal Success India - Monthly Expense Report - ${monthName}`,
      '',
      'Date,Amount (₹),Reason,Timestamp',
      ...expenses.map(expense => `${expense.date},${expense.amount},${expense.reason},${expense.timestamp}`),
      '',
      'Summary',
      `Total Transactions,${expenses.length}`,
      `Total Amount (₹),${totalAmount}`,
      `Average per Transaction (₹),${avgAmount.toFixed(2)}`
    ];
    
    return lines.join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const showSuccessMessage = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg animate-fade-in z-50';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const showErrorMessage = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded shadow-lg animate-fade-in z-50';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Download className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Download Expense Reports
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Download All Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Complete Report
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Download all expenses from all time periods in a single CSV file.
              </p>
              <button
                onClick={downloadAllExpenses}
                disabled={downloading === 'all'}
                className="flex items-center px-4 py-2 bg-primary hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading === 'all' ? 'Downloading...' : 'Download All Expenses'}
              </button>
            </div>
          </div>

          {/* Monthly Reports Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Monthly Reports
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading available months...</p>
              </div>
            ) : months.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No expense data available yet.</p>
                <p className="text-sm">Add some expenses to generate monthly reports.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {months.map((month) => (
                  <div
                    key={month.key}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {month.name}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {month.count} transactions
                        </span>
                        <span>₹{month.total.toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadMonthlyExpenses(month.year, month.month, month.name)}
                      disabled={downloading === month.key}
                      className="flex items-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {downloading === month.key ? 'Downloading...' : 'Download'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Reports are generated in CSV format and include all transaction details with summaries.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;