import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import AudioMessage from "./AudioMessage";
import CallUI from "./CallUI"; 
import { io } from "socket.io-client";
import "./bubble.css";

const socket = io("/"); 

const ChatContainer = () => {
  const {
    messages,
    setMessages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

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

      if (message.senderId === selectedUser?._id || message.receiverId === selectedUser?._id) {
        setMessages((prevMessages) => [...prevMessages, message]); 
      }
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callEnded");
      socket.off("newMessage");
    };
  }, [selectedUser?._id, setMessages]);

  // ✅ Fetch messages when user is selected
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
    return <CallUI caller={caller} callStatus={callStatus} onAcceptCall={() => setCallStatus("In Call")} onEndCall={() => setIsInCall(false)} />;
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
    <div className="flex-1 flex flex-col h-full max-h-screen">
    {/* Chat Header: Add sticky to keep it fixed */}
    <div className="sticky top-0 z-10 bg-base-100 p-0">
      <ChatHeader />
    </div>

    {/* Messages Section: Make sure it is scrollable and leaves space for the sticky header */}
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
                  src={message.senderId === authUser._id ? authUser.profilePic || "/avatar.png" : selectedUser.profilePic || "/avatar.png"}
                  alt="profile pic"
                />
              </div>
            </div>

            <div className={`${message.senderId === authUser._id ? "bg-primary" : "bg-base-300/100"} p-4 rounded-lg shadow-lg w-auto max-w-[75%] md:max-w-[60%]`}>
              {/* Text Messages */}
              {message.text && (
                <p className={`${message.senderId === authUser._id ? "text-primary-content" : "text-base-content"} break-words`}>
                  {message.text}
                </p>
              )}

              {/* Images with fixed size constraints */}
              {message.image && (
                <div className="overflow-hidden rounded-md shadow-md mt-3 max-w-full">
                  <img src={message.image} alt="Attachment" className="w-full h-auto max-w-[250px] sm:max-w-[300px] md:max-w-[350px] lg:max-w-[400px] object-contain rounded-lg" />
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
