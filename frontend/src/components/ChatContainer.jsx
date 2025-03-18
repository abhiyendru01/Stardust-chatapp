import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import AudioMessage from "./AudioMessage";
import CallUI from "./CallUI"; // ✅ Import CallUI
import { io } from "socket.io-client";
import "./bubble.css";

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5001");

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  
  // ✅ Viewport height state (Fixes iOS keyboard issue)
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const adjustHeight = () => {
      setViewportHeight(window.visualViewport.height);
    };

    window.visualViewport.addEventListener("resize", adjustHeight);
    return () => window.visualViewport.removeEventListener("resize", adjustHeight);
  }, []);

  // ✅ Call State
  const [isInCall, setIsInCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const [callStatus, setCallStatus] = useState("");

  // ✅ Listen for Incoming Calls
  useEffect(() => {
    socket.on("incomingCall", ({ senderId }) => {
      setCaller(senderId);
      setCallStatus("Ringing...");
      setIsInCall(true);
    });

    socket.on("callAccepted", () => {
      setCallStatus("In Call");
    });

    socket.on("callEnded", () => {
      setIsInCall(false);
      setCaller(null);
      setCallStatus("");
    });

    socket.on("newMessage", (message) => {
      console.log("📩 [FRONTEND] Received new message:", message);
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callEnded");
      socket.off("newMessage");
    };
  }, []);

  // ✅ Handle Accept Call
  const handleAcceptCall = () => {
    socket.emit("answerCall", { senderId: caller });
    setCallStatus("In Call");
  };

  // ✅ Handle End Call
  const handleEndCall = () => {
    socket.emit("endCall", { senderId: authUser._id, receiverId: caller });
    setIsInCall(false);
    setCaller(null);
    setCallStatus("");
  };

  // ✅ Fetch messages
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id]);

  // ✅ Scroll to latest message
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ✅ If in a call, show Call UI **FULLSCREEN**
  if (isInCall) {
    return <CallUI caller={caller} callStatus={callStatus} onAcceptCall={handleAcceptCall} onEndCall={handleEndCall} />;
  }

  // ✅ Loading state
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  // ✅ Fallback if no user is selected
  if (!selectedUser) {
    return <div className="flex items-center justify-center h-full text-gray-500">Select a user to start chatting.</div>;
  }

  return (
    <div
      className="flex-1 flex flex-col h-full max-h-screen"
      style={{ height: viewportHeight }} // ✅ Fixes iOS keyboard issue
    >
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-10rem)]">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-image avatar">
                <div className="w-12 h-12 rounded-full border-2 border-primary">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              <div
                className={`${
                  message.senderId === authUser._id ? "bg-primary" : "bg-base-300/100"
                } p-4 rounded-lg shadow-lg w-auto max-w-[75%] md:max-w-[60%]`}
              >
                {/* Text Messages */}
                {message.text && (
                  <p className={`${message.senderId === authUser._id ? "text-primary-content" : "text-base-content"} break-words`}>
                    {message.text}
                  </p>
                )}

                {/* Images with fixed size constraints */}
                {message.image && (
                  <div className="overflow-hidden rounded-md shadow-md mt-3 max-w-full">
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="w-full h-auto max-w-[250px] sm:max-w-[300px] md:max-w-[350px] lg:max-w-[400px] object-contain rounded-lg"
                    />
                  </div>
                )}

                {/* Voice Notes */}
                {message.audio && (
                  <div className="w-full max-w-[250px] md:max-w-[300px]">
                    <AudioMessage audioSrc={message.audio} />
                  </div>
                )}

                {/* Timestamp */}
                <div className={`mt-1 text-xs ${message.senderId === authUser._id ? "text-primary-content/70" : "text-base-content/60"}`}>
                  <time className="text-[10px]">{formatMessageTime(message.createdAt)}</time>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
        )}
        <div ref={messageEndRef}></div>
      </div>
        <MessageInput />
    </div>
  );
};

export default ChatContainer;
