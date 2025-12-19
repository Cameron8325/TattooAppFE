import axios from "axios";

// Create Axios instance with environment-based configuration
const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/",
    withCredentials: true,  // Required for Django to send cookies
    timeout: 10000, // 10 second timeout
});

// ✅ Fetch CSRF Token Directly from Django
const getCSRFTokenFromBackend = async () => {
    try {
        const response = await instance.get("csrf/");
        return response.data.csrfToken;
    } catch (error) {
        console.error("❌ Error fetching CSRF token:", error);
        return null;
    }
};

// ✅ Request Interceptor - Add CSRF token to requests
instance.interceptors.request.use(
    async (config) => {
        // If it's a POST, PUT, DELETE, or PATCH request, ensure CSRF token is set
        if (["post", "put", "delete", "patch"].includes(config.method)) {
            let csrfToken = await getCSRFTokenFromBackend();
            if (csrfToken) {
                config.headers["X-CSRFToken"] = csrfToken;
            }
        }

        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${config.method.toUpperCase()}] ${config.url}`, {
                data: config.data,
                params: config.params,
            });
        }

        return config;
    },
    (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
    }
);

// ✅ Response Interceptor - Handle common errors globally
instance.interceptors.response.use(
    (response) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${response.config.method.toUpperCase()}] ${response.config.url} - Success`, {
                status: response.status,
                data: response.data,
            });
        }
        return response;
    },
    (error) => {
        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;
            
            console.error(`[${error.config?.method?.toUpperCase()}] ${error.config?.url} - Error ${status}`, {
                message: data?.detail || data?.error || 'Unknown error',
                data: data,
            });

            // Handle specific status codes
            switch (status) {
                case 401:
                    // Unauthorized - redirect to login
                    console.warn("Unauthorized access - redirecting to login");
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    break;
                
                case 403:
                    // Forbidden - user doesn't have permission
                    console.error("Access forbidden");
                    if (window.location.pathname !== '/access-denied') {
                        window.location.href = '/access-denied';
                    }
                    break;
                
                case 404:
                    // Not found
                    console.error("Resource not found");
                    break;
                
                case 500:
                    // Server error
                    console.error("Server error occurred");
                    break;
                
                default:
                    console.error(`HTTP ${status} error`);
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error("No response received from server:", {
                url: error.config?.url,
                method: error.config?.method,
            });
            
            // Check if it's a network error
            if (!navigator.onLine) {
                console.error("Network is offline");
            }
        } else {
            // Error in setting up request
            console.error("Error setting up request:", error.message);
        }

        return Promise.reject(error);
    }
);

// ✅ Helper function to extract error message from response
export const getErrorMessage = (error) => {
    if (error.response?.data) {
        const data = error.response.data;
        
        // Check for various error formats Django might return
        if (data.detail) return data.detail;
        if (data.error) return data.error;
        if (data.message) return data.message;
        
        // Check for field-specific errors
        if (typeof data === 'object') {
            const firstKey = Object.keys(data)[0];
            if (Array.isArray(data[firstKey])) {
                return data[firstKey][0];
            }
            if (typeof data[firstKey] === 'string') {
                return data[firstKey];
            }
        }
    }
    
    // Fallback error messages
    if (error.response) {
        return `Request failed with status ${error.response.status}`;
    }
    if (error.request) {
        return 'No response from server. Please check your connection.';
    }
    return error.message || 'An unexpected error occurred';
};

// ✅ Helper function to check if user is authenticated
export const checkAuth = async () => {
    try {
        const response = await instance.get('user/');
        return response.data;
    } catch (error) {
        return null;
    }
};

export default instance;
