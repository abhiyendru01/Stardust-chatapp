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
      <div className="flex flex-col items-center">
      <img src={caller?.profilePic || "/avatar.png"} alt={caller?.fullName} className="w-24 h-24 rounded-full" />
      <h2 className="text-2xl font-semibold mt-3">{caller?.fullName}</h2>
      <p className="text-lg">{callStatus}</p>
    </div>

  

      {/* 🔹 Call Controls */}
      <div className="absolute bottom-10 flex gap-6 bg-black/50 backdrop-blur-lg px-6 py-4 rounded-2xl">
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className="bg-base-200/90 p-4 rounded-full hover:bg-base-300"
        >
          {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
        </button>

        <button 
          onClick={() => setIsVideoOn(!isVideoOn)} 
          className="bg-base-200/90 p-4 rounded-full hover:bg-base-300"
        >
          <Video size={28} />
        </button>

        <button 
          onClick={toggleSpeaker} 
          className="bg-base-200/90 p-4 rounded-full hover:bg-base-300"
        >
          {isSpeakerOn ? <VolumeX size={28} /> : <Volume2 size={28} />}
        </button>

        <button 
          onClick={onEndCall} 
          className="bg-red-600 p-4 rounded-full hover:bg-red-700"
        >
          <PhoneOff size={28} />
        </button>
      </div>

      {/* 🔹 Incoming Call Actions */}
      {isIncoming && (
        <div className="absolute bottom-24 flex gap-6">
          <button 
            onClick={onAcceptCall} 
            className="bg-green-500 px-6 py-3 rounded-lg text-lg hover:bg-green-600"
          >
            <Phone />
          </button>
          <button 
            onClick={onEndCall} 
            className="bg-red-500 px-6 py-3 rounded-lg text-lg hover:bg-red-600"
          >
            <PhoneOff />
          </button>
        </div>
      )}
    </div>
  );
};

export default CallUI;
