import { useEffect, useState, useRef } from "react";
import { Phone, Video, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { saveCallLog } from "../services/callService";
import { io } from "socket.io-client";
import VideoCallUI from "./VideoCallUI";
import CallUI from "./CallUI"; // ✅ Added CallUI for audio calls

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5001");

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const [videoCall, setVideoCall] = useState(false);
  const [audioCall, setAudioCall] = useState(false); // ✅ Added state for audio calls
  const [incomingCall, setIncomingCall] = useState(null);
  const [agoraToken, setAgoraToken] = useState(null);
  const [callStatus, setCallStatus] = useState("");

  const ringingRef = useRef(null);
  const incomingRingtoneRef = useRef(null);

  // ✅ Fetch Agora Token
  const fetchAgoraToken = async () => {
    if (!selectedUser?._id) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/calls/agora-token/${selectedUser._id}`);
      const data = await response.json();
      setAgoraToken(data.token);
    } catch (error) {
      console.error("❌ Error fetching Agora token:", error);
    }
  };

  // ✅ Handle Audio Call
  const handleCall = () => {
    if (!selectedUser?._id) return;
    setAudioCall(true); // ✅ Show CallUI
    socket.emit("call", {
      receiverId: selectedUser._id,
      callerId: authUser._id,
      callerName: authUser.fullName,
      callerProfile: authUser.profilePic,
      callType: "audio", // ✅ Ensure call type is set
    });
    setCallStatus("Calling...");
    ringingRef.current?.play();
  };

  // ✅ Handle Video Call
  const handleVideoCall = async () => {
    await fetchAgoraToken();
    setVideoCall(true);
  };

  // ✅ Handle Ending Call
  const handleEndCall = () => {
    setAudioCall(false);
    setIncomingCall(null);
    setCallStatus("");
    setVideoCall(false);

    socket.emit("endCall", {
      callerId: authUser._id,
      receiverId: selectedUser?._id || incomingCall?.callerId,
    });

    saveCallLog({
      caller: authUser._id,
      receiver: selectedUser?._id || incomingCall?.callerId,
      callType: videoCall ? "video" : "audio",
      status: "completed",
      duration: 120,
    });

    if (ringingRef.current) {
      ringingRef.current.pause();
      ringingRef.current.currentTime = 0;
    }
    if (incomingRingtoneRef.current) {
      incomingRingtoneRef.current.pause();
      incomingRingtoneRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    socket.on("incomingCall", (data) => {
      setIncomingCall(data);
      setCallStatus("Incoming Call...");
      incomingRingtoneRef.current?.play();
    });

    socket.on("callEnded", () => {
      setAudioCall(false);
      setIncomingCall(null);
      setCallStatus("");
      ringingRef.current?.pause();
      incomingRingtoneRef.current?.pause();
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callEnded");
    };
  }, []);

  return (
    <>
      {/* ✅ Show Call UI when making or receiving an audio call */}
      {audioCall && (
        <CallUI
          caller={selectedUser || incomingCall}
          callStatus={callStatus}
          isIncoming={!!incomingCall}
          onAcceptCall={() => {
            setCallStatus("In Call...");
            setAudioCall(true);
          }}
          onEndCall={handleEndCall}
        />
      )}

      {/* ✅ Show Video Call UI when making a video call */}
      {videoCall && agoraToken && (
        <VideoCallUI channelName={selectedUser?._id} token={agoraToken} onEndCall={handleEndCall} />
      )}

      <audio ref={ringingRef} src="./audio/ringing.mp3" preload="auto" loop />
      <audio ref={incomingRingtoneRef} src="./audio/incoming_call.mp3" preload="auto" loop />

      <div className="p-3.5 border-b bg-base-200 border-base-300 backdrop-blur-md flex justify-between items-center">
        <button onClick={() => setSelectedUser(null)} className="p-2 rounded-3xl hover:bg-base-300">
          <ArrowLeft className="h-5 w-5 text-base-content" />
        </button>

        <div className="flex flex-col items-center">
          <h3 className="font-bold text-lg">{selectedUser?.fullName}</h3>
          <p className="text-sm text-base-content/70">
            {onlineUsers.includes(selectedUser?._id) ? "Online" : "Offline"}
          </p>
          {callStatus && <p className="text-sm text-gray-500">{callStatus}</p>}
        </div>

        <div className="flex gap-2">
          {/* ✅ Video Call Button */}
          <button onClick={handleVideoCall} className="rounded-lg p-3 bg-base-300/80 hover:bg-base-300 text-base-content">
            <Video className="w-5 h-5 text-base-content/70" />
          </button>

          {/* ✅ Audio Call Button */}
          <button onClick={handleCall} className="rounded-lg p-3 bg-base-300/80 hover:bg-base-300 text-base-content">
            <Phone className="w-5 h-5 text-base-content/70" />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
