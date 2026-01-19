// Configuration for Legal Success India Expense Tracker

// Network Configuration
export const CONFIG = {
  // Backend API URL - Update this IP address to match your computer's network IP
  API_URL: 'http://192.168.1.18:5000/api',
  
  // Alternative URLs for different environments
  LOCALHOST_URL: 'http://localhost:5000/api',
  
  // App Configuration
  APP_NAME: 'Legal Success India - Expense Tracker',
  COMPANY_NAME: 'Legal Success India',
  
  // Authentication
  CREDENTIALS: {
    EMAIL: 'arshad@legalsuccessindia.com',
    PASSWORD: 'Khurshid@1997'
  }
};

// Auto-detect environment and use appropriate URL
export const getApiUrl = () => {
  // Check if we're on mobile/external device
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return CONFIG.API_URL; // Use network IP for mobile devices
  }
  
  // Use localhost for desktop development
  return CONFIG.LOCALHOST_URL;
};

export default CONFIG;