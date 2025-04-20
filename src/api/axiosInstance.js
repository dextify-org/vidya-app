import axios from "axios";
import { Preferences } from "@capacitor/preferences";

// Create axios instance
const axiosInstance = axios.create();

// Cache for preferences values to avoid repeated async calls
const preferencesCache = {
  ip: null,
  token: null,
  lastIPFetch: 0,
  lastTokenFetch: 0,
  // Cache expiration time in milliseconds (5 minutes)
  CACHE_EXPIRY: 5 * 60 * 1000,
};

// Get IP with caching
const getIP = async () => {
  const now = Date.now();

  // Use cached value if available and not expired
  if (
    preferencesCache.ip &&
    now - preferencesCache.lastIPFetch < preferencesCache.CACHE_EXPIRY
  ) {
    return preferencesCache.ip;
  }

  try {
    const { value } = await Preferences.get({ key: "IP" });
    // Update cache
    preferencesCache.ip = value;
    preferencesCache.lastIPFetch = now;
    return preferencesCache.ip;
  } catch (error) {
    console.error("Error reading IP from preferences:", error);
  }
};

// Get token with caching
const getToken = async () => {
  const now = Date.now();

  // Use cached value if available and not expired
  if (
    preferencesCache.token &&
    now - preferencesCache.lastTokenFetch < preferencesCache.CACHE_EXPIRY
  ) {
    return preferencesCache.token;
  }

  try {
    const { value } = await Preferences.get({ key: "token" });
    // Update cache
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

// Listen for preference changes (optional - implement if you have a way to detect changes)
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

// Add request interceptor with performance optimizations
axiosInstance.interceptors.request.use(
  async (config) => {
    // Avoid reassigning baseURL on every request - only check if cache is expired
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
    } catch (error) {
      // Silent error handling to prevent request failure
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { updateCacheOnPreferenceChange };
export default axiosInstance;
