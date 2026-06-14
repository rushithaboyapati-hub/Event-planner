import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const GATEWAY_BASE = `${API_BASE_URL}/api`;
const API = axios.create({ baseURL: GATEWAY_BASE });

let authData = null;

try {
  const stored = localStorage.getItem('auth');
  if (stored) authData = JSON.parse(stored);
} catch {}

export function getAuth() {
  return authData;
}

export function isAuthenticated() {
  return authData !== null && authData.token;
}

export function getToken() {
  return authData?.token || null;
}

export function getUserId() {
  return authData?.userId || null;
}

export function getUserRole() {
  return authData?.role || null;
}

export async function login(email, password) {
  const res = await API.post('/auth/login', { email, password });
  authData = res.data;
  localStorage.setItem('auth', JSON.stringify(authData));
  return authData;
}

export async function register(name, email, password, role = 'USER') {
  const res = await API.post('/auth/register', {
    name, email, passwordHash: password, role
  });
  authData = res.data;
  localStorage.setItem('auth', JSON.stringify(authData));
  return authData;
}

export function logout() {
  authData = null;
  localStorage.removeItem('auth');
}

export async function fetchUserInfo() {
  if (!authData?.token) return null;
  try {
    const res = await axios.get(`${GATEWAY_BASE}/uinfo`, {
      headers: { 'Authorization': `Bearer ${authData.token}` }
    });
    return res.data;
  } catch {
    return null;
  }
}

export function authAxios() {
  const instance = axios.create({ baseURL: GATEWAY_BASE });
  if (authData?.token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
  }
  return instance;
}
