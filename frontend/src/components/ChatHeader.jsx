import { useEffect, useState, useRef } from "react";
import { Phone, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { saveCallLog } from "../services/callService";
import { io } from "socket.io-client";
import CallUI from "./CallUI";

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001');

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const [inCall, setInCall] = useState(false);
  const [callStatus, setCallStatus] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);

  const ringingRef = useRef(null); // 🔊 Outgoing call ringtone
  const incomingRingtoneRef = useRef(null); // 🔊 Incoming call ringtone

  /** ✅ HANDLE CALL INITIATION */
  const handleCall = () => {
    if (selectedUser && selectedUser._id) {
      console.log("📞 Calling:", selectedUser._id);
      socket.emit("call", {
        receiverId: selectedUser._id,
        callerId: authUser._id,
        callerName: authUser.fullName,
        callerProfile: authUser.profilePic,
      });

      setInCall(true);
      setCallStatus("Calling...");
      ringingRef.current.play(); // 🔊 Play ringing sound for caller
    }
  };

  /** ✅ HANDLE ENDING CALL */
  const handleEndCall = () => {
    setInCall(false);
    setIncomingCall(null);
    setCallStatus("");

    socket.emit("endCall", {
      callerId: authUser._id,
      receiverId: selectedUser?._id || incomingCall?.callerId,
    });
    const callData = {
      caller: authUser._id,
      receiver: selectedUser?._id || incomingCall?.callerId,
      callType: "audio", // Change based on call type
      status: "completed", // Change as needed
      duration: 120, // Replace with actual duration
    };
  
    saveCallLog(callData);
    // 🔇 Stop all sounds
    ringingRef.current.pause();
    ringingRef.current.currentTime = 0;
    incomingRingtoneRef.current.pause();
    incomingRingtoneRef.current.currentTime = 0;
  };

  /** ✅ HANDLE CALL ACCEPTANCE */
  const acceptCall = () => {
    if (incomingCall) {
      console.log("✅ Call accepted:", incomingCall.callerId);
      socket.emit("callAccepted", { callerId: incomingCall.callerId });
      setCallStatus("In Call...");
      setInCall(true);
      incomingRingtoneRef.current.pause(); // 🔇 Stop ringtone
      setIncomingCall(null);
    }
  };

  /** ✅ HANDLE CALL REJECTION */
  const declineCall = () => {
    if (incomingCall) {
      console.log("❌ Call rejected:", incomingCall.callerId);
      socket.emit("callRejected", { callerId: incomingCall.callerId });
      setIncomingCall(null);
      setCallStatus("");
      incomingRingtoneRef.current.pause(); // 🔇 Stop ringtone
      incomingRingtoneRef.current.currentTime = 0;
    }
  };

  /** ✅ LISTEN FOR SOCKET EVENTS */
  useEffect(() => {
    socket.on("incomingCall", (data) => {
      console.log("📞 Incoming call received:", data);
      
      setIncomingCall(data);
      setCallStatus("Incoming Call...");
      incomingRingtoneRef.current.play();
    });

    socket.on("callAccepted", () => {
      console.log("✅ Call accepted!");
      setCallStatus("In Call...");
      ringingRef.current.pause();
    });

    socket.on("callRejected", () => {
      console.log("❌ Call Rejected!");
      setInCall(false);
      setIncomingCall(null);
      setCallStatus("");
      ringingRef.current.pause();
    });

    socket.on("callEnded", () => {
      console.log("🔴 Call Ended!");
      setInCall(false);
      setIncomingCall(null);
      setCallStatus("");
      ringingRef.current.pause();
      incomingRingtoneRef.current.pause();
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callRejected");
      socket.off("callEnded");
    };
  }, []);

  return (
    <>
      {/* ✅ CALL UI FOR BOTH CALLER & RECEIVER */}
      {inCall && (
        <CallUI
          caller={selectedUser || incomingCall}
          callStatus={callStatus}
          isIncoming={!selectedUser}
          onAcceptCall={acceptCall}
          onEndCall={handleEndCall}
        />
      )}

      {incomingCall && !inCall && (
        <CallUI
          caller={incomingCall}
          callStatus={callStatus}
          isIncoming={true}
          onAcceptCall={acceptCall}
          onEndCall={declineCall}
        />
      )}

      {/* 🔊 AUDIO ELEMENTS FOR RINGTONES */}
      <audio ref={ringingRef} src="./audio/ringing.mp3" preload="auto" loop />
      <audio ref={incomingRingtoneRef} src="./audio/incoming_call.mp3" preload="auto" loop />

      {/* ✅ CHAT HEADER UI */}
      <div className="p-3.5 border-b bg-base-200 border-base-300 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedUser(null)} className="p-2 rounded-3xl hover:bg-base-300">
            <ArrowLeft className="h-5 w-5 text-base-content" />
          </button>

          <div className="flex flex-col items-center">
            <h3 className="font-bold">{selectedUser?.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser?._id) ? "Online" : "Offline"}
            </p>
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
