/**
 * Secure API Utilities
 * Provides secure HTTP client with CSRF protection and security headers
 */

import { csrfProtection, securityHeaders } from './security';

/**
 * Secure fetch wrapper with automatic CSRF and security headers
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch response
 */
export const secureFetch = async (url, options = {}) => {
  // Get security headers
  const headers = {
    'Content-Type': 'application/json',
    ...securityHeaders.getApiHeaders(),
    ...options.headers
  };

  // Add CSRF token for state-changing requests
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
    (options.method || 'GET').toUpperCase()
  );

  if (isStateChanging) {
    const csrfToken = csrfProtection.getToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  // Prepare fetch options
  const fetchOptions = {
    ...options,
    headers,
    credentials: 'same-origin' // Include cookies for same-origin requests
  };

  try {
    const response = await fetch(url, fetchOptions);
    
    // Validate response headers for security
    if (response.ok) {
      const isValidResponse = securityHeaders.validateResponseHeaders(response.headers);
      if (!isValidResponse) {
        console.warn('Response failed security header validation');
      }
    }

    return response;
  } catch (error) {
    console.error('Secure fetch error:', error);
    throw error;
  }
};

/**
 * API client with common HTTP methods
 */
export const apiClient = {
  /**
   * GET request
   * @param {string} url - The URL to fetch
   * @param {Object} options - Additional options
   * @returns {Promise} - Response data
   */
  get: async (url, options = {}) => {
    const response = await secureFetch(url, {
      method: 'GET',
      ...options
    });
    return response.json();
  },

  /**
   * POST request
   * @param {string} url - The URL to post to
   * @param {Object} data - Data to send
   * @param {Object} options - Additional options
   * @returns {Promise} - Response data
   */
  post: async (url, data, options = {}) => {
    const response = await secureFetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
    return response.json();
  },

  /**
   * PUT request
   * @param {string} url - The URL to put to
   * @param {Object} data - Data to send
   * @param {Object} options - Additional options
   * @returns {Promise} - Response data
   */
  put: async (url, data, options = {}) => {
    const response = await secureFetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
    return response.json();
  },

  /**
   * PATCH request
   * @param {string} url - The URL to patch
   * @param {Object} data - Data to send
   * @param {Object} options - Additional options
   * @returns {Promise} - Response data
   */
  patch: async (url, data, options = {}) => {
    const response = await secureFetch(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options
    });
    return response.json();
  },

  /**
   * DELETE request
   * @param {string} url - The URL to delete
   * @param {Object} options - Additional options
   * @returns {Promise} - Response data
   */
  delete: async (url, options = {}) => {
    const response = await secureFetch(url, {
      method: 'DELETE',
      ...options
    });
    return response.json();
  }
};

/**
 * Request interceptor for adding authentication tokens
 * @param {Function} getToken - Function to get auth token
 */
export const addAuthInterceptor = (getToken) => {
  const originalFetch = window.fetch;
  
  window.fetch = async (url, options = {}) => {
    // Add authentication token
    const token = getToken() || sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    // Add CSRF token for state-changing requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes((options.method || 'GET').toUpperCase())) {
      const csrfToken = csrfProtection.getToken();
      if (csrfToken) {
        options.headers = {
          ...options.headers,
          'X-CSRF-Token': csrfToken
        };
      }
    }
    
    // Add security headers
    const apiHeaders = securityHeaders.getApiHeaders();
    options.headers = {
      ...options.headers,
      ...apiHeaders
    };
    
    return originalFetch(url, options);
  };
};

/**
 * Response interceptor for handling common errors
 * @param {Function} onUnauthorized - Callback for 401 responses
 * @param {Function} onForbidden - Callback for 403 responses
 */
export const addResponseInterceptor = (onUnauthorized, onForbidden) => {
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    
    // Validate security headers in response
    if (response.ok) {
      try {
        const isValidResponse = securityHeaders.validateResponseHeaders(response.headers);
        if (!isValidResponse) {
          console.warn('Security header validation failed');
        }
      } catch (securityError) {
        console.warn('Security header validation error:', securityError.message);
      }
    }
    
    // Handle different error scenarios
    const status = response.status;
    
    switch (status) {
      case 401:
        // Handle unauthorized access
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('sessionData');
        sessionStorage.removeItem('sessionData');
        csrfProtection.clearToken();
        
        if (onUnauthorized) {
          onUnauthorized(response);
        } else if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        break;
        
      case 403:
        // Handle forbidden access (CSRF, permissions, etc.)
        const errorData = await response.clone().json().catch(() => ({}));
        if (errorData?.code === 'CSRF_TOKEN_INVALID') {
          csrfProtection.clearToken();
          csrfProtection.generateToken();
        }
        
        if (onForbidden) {
          onForbidden(response);
        }
        break;
        
      case 429:
        // Handle rate limiting
        console.warn('Rate limit exceeded. Please slow down requests.');
        break;
        
      case 500:
      case 502:
      case 503:
      case 504:
        // Handle server errors
        console.error('Server error occurred:', status);
        break;
    }
    
    return response;
  };
};

export default {
  secureFetch,
  apiClient,
  addAuthInterceptor,
  addResponseInterceptor
};