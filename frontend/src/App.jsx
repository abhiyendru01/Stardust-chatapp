import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import CallUI from "./components/CallUI";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { io } from "socket.io-client";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001');

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const location = useLocation();
  
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState("");

  const ringtoneRef = useRef(null); // 🔊 Reference for ringtone

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    socket.on("incomingCall", (data) => {
      console.log("📞 Incoming call:", data);
      setIncomingCall(data);
      setCallStatus("Incoming Call...");
      ringtoneRef.current.play(); // 🔊 Play ringtone when call arrives
    });

    socket.on("callEnded", () => {
      setIncomingCall(null);
      setCallStatus("");
      ringtoneRef.current.pause(); // 🔇 Stop ringtone when call ends
      ringtoneRef.current.currentTime = 0;
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callEnded");
    };
  }, []);

  const acceptCall = () => {
    if (incomingCall) {
      socket.emit("callAccepted", { callerId: incomingCall.callerId });
      setCallStatus("In Call...");
      ringtoneRef.current.pause(); // 🔇 Stop ringtone after accepting
    }
  };

  const declineCall = () => {
    if (incomingCall) {
      socket.emit("callRejected", { callerId: incomingCall.callerId });
      setIncomingCall(null);
      setCallStatus("");
      ringtoneRef.current.pause(); // 🔇 Stop ringtone when rejected
      ringtoneRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />

      {/* 🔊 Audio element for incoming call ringtone */}
      <audio ref={ringtoneRef} src="/incoming_call.mp3" preload="auto" />

      {/* ✅ Call UI appears when receiving a call */}
      {incomingCall && (
        <CallUI
          caller={incomingCall}
          callStatus={callStatus}
          isIncoming={true}
          onAcceptCall={acceptCall}
          onEndCall={declineCall}
        />
      )}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route
            path="/settings"
            element={
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} transition={{ duration: 0.5 }}>
                <SettingsPage />
              </motion.div>
            }
          />
          <Route
            path="/profile"
            element={
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} transition={{ duration: 0.3 }}>
                <ProfilePage />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>

      <Toaster />
    </div>
  );
};

export default App;
