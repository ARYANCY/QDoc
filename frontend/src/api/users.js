import apiClient from "./client";
import { ENDPOINTS } from "./config";

export const usersApi = {
  async listUsers() {
    return apiClient.get(ENDPOINTS.ADMIN_USERS);
  },

  async createUser(userData) {
    return apiClient.post(ENDPOINTS.ADMIN_USERS, userData);
  },

  async updateUser(userId, updates) {
    return apiClient.put(ENDPOINTS.ADMIN_USER_DETAIL(userId), updates);
  },

  async deleteUser(userId) {
    return apiClient.delete(ENDPOINTS.ADMIN_USER_DETAIL(userId));
  },
};

export default usersApi;
