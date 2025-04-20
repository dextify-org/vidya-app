import React, { useState } from "react";
import Toast from "./Toast/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { Preferences } from "@capacitor/preferences";
import { updateCacheOnPreferenceChange } from "../api/axiosInstance";

const ServerIP = ({ onSetIP }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [serverIP, setSereverIP] = useState("");

  const handleSetIP = async () => {
    setIsSubmitting(true);

    try {
      let ipAddress = serverIP.trim();

      const hasProtocol =
        ipAddress.startsWith("http://") || ipAddress.startsWith("https://");

      const urlsToTry = hasProtocol
        ? [ipAddress]
        : [`https://${ipAddress}`, `http://${ipAddress}`];

      let validUrl = null;

      for (const url of urlsToTry) {
        try {
          const response = await fetch(url, {
            method: "GET",
            signal: AbortSignal.timeout(5000),
          });

          if (
            response.ok ||
            response.status === 200 ||
            response.status === 403
          ) {
            validUrl = url;
            break;
          }
        } catch (error) {
          console.log(`Failed to connect to ${url}:`, error);
        }
      }

      if (validUrl) {
        await onSetIP(validUrl);
        updateCacheOnPreferenceChange("IP", validUrl);
        setToastMessage("Server connection successful!");
        setToastType("success");
        setShowToast(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        setToastMessage(
          "Unable to connect to the server. Please check the IP address and try again."
        );
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error setting server IP:", error);
      setToastMessage("Failed to connect to the server. Please try again.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="login-container">
        <div className="login-inner">
          <div className="admin-setup">
            <div className="username-title">Server Address</div>
          </div>
          <div className="input-container">
            <div className="username-label">
              Enter server IP or domain (e.g., 192.168.1.1 or example.com)
            </div>

            <div className="username-input">
              <input
                onChange={(e) => setSereverIP(e.target.value)}
                value={serverIP}
                type="text"
              />
            </div>
          </div>
          <div className="login-button-container" onClick={handleSetIP}>
            <div className="glass-button">
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.svg
                    key="spinner"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    viewBox="0 0 50 50"
                    style={{ width: 24, height: 24 }}
                    className="spinny"
                  >
                    <circle
                      cx="25"
                      cy="25"
                      r="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="1, 60"
                    />
                  </motion.svg>
                ) : (
                  <motion.span
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    Save
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServerIP;
