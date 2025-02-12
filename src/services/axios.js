import axios from "axios";

// Create Axios instance
const instance = axios.create({
    baseURL: "http://127.0.0.1:8000/",
    withCredentials: true,  // ✅ Required for Django to send cookies
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

// ✅ Modify Axios to Fetch CSRF Token Before Requests
instance.interceptors.request.use(async (config) => {
    // If it's a POST, PUT, DELETE, or PATCH request, ensure CSRF token is set
    if (["post", "put", "delete", "patch"].includes(config.method)) {
        let csrfToken = await getCSRFTokenFromBackend();
        if (csrfToken) {
            config.headers["X-CSRFToken"] = csrfToken;
        }
    }

    return config;
});

export default instance;
