import axiosInstance from './axiosInstance';

const TicketService = {
  createTicket: async (formData) => {
    // formData is a FormData object because of file uploads
    return axiosInstance.post('/api/tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  getTickets: async () => {
    return axiosInstance.get('/api/tickets');
  },

  getAssignedTickets: async () => {
    return axiosInstance.get('/api/tickets/assigned');
  },

  getTicketById: async (id) => {
    return axiosInstance.get(`/api/tickets/${id}`);
  },

  updateStatus: async (id, data) => {
    return axiosInstance.patch(`/api/tickets/${id}/status`, data);
  },

  getComments: async (id) => {
    return axiosInstance.get(`/api/tickets/${id}/comments`);
  },

  addComment: async (id, content) => {
    return axiosInstance.post(`/api/tickets/${id}/comments`, { content });
  },

  deleteComment: async (commentId) => {
    return axiosInstance.delete(`/api/tickets/comments/${commentId}`);
  }
};

export default TicketService;
