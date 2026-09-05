import axios from './axios';

// Do not log credential payloads in browser output.
export const register = (data) => axios.post('register/', data);
export const login = (data) => axios.post('login/', data);
export const getUser = async () => {
  const response = await axios.get('user/');
  if (!response.data?.id || !['admin', 'employee'].includes(response.data.role)) {
    throw new Error('The studio server is unavailable. Please try again.');
  }
  return response;
};
export const getCSRFToken = async () => (await axios.get('csrf/')).data.csrfToken;
export const logout = async () => { await axios.post('logout/', {}); return true; };
export const getRole = async () => {
  try { return (await getUser()).data.role; } catch { return null; }
};
