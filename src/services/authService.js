import axios from "./axios";

export const register = async (userData) => {
    console.log("🚀 Sending registration data:", userData); // 🔍 Log data before request
    try {
        const response = await axios.post("register/", userData);
        console.log("✅ Registration response:", response.data);
        return response;
    } catch (error) {
        console.error("❌ Registration error:", error.response?.data); // Log backend error
        throw error;
    }
};

export const login = async (userData) => {
    console.log("🚀 Sending login data:", userData); // Debugging log
    try {
        const response = await axios.post("login/", userData, {
            withCredentials: true,  // ✅ Ensure session cookies are sent and received
        });
        console.log("✅ Login successful:", response.data);
        return response; 
    } catch (error) {
        console.error("❌ Login error:", error.response?.data);
        throw error;
    }
};


export const getCSRFToken = async () => {
    try {
        const response = await axios.get("csrf/", { withCredentials: true });
        return response.data.csrfToken;
    } catch (error) {
        console.error("CSRF token fetch error:", error);
        return null;
    }
};

export const logout = async () => {
    try {
        const csrfToken = await getCSRFToken(); // 🔍 Get CSRF before logging out
        if (!csrfToken) throw new Error("CSRF token not found");

        const response = await axios.post("logout/", {}, {
            withCredentials: true,
            headers: { "X-CSRFToken": csrfToken },
        });

        
        console.log("✅ Logout successful:", response.data);
        return true;
    } catch (error) {
        console.error("❌ Logout error:", error.response?.data);
        throw error;
    }
};


export const getUser = async () => {
    console.log("🚀 Checking session authentication...");
    try {
        const response = await axios.get("user/", {
            withCredentials: true,  // ✅ Required to send session cookies
        });
        console.log("✅ User retrieved:", response.data);
        return response;
    } catch (error) {
        console.error("❌ User retrieval error:", error.response?.data);
        throw error;
    }
};

export const getRole = async () => {
    try {const response = await getUser();
        const role = response.data.role;
        return role;
    } catch (error) {
        console.error("Error fetching user role:", error)
        return null;
    }
};