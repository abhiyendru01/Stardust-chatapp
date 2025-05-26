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
    <div className="fixed bottom-0 left-0 w-full flex justify-center items-center z-20">
      <div
        className="
          relative
          w-full
          max-w-[1200px]
          h-16
          sm:h-20
          bg-primary/5
          backdrop-blur-lg
          border-t
          border-primary/60
          rounded-t-2xl
          shadow-xl
          flex
          items-center
          justify-between
          mx-2
          sm:mx-4
          pb-[env(safe-area-inset-bottom)]
          box-border
        "
      >
        {/* Active Tab Indicator */}
        <motion.div
          className="
            absolute
            top-0
            left-0
            w-1/5
            h-full
            bg-gradient-to-r
            from-primary/20
            to-secondary/30
            border
            border-primary/30
            rounded-2xl
            shadow-md
          "
          animate={{ left: getActiveTabPosition() }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
        />

        {/* Settings Tab */}
        <Link
          to="/settings"
          className="relative w-1/5 h-full flex items-center justify-center"
        >
          <Settings
            className="
              w-5
              h-5
              sm:w-6
              sm:h-6
              text-base-content/80
              hover:text-primary
              transition-all
              duration-300
            "
          />
        </Link>

        {/* Chat/Home Tab */}
        <Link
          to="/"
          className="relative w-1/5 h-full flex items-center justify-center"
        >
          <MessageSquare
            className="
              w-5
              h-5
              sm:w-6
              sm:h-6
              text-base-content/80
              hover:text-primary
              transition-all
              duration-300
            "
          />
        </Link>

        {/* AI/Bot Highlighted Tab */}
        <Link
          to="/ai"
          className="
            relative
            w-1/5
            h-full
            flex
            items-center
            justify-center
            -mt-4
            sm:-mt-6
          "
        >
          <div className="relative flex items-center justify-center">
            <div
              className="
                w-[14vw]
                h-[14vw]
                max-w-16
                max-h-16
                sm:w-[12vw]
                sm:h-[12vw]
                sm:max-w-20
                sm:max-h-20
                rounded-full
                border-4
                border-secondary
                shadow-2xl
                bg-gradient-to-r
                from-secondary
                to-primary/50
              "
            >
              {/* Inner Glow */}
              <div
                className="
                  absolute
                  inset-0
                  rounded-full
                  bg-secondary/30
                  opacity-60
                  blur-md
                "
              ></div>
              {/* Bot Icon */}
              <div
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                "
              >
                <Bot
                  className="
                    w-6
                    h-6
                    sm:w-8
                    sm:h-8
                    text-base-content/80
                    drop-shadow-md
                  "
                />
              </div>
            </div>
          </div>
        </Link>

        {/* Calls Tab */}
        <Link
          to="/calls"
          className="relative w-1/5 h-full flex items-center justify-center"
        >
          <Phone
            className="
              w-5
              h-5
              sm:w-6
              sm:h-6
              text-base-content/80
              hover:text-primary
              transition-all
              duration-300
            "
          />
        </Link>

        {/* Profile Tab */}
        <Link
          to="/profile"
          className="relative w-1/5 h-full flex items-center justify-center"
        >
          <User
            className="
              w-5
              h-5
              sm:w-6
              sm:h-6
              text-base-content/80
              hover:text-primary
              transition-all
              duration-300
            "
          />
        </Link>
      </div>
    </div>
  );
};

export default Footer;