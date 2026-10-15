import http from './http';

export const fetchEmployees = async (params) => {
  const { data } = await http.get('/employees', { params });
  return data; // { success, data, pagination }
};

export const fetchEmployeeOptions = async () => {
  const { data } = await http.get('/employees/options');
  return data.data;
};

export const fetchEmployee = async (id) => {
  const { data } = await http.get(`/employees/${id}`);
  return data.data;
};

export const createEmployee = async (payload) => {
  const { data } = await http.post('/employees', payload);
  return data.data;
};

export const updateEmployee = async (id, payload) => {
  const { data } = await http.put(`/employees/${id}`, payload);
  return data.data;
};

export const deleteEmployee = async (id) => {
  const { data } = await http.delete(`/employees/${id}`);
  return data;
};