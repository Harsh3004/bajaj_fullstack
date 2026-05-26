import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

export const getTickets = (params) => api.get('/tickets', { params });
export const getTicketStats = () => api.get('/tickets/stats');
export const createTicket = (data) => api.post('/tickets', data);
export const updateTicketStatus = (id, status) => api.patch(`/tickets/${id}`, { status });
export const deleteTicket = (id) => api.delete(`/tickets/${id}`);

export default api;
