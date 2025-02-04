import axios from "axios";
import config from "../config/config";

const apiClient = axios.create({
  baseURL: config.serverBaseURL,
  withCredentials: true,
});

export default apiClient;
