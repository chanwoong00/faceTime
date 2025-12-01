/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || (typeof window !== 'undefined' ? 'http://127.0.0.1:8081' : 'http://localhost:8081'),
  
  ENDPOINTS: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    ANALYZE: '/api/analyze',
    HISTORY: '/api/history',
    RESULT: '/api/result',
  },
};

export default API_CONFIG;


