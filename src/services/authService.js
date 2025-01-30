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


export const logout = async () => {
    try {
        const response = await axios.post("logout/", {}, {
            withCredentials: true,  // ✅ Ensures session is properly destroyed
        });
        console.log("✅ Logout successful:", response.data);
        return response;
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

