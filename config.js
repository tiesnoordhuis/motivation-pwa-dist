export const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_URL = isLocal
    ? 'http://localhost:3000'
    : 'http://192.168.178.170:3000';
