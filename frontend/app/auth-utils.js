// auth-utils.js - Enhanced Authentication Utilities

// Enhanced token manager with better persistence and debugging
export const tokenManager = {
  setToken: (token) => {
    if (!token) {
      console.error('Attempted to set empty token');
      return false;
    }

    const tokenData = {
      value: token,
      expiry: Date.now() + 30 * 60 * 1000, // 30 minutes expiration
      setAt: Date.now() // Track when token was set
    };

    try {
      localStorage.setItem("authToken", JSON.stringify(tokenData));
      
      // Set in memory for immediate access
      if (typeof window !== "undefined") {
        window.accessToken = token;
        window.tokenSetAt = tokenData.setAt;
      }
      
      console.log('Token set successfully at', new Date(tokenData.setAt).toISOString());
      return true;
    } catch (error) {
      console.error('Failed to store token:', error);
      return false;
    }
  },

  getToken: () => {
    try {
      // First check memory for immediate access
      if (typeof window !== "undefined" && window.accessToken) {
        const memoryToken = window.accessToken;
        const memoryExpiry = window.tokenSetAt ? window.tokenSetAt + 30 * 60 * 1000 : 0;
        
        if (memoryExpiry > Date.now()) {
          return memoryToken;
        }
      }

      // Fall back to localStorage
      const storedData = localStorage.getItem("authToken");
      if (!storedData) return null;

      const tokenData = JSON.parse(storedData);
      
      // Verify token structure
      if (!tokenData.value || !tokenData.expiry) {
        console.warn('Malformed token data found');
        this.removeToken();
        return null;
      }

      // Check expiration
      if (Date.now() > tokenData.expiry) {
        console.log('Token expired at', new Date(tokenData.expiry).toISOString());
        this.removeToken();
        return null;
      }

      // Update memory cache
      if (typeof window !== "undefined") {
        window.accessToken = tokenData.value;
        window.tokenSetAt = tokenData.setAt;
      }

      return tokenData.value;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  removeToken: () => {
    try {
      localStorage.removeItem("authToken");
      if (typeof window !== "undefined") {
        delete window.accessToken;
        delete window.tokenSetAt;
      }
      console.log('Token cleared successfully');
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  },

  isTokenValid: () => {
    const token = this.getToken();
    if (!token) return false;
    
    // Additional validation if needed
    return true;
  },

  refreshTokenExpiry: () => {
    const token = this.getToken();
    if (token) {
      const success = this.setToken(token); // Will update expiry
      console.log('Token expiry refreshed:', success);
      return success;
    }
    return false;
  },

  getTokenExpiry: () => {
    try {
      const storedData = localStorage.getItem("authToken");
      if (!storedData) return null;
      
      const tokenData = JSON.parse(storedData);
      return tokenData.expiry;
    } catch {
      return null;
    }
  },

  // Debug method
  debugTokenStatus: () => {
    const token = this.getToken();
    const expiry = this.getTokenExpiry();
    
    return {
      exists: !!token,
      valid: this.isTokenValid(),
      expiresAt: expiry ? new Date(expiry).toISOString() : 'N/A',
      expiresIn: expiry ? Math.round((expiry - Date.now()) / 60000) + ' minutes' : 'N/A'
    };
  }
};

// Enhanced fetch with auth
export const fetchWithAuth = async (url, options = {}) => {
  const token = tokenManager.getToken();
  
  if (!token) {
    const error = new Error("No authentication token available");
    error.code = "MISSING_TOKEN";
    throw error;
  }

  // Refresh token expiry before making request
  tokenManager.refreshTokenExpiry();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    Authorization: `Bearer ${token}`
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Automatically handle 401 unauthorized
    if (response.status === 401) {
      tokenManager.removeToken();
      const error = new Error("Session expired");
      error.code = "SESSION_EXPIRED";
      throw error;
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    if (error.code === "SESSION_EXPIRED") {
      // Trigger logout flow
      if (typeof window !== "undefined") {
        window.location.href = '/login?session=expired';
      }
    }
    throw error;
  }
};

// Helper for handling protected routes
export const verifyAuth = () => {
  const token = tokenManager.getToken();
  const status = tokenManager.debugTokenStatus();
  
  console.log('Auth verification:', status);
  return {
    isValid: tokenManager.isTokenValid(),
    status
  };
};

// Initialize auth state on load
if (typeof window !== "undefined") {
  // Verify token on initial load
  tokenManager.getToken();
  
  // Optional: Set up periodic token check
  setInterval(() => {
    tokenManager.getToken(); // This will automatically clear if expired
  }, 60 * 1000); // Check every minute
}