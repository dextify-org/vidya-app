import axios from "axios";
import { Preferences } from "@capacitor/preferences";
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API,
});
const getToken = async () => {
  const { value } = await Preferences.get({ key: "token" });
  return value;
};
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default axiosInstance;
