// Configuration for Legal Success India Expense Tracker

// Network Configuration
export const CONFIG = {
  // Production API URL (Update this with your Hostinger domain)
  PRODUCTION_API_URL: 'https://ce.legalsuccessindia.com/api',
  
  // Local development URLs
  LOCAL_API_URL: 'http://192.168.1.18:5000/api',
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
  // Production deployment (Hostinger) - Use mock/localStorage mode
  if (window.location.hostname.includes('legalsuccessindia.com')) {
    return null; // This will trigger localStorage mode in storage.ts
  }
  
  // Check if we're on mobile/external device (local network)
  if (window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1' &&
      window.location.hostname.includes('192.168')) {
    return CONFIG.LOCAL_API_URL;
  }
  
  // Use localhost for desktop development
  return CONFIG.LOCALHOST_URL;
};

// Check if we're in production mode
export const isProduction = () => {
  return window.location.hostname.includes('legalsuccessindia.com');
};

export default CONFIG;