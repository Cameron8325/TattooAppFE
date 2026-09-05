import axios from './axios';

// Do not log credential payloads in browser output.
export const register = (data) => axios.post('register/', data);
export const login = (data) => axios.post('login/', data);
export const getUser = () => axios.get('user/');
export const getCSRFToken = async () => (await axios.get('csrf/')).data.csrfToken;
export const logout = async () => { await axios.post('logout/', {}); return true; };
export const getRole = async () => {
  try { return (await getUser()).data.role; } catch { return null; }
};
