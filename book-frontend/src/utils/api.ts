const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
const apiBaseUrl =
  configuredApiUrl ??
  (import.meta.env.DEV ? '/api' : 'https://book-api-lzjj.onrender.com');

export const BOOKS_API_URL = `${apiBaseUrl}/books`;
