import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage =
      error.response?.data?.message || 'Cannot reach the server. Please try again.';
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) =>
  error.userMessage || error.message || 'Something went wrong';

export default http;