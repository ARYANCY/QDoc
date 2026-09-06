import apiClient from "./client";

export const usersApi = {
  async listUsers() {
    return apiClient.get("/api/v1/admin/users");
  },

  async createUser(userData) {
    return apiClient.post("/api/v1/admin/users", userData);
  },

  async updateUser(userId, updates) {
    return apiClient.put(`/api/v1/admin/users/${userId}`, updates);
  },

  async deleteUser(userId) {
    return apiClient.delete(`/api/v1/admin/users/${userId}`);
  },
};

export default usersApi;
