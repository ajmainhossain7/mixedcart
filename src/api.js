// Central API configuration — all components import from here.
// In development: http://localhost:5000
// In production:  set REACT_APP_API_URL in Vercel environment variables

export const API_URL =
    process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const SOCKET_URL =
    process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
