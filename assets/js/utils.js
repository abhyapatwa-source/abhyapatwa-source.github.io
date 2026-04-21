import { CONFIG } from './config.js';

// TOKEN + AUTH
export function getToken() {
  return localStorage.getItem(CONFIG.TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(CONFIG.TOKEN_KEY, token);
}

export function logout() {
  localStorage.removeItem(CONFIG.TOKEN_KEY);
  window.location.href = '/';
}

export function checkAuth() {
  const token = getToken();
  if (!token) window.location.href = '/';
  return token;
}

// THEME
export function getTheme() {
  return localStorage.getItem(CONFIG.THEME_KEY) || 'dark';
}

export function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem(CONFIG.THEME_KEY, theme);
}

export function toggleTheme() {
  const newTheme = getTheme() === 'dark'? 'light' : 'dark';
  setTheme(newTheme);
}

// HISTORY
export function getHistory() {
  return JSON.parse(localStorage.getItem(CONFIG.HISTORY_KEY) || '[]');
}

export function saveHistory(history) {
  localStorage.setItem(CONFIG.HISTORY_KEY, JSON.stringify(history));
}

// HELPERS
export function scrollToBottom(el) {
  el.scrollTop = el.scrollHeight;
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
