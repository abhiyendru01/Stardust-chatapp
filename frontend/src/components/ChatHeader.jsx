import { useState, useEffect } from "react";
import { Phone } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { io } from "socket.io-client";
import CallUI from "./CallUI";

const socket = io("http://localhost:5000");

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const [inCall, setInCall] = useState(false);
  const [callStatus, setCallStatus] = useState("");
  const [caller, setCaller] = useState(null);
  const [isReceivingCall, setIsReceivingCall] = useState(false);

  useEffect(() => {
    // Listen for incoming call
    socket.on("incomingCall", ({ senderId, senderInfo }) => {
      console.log("📲 Incoming call from:", senderId);
      setCaller(senderInfo);
      setCallStatus("Ringing...");
      setIsReceivingCall(true);
    });

    // Listen for call accepted event
    socket.on("callAccepted", () => {
      setCallStatus("In Call...");
    });

    // Listen for call rejection
    socket.on("callRejected", () => {
      setCallStatus("Call Rejected");
      setTimeout(() => setInCall(false), 2000);
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callRejected");
    };
  }, []);

  const handleCall = () => {
    if (selectedUser && selectedUser._id) {
      console.log("📞 Calling:", selectedUser._id);
      socket.emit("call", {
        senderId: authUser._id,
        receiverId: selectedUser._id,
        senderInfo: authUser,
      });
      setCaller(selectedUser);
      setCallStatus("Calling...");
      setInCall(true);
    }
  };

  const handleEndCall = () => {
    setInCall(false);
    setCaller(null);
    socket.emit("endCall", { receiverId: selectedUser._id });
  };

  return (
    <>
      {inCall && (
        <CallUI
          caller={caller}
          callStatus={callStatus}
          isIncoming={isReceivingCall}
          onAcceptCall={() => {
            setCallStatus("In Call...");
            setIsReceivingCall(false);
            socket.emit("acceptCall", { senderId: caller._id, receiverId: authUser._id });
          }}
          onEndCall={handleEndCall}
        />
      )}

      <div className="p-3.5 border-b bg-base-200 border-base-300 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedUser(null)} className="p-2 rounded-3xl hover:bg-base-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/70" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 111.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="flex flex-col items-center">
            <h3 className="font-bold">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">{onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}</p>
          </div>

          <button onClick={handleCall} className="rounded-lg px-4 py-3 bg-base-300/55 hover:bg-base-300 text-base-content">
            <Phone className="w-4 h-5 primary" />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
