import apiClient from "./client";

export const benchmarksApi = {
  async getBenchmarkMatrix(disease = "breast_cancer") {
    return apiClient.get(`/api/v1/benchmarks/matrix?disease=${disease}`);
  },
};
