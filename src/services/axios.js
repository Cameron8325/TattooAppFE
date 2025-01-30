import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://127.0.0.1:8000/', // Your Django backend API URL
    withCredentials: true,  // ✅ Required for session authentication
});

// ✅ Add function to get CSRF token from cookies
const getCSRFToken = () => {
    const csrfCookie = document.cookie
        .split("; ")
        .find(row => row.startsWith("csrftoken="));
    return csrfCookie ? csrfCookie.split("=")[1] : null;
};

// ✅ Add CSRF token to requests
instance.interceptors.request.use(config => {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
        config.headers["X-CSRFToken"] = csrfToken;
    }
    return config;
});

export default instance;
