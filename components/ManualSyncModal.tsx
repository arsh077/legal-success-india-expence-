import React, { useState } from 'react';
import { X, Download, Upload, Smartphone, Monitor, Copy, Check } from 'lucide-react';
import { expenseService } from '../services/storage';

interface ManualSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
}

const ManualSyncModal: React.FC<ManualSyncModalProps> = ({ isOpen, onClose, onSyncComplete }) => {
  const [syncCode, setSyncCode] = useState('');
  const [exportedData, setExportedData] = useState('');
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [importing, setImporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    const data = expenseService.exportData();
    setExportedData(data);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportedData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = exportedData;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImport = () => {
    if (!syncCode.trim()) {
      alert('Please paste the sync code first!');
      return;
    }

    setImporting(true);
    setTimeout(() => {
      const success = expenseService.importData(syncCode);
      if (success) {
        alert('✅ Data imported successfully!');
        setSyncCode('');
        onSyncComplete();
        onClose();
      } else {
        alert('❌ Invalid sync code. Please check and try again.');
      }
      setImporting(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            📱💻 Manual Device Sync
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'export'
                ? 'text-primary border-b-2 border-primary bg-green-50 dark:bg-green-900/20'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Download className="inline mr-2" size={16} />
            Export Data
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'import'
                ? 'text-primary border-b-2 border-primary bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Upload className="inline mr-2" size={16} />
            Import Data
          </button>
        </div>

        <div className="p-6">
          
          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="text-center">
                <Smartphone className="mx-auto mb-3 text-green-500" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Export from This Device
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Generate a sync code to transfer your expenses to another device
                </p>
              </div>

              <button
                onClick={handleExport}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <Download className="mr-2" size={18} />
                Generate Sync Code
              </button>

              {exportedData && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sync Code (Copy this to other device):
                  </label>
                  <div className="relative">
                    <textarea
                      value={exportedData}
                      readOnly
                      className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-xs font-mono resize-none"
                    />
                    <button
                      onClick={handleCopy}
                      className={`absolute top-2 right-2 p-2 rounded transition-colors ${
                        copied 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 Copy this code and paste it in the "Import Data" tab on your other device
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="text-center">
                <Monitor className="mx-auto mb-3 text-blue-500" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Import to This Device
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Paste the sync code from your other device to import expenses
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Paste Sync Code:
                </label>
                <textarea
                  value={syncCode}
                  onChange={(e) => setSyncCode(e.target.value)}
                  placeholder='Paste the sync code from your other device here...'
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm font-mono resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <button
                onClick={handleImport}
                disabled={importing || !syncCode.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2" size={18} />
                    Import Data
                  </>
                )}
              </button>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  ⚠️ <strong>Note:</strong> Importing will merge data with existing expenses. Duplicates will be automatically filtered out.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            🔒 All data is processed locally. No data is sent to external servers.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ManualSyncModal;