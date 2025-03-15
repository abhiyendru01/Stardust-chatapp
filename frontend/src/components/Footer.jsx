import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, User, MessageSquare, Phone } from "lucide-react";

const Footer = () => {
  const location = useLocation(); // Get the current route

  // Get correct left position for active tab
  const getActiveTabPosition = () => {
    if (location.pathname === "/settings") return "0%"; // 1️⃣ Settings
    if (location.pathname === "/") return "25%"; // 2️⃣ Chat
    if (location.pathname === "/calls") return "50%"; // 3️⃣ Calls
    if (location.pathname === "/profile") return "75%"; // 4️⃣ Profile
    return "25%"; // Default - Chat is selected
  };

  return (
    <div className="flex justify-center items-center relative w-full h-16 p-0">
      <div className="relative border border-base-300 w-full rounded-2xl flex shadow-lg bg-primary/25 backdrop-blur-md">
        
        {/* Active Tab Indicator - Slides to the correct position */}
        <motion.div
          className="absolute top-0 left-0 w-1/4 h-full bg-primary/20 border border-primary/40 rounded-2xl"
          animate={{ left: getActiveTabPosition() }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
        />

        {/* 1️⃣ Settings Tab */}
        <Link to="/settings" className="relative w-1/4 h-16 flex items-center justify-center">
          <Settings className="w-5 h-5 transition-all duration-300 top-4 absolute" />
        </Link>

        {/* 2️⃣ Chat/Home Tab */}
        <Link to="/" className="relative w-1/4 h-16 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 transition-all duration-300 top-4 absolute" />
        </Link>

        {/* 3️⃣ Recent Calls Tab */}
        <Link to="/calls" className="relative w-1/4 h-16 flex items-center justify-center">
          <Phone className="w-5 h-5 transition-all duration-300 top-4 absolute" />
        </Link>

        {/* 4️⃣ Profile Tab */}
        <Link to="/profile" className="relative w-1/4 h-16 flex items-center justify-center">
          <User className="w-5 h-5 transition-all duration-300 top-4 absolute" />
        </Link>
      </div>
    </div>
  );
};

export default Footer;
