// Environment configuration for API endpoints
const ENV = {
  // Automatically detect the environment
  isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
  
  // Check if running on Netlify
  isNetlify: window.location.hostname.includes('netlify.app') || window.location.hostname.includes('.netlify.com'),
  
  // Check if running on GitHub Pages
  isGitHubPages: window.location.hostname.includes('github.io'),
  
  // API Base URL - update this with your deployed backend URL
  getApiUrl() {
    // If running locally, use localhost
    if (!this.isProduction) {
      return 'http://localhost:3000';
    }
    
    // If running on Netlify, use Netlify Functions
    if (this.isNetlify) {
      return window.location.origin; // Netlify Functions are on same domain
    }
    
    // If running on GitHub Pages, you MUST deploy backend separately
    // Update this with your Railway/Render deployment URL
    if (this.isGitHubPages) {
      const DEPLOYED_BACKEND_URL = 'https://pod-app-zai-production.up.railway.app';
      return DEPLOYED_BACKEND_URL;
    }
    
    // Default: try same origin first
    return window.location.origin;
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
