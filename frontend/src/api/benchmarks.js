import apiClient from "./client";
import { ENDPOINTS } from "./config";

export const benchmarksApi = {
  async getBenchmarkMatrix(disease = "breast_cancer") {
    return apiClient.get(ENDPOINTS.BENCHMARKS_MATRIX(disease));
  },
};
