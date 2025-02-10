import axios from "axios";
import config from "../config/config";
import { refreshToken } from "../store/slices/authSlice";

let store;

export const injectStore = (_store) => {
  store = _store;
};

const apiClient = axios.create({
  baseURL: config.serverBaseURL,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    if (store) {
      const token = store.getState().auth?.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const retryRequest = async (error) => {
  const retryAfter = error.response?.headers["retry-after"]
    ? parseInt(error.response.headers["retry-after"], 10) * 1000
    : 2000;

  console.warn(
    `Rate limited. Retrying request in ${retryAfter / 1000} seconds...`
  );

  return new Promise((resolve) =>
    setTimeout(() => resolve(apiClient.request(error.config)), retryAfter)
  );
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 429) {
      return retryRequest(error);
    }

    if (
      error.response?.status === 401 &&
      error.response.data.message?.invalid_access_token === true
    ) {
      try {
        if (!store) {
          console.error("Redux store is not available in Axios interceptor.");
          return Promise.reject(error);
        }

        const refreshAction = await store.dispatch(refreshToken());

        if (refreshToken.rejected.match(refreshAction)) {
          console.error("Failed to refresh token. Logging out.");
          error.response.data.message = "Failed to refresh token. Logging out.";
          return Promise.reject(error);
        }

        console.log("Token refreshed successfully.");
        return apiClient.request(error.config);
      } catch (refreshError) {
        console.error("Error during token refresh:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
