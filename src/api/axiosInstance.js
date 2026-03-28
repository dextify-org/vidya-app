import axios from "axios";
import { Preferences } from "@capacitor/preferences";

const axiosInstance = axios.create();

const preferencesCache = {
  ip: null,
  token: null,
  lastIPFetch: 0,
  lastTokenFetch: 0,
  CACHE_EXPIRY: 5 * 60 * 1000,
};

const getIP = async () => {
  const now = Date.now();

  if (
    preferencesCache.ip &&
    now - preferencesCache.lastIPFetch < preferencesCache.CACHE_EXPIRY
  ) {
    return preferencesCache.ip;
  }

  try {
    const { value } = await Preferences.get({ key: "IP" });
    preferencesCache.ip = value;
    preferencesCache.lastIPFetch = now;
    return preferencesCache.ip;
  } catch (error) {
    console.error("Error reading IP from preferences:", error);
  }
};

const getToken = async () => {
  const now = Date.now();

  if (
    preferencesCache.token &&
    now - preferencesCache.lastTokenFetch < preferencesCache.CACHE_EXPIRY
  ) {
    return preferencesCache.token;
  }

  try {
    const { value } = await Preferences.get({ key: "token" });
    preferencesCache.token = value;
    preferencesCache.lastTokenFetch = now;
    return value;
  } catch (error) {
    console.error("Error reading token from preferences:", error);
    return null;
  }
};

(async () => {
  try {
    axiosInstance.defaults.baseURL = await getIP();
  } catch (error) {
    console.error("Failed to initialize axios baseURL:", error);
  }
})();

const updateCacheOnPreferenceChange = (key, value) => {
  if (key === "IP") {
    preferencesCache.ip = value;
    preferencesCache.lastIPFetch = Date.now();
    axiosInstance.defaults.baseURL = value;
  } else if (key === "token") {
    preferencesCache.token = value;
    preferencesCache.lastTokenFetch = Date.now();
  }
};

axiosInstance.interceptors.request.use(
  async (config) => {
    if (
      Date.now() - preferencesCache.lastIPFetch >=
      preferencesCache.CACHE_EXPIRY
    ) {
      config.baseURL = await getIP();
    }

    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {}

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export { updateCacheOnPreferenceChange };
export default axiosInstance;
