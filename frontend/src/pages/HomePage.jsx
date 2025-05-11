import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-screen w-full bg-base-100 relative">
      {/* ✅ Show Navbar only on desktop */}
      {!isMobile && <Navbar />}

      <div className={`flex items-center justify-center w-full ${isMobile ? "pt-0" : "pt-16"} px-0 2lg:px-20`}>
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-screen-xl h-full relative">
          <div className="flex flex-col md:flex-row h-full rounded-lg overflow-hidden">
            {/* ✅ Sidebar should be hidden on mobile when chat is open */}
            {!selectedUser || !isMobile ? <Sidebar className="md:w-full w-full md:block flex-1" /> : null}

            {/* ✅ ChatContainer should be completely fullscreen on mobile */}
            {selectedUser ? (
              <div className="fixed inset-0 w-full h-full bg-base-100 z-50 md:relative">
                <ChatContainer className="h-full w-full" />
              </div>
            ) : (
              <NoChatSelected className="h-full w-full" />
            )}
          </div>
        </div>
      </div>

      {/* ✅ Footer should only be visible when no chat is selected */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0`}>
        {!selectedUser && <Footer />}
      </div>
    </div>
  );
};

export default HomePage;
