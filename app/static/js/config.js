const API_CONFIG = {
    development: {
        baseURL: 'http://localhost:8000',
        frontendURL: 'http://localhost:3000'
    },
    production: {
        baseURL: 'https://your-backend-url.herokuapp.com',  // Update with actual backend URL
        frontendURL: 'https://linduarte.github.io'
    }
};

// Enhanced environment detection for Windows/PowerShell
const isDevelopment = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '0.0.0.0' ||
                     window.location.protocol === 'file:';

const API_BASE_URL = isDevelopment ? API_CONFIG.development.baseURL : API_CONFIG.production.baseURL;

// Utility function for API calls with enhanced error handling
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem("access_token");
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const config = {
        headers: { ...defaultHeaders, ...options.headers },
        ...options
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Enhanced error handling for different response types
        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText };
            }
            throw new Error(`API Error ${response.status}: ${errorData.message || errorData.detail || 'Unknown error'}`);
        }

        return response;
    } catch (error) {
        console.error('API call failed:', error);

        // Check if it's a network error (common in dev environment)
        if (error.message.includes('fetch')) {
            console.warn('Network error - make sure backend is running on:', API_BASE_URL);
        }

        throw error;
    }
}

// Debug helper for PowerShell development
function debugApiConfig() {
    console.log('Environment:', isDevelopment ? 'Development' : 'Production');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Current hostname:', window.location.hostname);
    console.log('Current protocol:', window.location.protocol);
}

// Call debug in development
if (isDevelopment) {
    debugApiConfig();
}
