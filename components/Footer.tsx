import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Legal Success India. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Tracking System v1.0
          </p>
        </div>
        <div className="text-center md:text-right">
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Head Office</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Shyamnagar, West Bengal, India</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;