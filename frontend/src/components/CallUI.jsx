import { useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { PhoneOff, Video, Mic, MicOff, Phone } from "lucide-react";
import axios from "axios";

const CallUI = ({ caller, callStatus, isIncoming, onAcceptCall, onEndCall, channelName, authUser }) => {
  const [agoraClient, setAgoraClient] = useState(null);
  const [localTracks, setLocalTracks] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden"; // Prevent scrolling during call
    return () => {
      document.body.style.overflow = "auto"; // Restore scrolling when call ends
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
        console.error("Error joining Agora channel:", error);
      }
    };

    joinAgoraChannel();

    return () => {
      localTracks.forEach(track => track.stop() && track.close());
      agoraClient && agoraClient.leave();
    };
  }, [channelName, authUser]);

  return (
    <div className="fixed inset-0 bg-base-300 bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center text-base-content z-50">
      <div className="flex flex-col items-center">
        <img src={caller?.profilePic || "/avatar.png"} alt={caller?.fullName} className="w-24 h-24 rounded-full" />
        <h2 className="text-2xl font-semibold mt-3">{caller?.fullName}</h2>
        <p className="text-lg">{callStatus}</p>
      </div>

      <div className="flex gap-6 mt-10">
        <button onClick={() => setIsMuted(!isMuted)} className="bg-gray-600 p-4 rounded-full">
          {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
        </button>

        <button onClick={() => setIsVideoOn(!isVideoOn)} className="bg-gray-600 p-4 rounded-full">
          <Video size={28} />
        </button>

        <button onClick={onEndCall} className="bg-red-600 p-4 rounded-full">
          <PhoneOff size={28} />
        </button>
      </div>

      {isIncoming && (
        <div className="flex gap-6 mt-6">
          <button onClick={onAcceptCall} className="bg-green-500 px-6 py-3 rounded-lg">
            <Phone />
          </button>
          <button onClick={onEndCall} className="bg-red-500 px-6 py-3 rounded-lg">
            <PhoneOff />
          </button>
        </div>
      )}
    </div>
  );
};

export default CallUI;
