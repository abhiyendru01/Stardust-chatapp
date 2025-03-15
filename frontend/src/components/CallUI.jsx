import { useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { PhoneOff, Video, Mic, MicOff, Phone, Volume2, VolumeX } from "lucide-react";
import axios from "axios";

const CallUI = ({ 
  caller, 
  callStatus, 
  isIncoming, 
  onAcceptCall, 
  onEndCall, 
  channelName, 
  authUser 
}) => {
  const [agoraClient, setAgoraClient] = useState(null);
  const [localTracks, setLocalTracks] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden"; // Prevent scrolling

    const enterFullScreen = async () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen().catch(() => {}); // For Safari
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen().catch(() => {}); // For IE
      }
    };
    enterFullScreen();

    return () => {
      document.body.style.overflow = "auto"; // Restore scrolling
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (!channelName || !authUser) return;

    const joinAgoraChannel = async () => {
      try {
        const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/calls/token`, {
          channelName,
          uid: authUser._id,
        });

        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        await client.join(import.meta.env.VITE_AGORA_APP_ID, channelName, data.token, authUser._id);
        setAgoraClient(client);

        const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        setLocalTracks([localAudioTrack, localVideoTrack]);

        await client.publish([localAudioTrack, localVideoTrack]);
      } catch (error) {
        console.error("❌ Error joining Agora channel:", error);
      }
    };

    joinAgoraChannel();

    return () => {
      localTracks.forEach(track => track.stop() && track.close());
      agoraClient && agoraClient.leave();
    };
  }, [channelName, authUser]);

  // 🔊 Toggle Speaker Mode
  const toggleSpeaker = () => {
    if (agoraClient) {
      setIsSpeakerOn((prev) => !prev);
      agoraClient.remoteUsers.forEach(user => {
        if (user.audioTrack) {
          user.audioTrack.setPlaybackDevice(isSpeakerOn ? "default" : "speaker");
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 w-full h-screen flex flex-col items-center justify-center bg-base-300 bg-opacity-90 backdrop-blur-lg text-base-content z-50">
      
      {/* 📌 Caller Info */}
      <div className="flex flex-col items-center text-center px-4 sm:px-8">
        <img 
          src={caller?.profilePic || "/avatar.png"} 
          alt={caller?.fullName} 
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-lg"
        />
        <h2 className="text-lg sm:text-2xl font-semibold mt-2 sm:mt-3">{caller?.fullName}</h2>
        <p className="text-sm sm:text-lg opacity-80">{callStatus}</p>
      </div>

      {/* 🔹 Call Controls */}
      <div className="absolute bottom-6 sm:bottom-8 flex flex-wrap justify-center gap-4 sm:gap-6 bg-black/50 backdrop-blur-lg px-6 py-3 sm:py-4 rounded-xl">
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className="btn btn-circle bg-base-200 hover:bg-base-300"
        >
          {isMuted ? <MicOff size={22} sm:size={28} /> : <Mic size={22} sm:size={28} />}
        </button>

        <button 
          onClick={() => setIsVideoOn(!isVideoOn)} 
          className="btn btn-circle bg-base-200 hover:bg-base-300"
        >
          {isVideoOn ? <Video size={22} sm:size={28} /> : <Video className="opacity-50" />}
        </button>

        <button 
          onClick={toggleSpeaker} 
          className="btn btn-circle bg-base-200 hover:bg-base-300"
        >
          {isSpeakerOn ? <VolumeX size={22} sm:size={28} /> : <Volume2 size={22} sm:size={28} />}
        </button>

        <button 
          onClick={onEndCall} 
          className="btn btn-circle bg-red-600 hover:bg-red-700"
        >
          <PhoneOff size={22} sm:size={28} />
        </button>
      </div>

      {/* 🔹 Incoming Call Actions */}
      {isIncoming && (
        <div className="absolute bottom-20 sm:bottom-24 flex gap-4 sm:gap-6">
          <button 
            onClick={onAcceptCall} 
            className="btn btn-success px-5 py-2 sm:px-6 sm:py-3 rounded-lg text-md sm:text-lg"
          >
            <Phone />
          </button>
          <button 
            onClick={onEndCall} 
            className="btn btn-error px-5 py-2 sm:px-6 sm:py-3 rounded-lg text-md sm:text-lg"
          >
            <PhoneOff />
          </button>
        </div>
      )}
    </div>
  );
};

export default CallUI;
