import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import FirstStartUp from "./pages/FirstStartUp";
import Background from "./components/Background/Background";
import AnimatedRoutes from "./AnimatedRoutes";
import { AuthProvider } from "./context/AuthContext";
import "./style.css";
import axios from "./api/axiosInstance.js";
import { SkeletonLoader } from "./assets/index.js";
import { StatusBar } from "@capacitor/status-bar";

StatusBar.setOverlaysWebView({ overlay: false });
StatusBar.setBackgroundColor({ color: "#FFFFFF" });
const EXIT_ON_BACK_PATHS = ["/", "/login"];

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/");
        setData(res.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const listener = CapacitorApp.addListener("backButton", () => {
      const isOnExitPath = EXIT_ON_BACK_PATHS.includes(location.pathname);

      const isShowingFirstStartUp = data === true;

      if (isShowingFirstStartUp || isOnExitPath) {
        CapacitorApp.exitApp();
      } else {
        navigate(-1);
      }
    });

    return () => {
      listener.remove();
    };
  }, [location, navigate, data]);

  if (data === null) {
    return (
      <>
        <Background />
        <SkeletonLoader />
      </>
    );
  }

  return (
    <AuthProvider>
      <Background />
      {data ? <FirstStartUp /> : <AnimatedRoutes />}
    </AuthProvider>
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
