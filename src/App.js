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
import Loader from "./components/Loader/Loader.js";
import { updateCacheOnPreferenceChange } from "./api/axiosInstance.js";
import "./style.css";

const FirstStartUp = lazy(() => import("./pages/FirstStartUp"));
const AnimatedRoutes = lazy(() => import("./AnimatedRoutes"));
const ServerIP = lazy(() => import("./components/ServerIP.js"));
const AuthProvider = lazy(() =>
  import("./context/AuthContext").then((module) => ({
    default: module.AuthProvider,
  }))
);

const initStatusBar = () => {
  const platform = Capacitor.getPlatform();
  if (platform === "ios") {
    StatusBar.setOverlaysWebView({ overlay: false });
  }
  StatusBar.setBackgroundColor({ color: "#ffffff" });
  StatusBar.setStyle({ style: Style.Light });
};

const EXIT_ON_BACK_PATHS = ["/", "/login"];
const CACHE_KEY_FIRST_STARTUP = "first_startup_check";
const CACHE_KEY_IP = "IP";
const CACHE_EXPIRY = 60 * 60 * 1000;

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isFirstStartUp, setIsFirstStartUp] = useState(null);
  const [isServerIPSet, setIsServerIPSet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appState, setAppState] = useState({
    showServerIP: false,
    showFirstStartUp: false,
    showMainApp: false,
  });

  const checkCachedValue = async (key, defaultValue = null) => {
    try {
      const cachedValue = localStorage.getItem(key);

      if (cachedValue) {
        const { value, timestamp } = JSON.parse(cachedValue);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          return value;
        }
      }

      const { value } = await Preferences.get({ key });

      if (value) {
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

      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (error) {
      console.error("Failed to update server IP:", error);
    }
  };

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initStatusBar();
    }

    const initApp = async () => {
      setIsLoading(true);
      try {
        const serverIP = await checkCachedValue(CACHE_KEY_IP);
        setIsServerIPSet(!!serverIP);

        if (serverIP) {
          try {
            const cachedFirstStartup = await checkCachedValue(
              CACHE_KEY_FIRST_STARTUP
            );

            if (cachedFirstStartup !== null) {
              setIsFirstStartUp(cachedFirstStartup === "true");
            } else {
              const res = await axios.get("/");
              const isFirstStart = res.data;

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

  if (isLoading) {
    return (
      <>
        <Background />
        <div className="skeleton-container">
          <Loader />
        </div>
      </>
    );
  }

  if (appState.showServerIP) {
    return (
      <>
        <Background />
        <Suspense fallback={<Loader />}>
          <ServerIP onSetIP={updateServerIPAndReload} />
        </Suspense>
      </>
    );
  }

  if (appState.showFirstStartUp) {
    return (
      <>
        <Background />
        <Suspense fallback={<Loader />}>
          <FirstStartUp />
        </Suspense>
      </>
    );
  }

  return (
    <Suspense
      fallback={
        <>
          <Background />
          <Loader />
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
