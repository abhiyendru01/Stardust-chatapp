import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
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

  const [isInCall, setIsInCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const [callStatus, setCallStatus] = useState("");
  const [longPressMessageId, setLongPressMessageId] = useState(null);

  useEffect(() => {
    socket.on("incomingCall", ({ senderId }) => {
      setCaller(senderId);
      setCallStatus("Ringing...");
      setIsInCall(true);
    });

    socket.on("callAccepted", () => setCallStatus("In Call"));

    socket.on("callEnded", () => {
      setIsInCall(false);
      setCaller(null);
      setCallStatus("");
    });

    socket.on("newMessage", (message) => {
      if (message.senderId === selectedUser?._id || message.receiverId === selectedUser?._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callEnded");
      socket.off("newMessage");
    };
  }, [selectedUser?._id, setMessages]);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ✅ Fix iOS keyboard issue
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const chatWrapper = document.querySelector("#chat-wrapper");
    const inputWrapper = document.querySelector("#message-input-wrapper");

    const onResize = () => {
      const viewportHeight = window.visualViewport.height;
      const keyboardHeight = window.innerHeight - viewportHeight;

      if (chatWrapper && inputWrapper) {
        chatWrapper.style.paddingBottom = `${keyboardHeight + 60}px`;
        inputWrapper.style.bottom = `${keyboardHeight}px`;
      }

      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    const reset = () => {
      if (chatWrapper) chatWrapper.style.paddingBottom = "6rem";
      if (inputWrapper) inputWrapper.style.bottom = "0px";
    };

    window.visualViewport.addEventListener("resize", onResize);
    window.visualViewport.addEventListener("scroll", onResize);
    window.addEventListener("blur", reset);
    window.addEventListener("focus", onResize);

    return () => {
      window.visualViewport.removeEventListener("resize", onResize);
      window.visualViewport.removeEventListener("scroll", onResize);
      window.removeEventListener("blur", reset);
      window.removeEventListener("focus", onResize);
    };
  }, []);

  if (isInCall) {
    return (
      <CallUI
        caller={caller}
        callStatus={callStatus}
        onAcceptCall={() => setCallStatus("In Call")}
        onEndCall={() => setIsInCall(false)}
      />
    );
  }

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a user to start chatting.
      </div>
    );
  }

  const handleLongPress = (messageId) => setLongPressMessageId(messageId);

  const deleteMessage = async (messageId) => {
    try {
      const response = await axios.delete(`/api/messages/delete/${messageId}`);
      if (response.status === 200) {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
        toast.success("Message deleted successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete the message.");
    }
  };

  return (
    <div id="chat-wrapper" className="flex-1 flex flex-col h-full max-h-screen">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-10rem)]">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              onContextMenu={(e) => {
                e.preventDefault();
                handleLongPress(message._id);
              }}
            >
              <div className="chat-image avatar">
                <div className="w-12 h-12 rounded-full border-2 border-primary">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile"
                  />
                </div>
              </div>

              <div className={`${message.senderId === authUser._id ? "bg-primary" : "bg-base-300"} p-4 rounded-lg shadow-lg max-w-[75%]`}>
                {message.text && (
                  <p className={`${message.senderId === authUser._id ? "text-primary-content" : "text-base-content"} break-words`}>
                    {message.text}
                  </p>
                )}

                {message.image && (
                  <div className="overflow-hidden rounded-md shadow-md mt-3 max-w-full">
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="w-full h-auto max-w-[300px] object-contain rounded-lg"
                    />
                  </div>
                )}

                {message.audio && (
                  <div className="w-full max-w-[250px] md:max-w-[300px]">
                    <AudioMessage audioSrc={message.audio} />
                  </div>
                )}

                <div className={`mt-1 text-xs ${message.senderId === authUser._id ? "text-primary-content/70" : "text-base-content/60"}`}>
                  <time className="text-[10px]">{formatMessageTime(message.createdAt)}</time>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
        )}

        {longPressMessageId && (
          <div className="fixed left-1/2 transform -translate-x-1/2 p-4 bg-base-200/80 shadow-lg rounded-xl z-40">
            <button
              onClick={() => deleteMessage(longPressMessageId)}
              className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
            >
              Delete Message
            </button>
          </div>
        )}

        <div ref={messageEndRef}></div>
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
