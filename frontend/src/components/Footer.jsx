import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, User, MessageSquare, Phone, Bot } from "lucide-react";

const Footer = () => {
  const location = useLocation();

  const getActiveTabPosition = () => {
    if (location.pathname === "/settings") return "0%";
    if (location.pathname === "/") return "20%";
    if (location.pathname === "/ai") return "40%";
    if (location.pathname === "/calls") return "60%";
    if (location.pathname === "/profile") return "80%";
    return "20%";
  };

  return (
    <div className="flex justify-center items-center relative w-full h-20">
      <div className="relative border-t border-primary/70 w-full rounded-t-2xl flex shadow-lg bg-primary/10 backdrop-blur-md z-index-8 ">
        {/* Active Tab Indicator */}
        <motion.div
          className="absolute top-0 left-0 w-1/5 h-full bg-primary/20 border border-primary/20 rounded-2xl"
          animate={{ left: getActiveTabPosition() }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
        />
        {/* 1️⃣ Settings Tab */}
        <Link to="/settings" className="relative w-1/5 h-20 flex items-center justify-center">
          <Settings className="w-6 h-6 text-secndary-content/70" />
        </Link>

        {/* 2️⃣ Chat/Home Tab */}
        <Link to="/" className="relative w-1/5 h-20 flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-secndary-content/70" />
        </Link>

        {/* 3️⃣ AI Tab */}
          <Link to="/ai" className="relative w-1/5 h-24 -mt-4 flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-primary/20 bg-gradient-to-r from-secondary/40 to-primary/50 shadow-xl backdrop-blur-3xl z-index-20">
                
                {/* Inner Glow */}
                <div className="absolute inset-0 rounded-full bg-secondary/40 opacity-50 blur-md"></div>
                {/* Bot Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
            <Bot className="w-7 h-7 text-secndary-content/90" />
                </div>
              </div>
            </div>
          </Link>

          {/* 4️⃣ Recent Calls Tab */}
        <Link to="/calls" className="relative w-1/5 h-20 flex items-center justify-center">
          <Phone className="w-6 h-6 text-secndary-content/70" />
        </Link>

        {/* 5️⃣ Profile Tab */}
        <Link to="/profile" className="relative w-1/5 h-20 flex items-center justify-center">
          <User className="w-6 h-6 text-secndary-content/70" />
        </Link>
      </div>
    </div>
  );
};
export default Footer;
