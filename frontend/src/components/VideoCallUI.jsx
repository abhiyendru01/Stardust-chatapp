import { useEffect, useState, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { PhoneOff, Mic, MicOff, Video, VideoOff, ArrowLeft } from "lucide-react";

const VideoCallUI = ({ channelName, token, onEndCall, caller }) => {
  const agoraClient = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const initCall = async () => {
      agoraClient.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

      await agoraClient.current.join(import.meta.env.VITE_AGORA_APP_ID, channelName, token, null);

      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const localVideoTrack = await AgoraRTC.createCameraVideoTrack();

      if (localVideoRef.current) {
        localVideoTrack.play(localVideoRef.current);
      }

      await agoraClient.current.publish([localAudioTrack, localVideoTrack]);

      agoraClient.current.on("user-published", async (user, mediaType) => {
        await agoraClient.current.subscribe(user, mediaType);
        if (mediaType === "video" && remoteVideoRef.current) {
          user.videoTrack.play(remoteVideoRef.current);
        }
      });

      agoraClient.current.on("user-unpublished", (user) => {
        console.log("User left call:", user.uid);
      });
    };

    initCall();

    return () => {
      agoraClient.current.leave();
    };
  }, [channelName, token]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-green-100 to-green-200 text-white">
      {ArrowLeft({ size: 24, className: "absolute top-4 left-4" })}
      {/* Fullscreen Remote Video */}
      <div className="absolute inset-0 flex justify-center items-center">
        <div ref={remoteVideoRef} className="w-full h-full bg-black"></div>
      </div>

      {/* Mini Preview - Self Video */}
      <div className="absolute top-10 right-6 w-20 h-20 rounded-full border-2 border-white overflow-hidden">
        <div ref={localVideoRef} className="w-full h-full bg-gray-800"></div>
      </div>

      {/* Caller Info */}
      <div className="absolute top-14 text-center">
        <h2 className="text-2xl font-semibold">{caller?.fullName}</h2>
        <p className="text-lg text-gray-300">00:14:12</p>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-10 flex gap-6">
        <button onClick={() => setIsMuted(!isMuted)} className="bg-white/20 p-4 rounded-full">
          {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
        </button>
        <button onClick={() => setIsVideoOn(!isVideoOn)} className="bg-white/20 p-4 rounded-full">
          {isVideoOn ? <Video size={28} /> : <VideoOff size={28} />}
        </button>
        <button onClick={onEndCall} className="bg-red-600 p-4 rounded-full">
          <PhoneOff size={28} />
        </button>
      </div>
    </div>
  );
};

export default VideoCallUI;
