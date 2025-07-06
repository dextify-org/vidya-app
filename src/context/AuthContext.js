import axios from "../api/axiosInstance.js";
import { createContext, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Preferences } from "@capacitor/preferences";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState([]);
  const [categoryNeedsUpdate, setCategoryNeedsUpdate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Logged In");
  const [toastType, setToastType] = useState("success");
  const [token, setToken] = useState(null);
  useEffect(() => {
    const getToken = async () => {
      const { value } = await Preferences.get({ key: "token" });
      setToken(value);
    };
    getToken();
  }, [user]);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    setShowToast(false);
  }, [location]);
  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data } = await axios.get(
          "/api/category/5",

          { withCredentials: true }
        );
        setCategory(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCategory();
  }, [categoryNeedsUpdate]);
  const checkAuthStatus = async () => {
    try {
      const response = await axios.get("/api/auth/user", {
        withCredentials: true,
      });
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post("/api/auth/token", credentials);
      if (response.status === 200) {
        setUser(response.data.user);
        await Preferences.set({ key: "token", value: response.data.token });
        setIsSubmitting(false);
        setToastMessage("Logged In");
        setToastType("success");
        setShowToast(true);
        setCategoryNeedsUpdate((prev) => {
          return prev + 1;
        });
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (error) {
      setIsSubmitting(false);
      error.status === 400
        ? setToastMessage("cridentials can't be empty")
        : setToastMessage("error registering");
      error.status === 401 && setToastMessage("Invalid Credentials");
      setToastType("error");
      setShowToast(true);
      console.error(error);
    }
  };

  const logout = async () => {
    await axios.post(
      "/api/auth/logout",
      {},
      {
        withCredentials: true,
      }
    );
    await Preferences.remove({ key: "token" });
    setUser(null);
    setShowToast(false);
    navigate("/login");
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isSubmitting,
    showToast,
    toastMessage,
    toastType,
    setShowToast,
    setToastType,
    setToastMessage,
    category,
    setCategoryNeedsUpdate,
    categoryNeedsUpdate,
    token,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
