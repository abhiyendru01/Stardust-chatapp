import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import CallUI from "./components/CallUI";
import FriendRequests from "./pages/FriendRequests";
import AIChatPage from "./pages/Ai-Chat"; // Import your AI Chat Page
import RecentCalls from "./pages/RecentCalls";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { io } from "socket.io-client";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const backendUrl =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

const socket = io(backendUrl, {
  transports: ["websocket", "polling"],
  withCredentials: true,
  path: "/socket.io/",
});



const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const location = useLocation();
  
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState("");

  const ringtoneRef = useRef(null); 

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    socket.on("incomingCall", (data) => {
      console.log("📞 Incoming call:", data);
      setIncomingCall(data);
      setCallStatus("Incoming Call...");
      ringtoneRef.current.play(); 
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
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log("✅ Service Worker Registered:", registration);
      })
      .catch((error) => {
        console.error("❌ Service Worker Registration Failed:", error);
      });
  }
  
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
          <Route path="/settings" element={<SettingsPage /> }/>
          <Route path="/calls" element={<RecentCalls />} />
          <Route path="/friend-requests" element={ <FriendRequests />} />
          <Route path="/profile" element={ <ProfilePage />}/>
        <Route
            path="/ai"
            element={
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} transition={{ duration: 0.3 }}>
                <AIChatPage />
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
