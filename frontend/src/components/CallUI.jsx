import { useEffect, useState, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import axios from "axios";

const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID;

const VoiceCallUI = ({ 
  caller, 
  callStatus, 
  isIncoming, 
  onAcceptCall, 
  onEndCall, 
  channelName, 
  authUser 
}) => {
  const agoraClient = useRef(null);
  const localAudioTrack = useRef(null);
  const remoteAudioTrack = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  useEffect(() => {
    if (!channelName || !authUser) return;

    const joinAgoraChannel = async () => {
      try {
        const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/calls/token`, {
          channelName,
          uid: authUser._id,
        });

        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        await client.join(AGORA_APP_ID, channelName, data.token, authUser._id);
        agoraClient.current = client;

        localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
        await client.publish([localAudioTrack.current]);

        client.on("user-published", async (user, mediaType) => {
          if (mediaType === "audio") {
            await client.subscribe(user, mediaType);
            remoteAudioTrack.current = user.audioTrack;
            remoteAudioTrack.current.play();
          }
        });

      } catch (error) {
        console.error("❌ Error joining Agora voice call:", error);
      }
    };

    joinAgoraChannel();

    return () => {
      if (agoraClient.current) agoraClient.current.leave();
      if (localAudioTrack.current) localAudioTrack.current.stop();
    };
  }, [channelName, authUser]);

  // 🔊 Toggle Speaker Mode
  const toggleSpeaker = () => {
    if (remoteAudioTrack.current) {
      setIsSpeakerOn((prev) => !prev);
      remoteAudioTrack.current.setPlaybackDevice(isSpeakerOn ? "default" : "speaker");
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-base-300/90 backdrop-blur-lg text-base-content z-50">
      
      {/* Voice Call UI */}
      <div className="flex flex-col items-center">
        <img src={caller?.profilePic || "/avatar.png"} alt={caller?.fullName} className="w-24 h-24 rounded-full" />
        <h2 className="text-2xl font-semibold mt-3">{caller?.fullName}</h2>
        <p className="text-lg">{callStatus}</p>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-6 flex gap-5 bg-black/30 backdrop-blur-lg px-6 py-4 rounded-3xl">
        {/* Mute Button */}
        <button 
          onClick={() => {
            setIsMuted(!isMuted);
            localAudioTrack.current.setMuted(!isMuted);
          }} 
          className="bg-base-200 p-4 rounded-full hover:bg-base-100"
        >
          {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
        </button>

        {/* Speaker Toggle Button */}
        <button 
          onClick={toggleSpeaker} 
          className="bg-base-200 p-4 rounded-full hover:bg-base-300"
        >
          {isSpeakerOn ? <VolumeX size={28} /> : <Volume2 size={28} />}
        </button>

        {/* End Call Button */}
        <button 
          onClick={onEndCall} 
          className="bg-red-600/90 p-4 rounded-full hover:bg-red-700"
        >
          <PhoneOff size={28} />
        </button>
      </div>

      {/* Incoming Call UI */}
      {isIncoming && (
        <div className="absolute bottom-24 flex gap-6">
          <button 
            onClick={onAcceptCall} 
            className="bg-green-500 px-6 py-3 rounded-lg text-lg hover:bg-green-600"
          >
            Accept
          </button>
          <button 
            onClick={onEndCall} 
            className="bg-red-500 px-6 py-3 rounded-lg text-lg hover:bg-red-600"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceCallUI;
