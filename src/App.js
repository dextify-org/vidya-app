import { useState, useEffect, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import { Preferences } from "@capacitor/preferences";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import axios from "./api/axiosInstance.js";
import Background from "./components/Background/Background";
import SkeletonLoader from "./components/Loader/BookLoader.js";
import { updateCacheOnPreferenceChange } from "./api/axiosInstance.js";
import "./style.css";

// Lazy load components for better performance
const FirstStartUp = lazy(() => import("./pages/FirstStartUp"));
const AnimatedRoutes = lazy(() => import("./AnimatedRoutes"));
const ServerIP = lazy(() => import("./components/ServerIP.js"));
const AuthProvider = lazy(() =>
  import("./context/AuthContext").then((module) => ({
    default: module.AuthProvider,
  }))
);

// Initialize status bar configuration
const initStatusBar = () => {
  const platform = Capacitor.getPlatform();
  if (platform === "ios") {
    StatusBar.setOverlaysWebView({ overlay: false });
  }
  StatusBar.setBackgroundColor({ color: "#ffffff" });
  StatusBar.setStyle({ style: Style.Light });
};

// Constants
const EXIT_ON_BACK_PATHS = ["/", "/login"];
const CACHE_KEY_FIRST_STARTUP = "first_startup_check";
const CACHE_KEY_IP = "IP";
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // States with proper loading indicators
  const [isFirstStartUp, setIsFirstStartUp] = useState(null);
  const [isServerIPSet, setIsServerIPSet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appState, setAppState] = useState({
    showServerIP: false,
    showFirstStartUp: false,
    showMainApp: false,
  });

  // Check cache first, then preferences
  const checkCachedValue = async (key, defaultValue = null) => {
    try {
      // Try to get from localStorage for web or preferences for native
      const cachedValue = localStorage.getItem(key);

      if (cachedValue) {
        const { value, timestamp } = JSON.parse(cachedValue);
        // Check if cache is still valid
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          return value;
        }
      }

      // If cache miss or expired, get from preferences
      const { value } = await Preferences.get({ key });

      if (value) {
        // Update cache
        localStorage.setItem(
          key,
          JSON.stringify({
            value,
            timestamp: Date.now(),
          })
        );
        return value;
      }

      return defaultValue;
    } catch (error) {
      console.error(`Error checking cached value for ${key}:`, error);
      return defaultValue;
    }
  };

  const updateServerIPAndReload = async (newIP) => {
    try {
      await Preferences.set({ key: CACHE_KEY_IP, value: newIP });
      updateCacheOnPreferenceChange(CACHE_KEY_IP, newIP);
      localStorage.setItem(
        CACHE_KEY_IP,
        JSON.stringify({
          value: newIP,
          timestamp: Date.now(),
        })
      );

      setIsServerIPSet(true);
      setAppState({
        showServerIP: false,
        showFirstStartUp: false,
        showMainApp: true,
      });

      // This allows the app to finish rendering the main state before reload
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (error) {
      console.error("Failed to update server IP:", error);
    }
  };

  // Effect to initialize app state
  useEffect(() => {
    // Initialize status bar
    if (Capacitor.isNativePlatform()) {
      initStatusBar();
    }

    const initApp = async () => {
      setIsLoading(true);
      try {
        // Check server IP first
        const serverIP = await checkCachedValue(CACHE_KEY_IP);
        setIsServerIPSet(!!serverIP);

        // If server IP is set, proceed to check first startup
        if (serverIP) {
          try {
            // Check if we have a cached first startup value
            const cachedFirstStartup = await checkCachedValue(
              CACHE_KEY_FIRST_STARTUP
            );

            if (cachedFirstStartup !== null) {
              setIsFirstStartUp(cachedFirstStartup === "true");
            } else {
              // Make API call to check first startup only if we don't have cached value
              const res = await axios.get("/");
              const isFirstStart = res.data;

              // Cache the result
              localStorage.setItem(
                CACHE_KEY_FIRST_STARTUP,
                JSON.stringify({
                  value: String(isFirstStart),
                  timestamp: Date.now(),
                })
              );

              await Preferences.set({
                key: CACHE_KEY_FIRST_STARTUP,
                value: String(isFirstStart),
              });

              setIsFirstStartUp(isFirstStart);
            }
          } catch (error) {
            console.error("Error checking first startup:", error);
            setIsFirstStartUp(false);
          }
        }
      } catch (error) {
        console.error("Error initializing app:", error);
        setIsFirstStartUp(false);
        setIsServerIPSet(false);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  // Effect to determine what to show based on state
  useEffect(() => {
    if (isLoading) {
      setAppState({
        showServerIP: false,
        showFirstStartUp: false,
        showMainApp: false,
      });
      return;
    }

    if (!isServerIPSet) {
      setAppState({
        showServerIP: true,
        showFirstStartUp: false,
        showMainApp: false,
      });
      return;
    }

    if (isFirstStartUp === true) {
      setAppState({
        showServerIP: false,
        showFirstStartUp: true,
        showMainApp: false,
      });
      return;
    }

    setAppState({
      showServerIP: false,
      showFirstStartUp: false,
      showMainApp: true,
    });
  }, [isLoading, isServerIPSet, isFirstStartUp]);

  // Effect for back button handling
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = CapacitorApp.addListener("backButton", () => {
      const isOnExitPath = EXIT_ON_BACK_PATHS.includes(location.pathname);
      if (appState.showFirstStartUp || appState.showServerIP || isOnExitPath) {
        CapacitorApp.exitApp();
      } else {
        navigate(-1);
      }
    });

    return () => {
      listener.remove();
    };
  }, [location, navigate, appState]);

  // Loading state
  if (isLoading) {
    return (
      <>
        <Background />
        <div className="skeleton-container">
          <SkeletonLoader />
        </div>
      </>
    );
  }

  // Server IP setup state
  if (appState.showServerIP) {
    return (
      <>
        <Background />
        <Suspense fallback={<SkeletonLoader />}>
          <ServerIP onSetIP={updateServerIPAndReload} />
        </Suspense>
      </>
    );
  }

  // First startup state
  if (appState.showFirstStartUp) {
    return (
      <>
        <Background />
        <Suspense fallback={<SkeletonLoader />}>
          <FirstStartUp />
        </Suspense>
      </>
    );
  }

  // Main app state
  return (
    <Suspense
      fallback={
        <>
          <Background />
          <SkeletonLoader />
        </>
      }
    >
      <AuthProvider>
        <Background />
        <AnimatedRoutes />
      </AuthProvider>
    </Suspense>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
