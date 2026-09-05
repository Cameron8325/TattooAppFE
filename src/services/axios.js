import axios from "axios";

// Create Axios instance with environment-based configuration
// (Vite: env vars must be prefixed VITE_ and read via import.meta.env)
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api/",
    withCredentials: true,  // Required for Django to send cookies
    timeout: import.meta.env.VITE_DEMO_MODE === 'true' ? 90000 : 10000,
});

// ✅ Fetch CSRF Token Directly from Django
const getCSRFTokenFromBackend = async () => {
    try {
        const response = await instance.get("csrf/");
        return response.data.csrfToken;
    } catch (error) {
        console.error("❌ Error fetching CSRF token:", error);
        throw new Error('The studio server could not be reached. Please try again.');
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
        if (import.meta.env.DEV) {
            console.log(`[${config.method.toUpperCase()}] ${config.url}`);
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
        return response;
    },
    (error) => {
        const original = error.config;
        // Only reads may retry when a sleeping free demo server outlasts the
        // hosting proxy. Never replay a booking or other write automatically.
        if (import.meta.env.VITE_DEMO_MODE === 'true' && original?.method === 'get' &&
            !original._demoRetry && ([502, 503, 504].includes(error.response?.status) || error.code === 'ECONNABORTED')) {
            original._demoRetry = true;
            return instance(original);
        }
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
                    // DRF returns 403 for an unauthenticated session on /user/.
                    // AuthContext handles that as a guest state; it is not a role error.
                    if (!error.config?.url?.includes('user/') && window.location.pathname !== '/access-denied') {
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
        const firstMessage = (value) => typeof value === 'string' ? value
            : value && typeof value === 'object' ? Object.values(value).map(firstMessage).find(Boolean) : null;
        const message = firstMessage(data);
        if (message) return message;
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
