import http from './http';

export const fetchTasks = async (params) => {
  const { data } = await http.get('/tasks', { params });
  return data; // { success, data, pagination }
};

export const fetchTask = async (id) => {
  const { data } = await http.get(`/tasks/${id}`);
  return data.data;
};

export const createTask = async (payload) => {
  const { data } = await http.post('/tasks', payload);
  return data.data;
};

export const updateTask = async (id, payload) => {
  const { data } = await http.put(`/tasks/${id}`, payload);
  return data.data;
};

export const deleteTask = async (id) => {
  const { data } = await http.delete(`/tasks/${id}`);
  return data;
};

// status is changed ONLY through this API (the normal edit API ignores status)
export const updateTaskStatus = async (id, status) => {
  const { data } = await http.put(`/tasks/${id}/status`, { status });
  return data.data;
};

const readBlobMessage = async (error) => {
  const blob = error.response?.data;
  if (blob instanceof Blob) {
    try {
      const parsed = JSON.parse(await blob.text());
      if (parsed.message) error.userMessage = parsed.message;
    } catch {
      // keep the default message
    }
  }
};

export const downloadTasksCsv = async (params) => {
  try {
    const response = await http.get('/tasks/export', { params, responseType: 'blob' });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tasks.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    await readBlobMessage(error);
    throw error;
  }
};