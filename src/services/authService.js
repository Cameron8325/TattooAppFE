import axios from "./axios";

export const register = (userData) => axios.post("register/", userData);
export const login = (userData) => axios.post("login/", userData);
export const logout = () => axios.post("logout/");
export const getUser = () => axios.get("user/");
