import http from './http';

export const fetchDashboard = async () => {
  const { data } = await http.get('/dashboard');
  return data.data;
};