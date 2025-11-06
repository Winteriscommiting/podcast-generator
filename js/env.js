// Environment configuration for API endpoints
const ENV = {
  // Automatically detect the environment
  isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
  
  // API Base URL - update this with your deployed backend URL
  getApiUrl() {
    // If running locally, use localhost
    if (!this.isProduction) {
      return 'http://localhost:3000';
    }
    
    // IMPORTANT: Update this with your Railway/Render deployment URL
    // Example: 'https://your-app-name.up.railway.app'
    // or: 'https://your-app-name.onrender.com'
    const DEPLOYED_BACKEND_URL = 'https://pod-app-zai-production.up.railway.app';
    
    return DEPLOYED_BACKEND_URL;
  },
  
  // Get full API endpoint
  getEndpoint(path) {
    const baseUrl = this.getApiUrl();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }
};

// Export for use in other files
window.ENV = ENV;
