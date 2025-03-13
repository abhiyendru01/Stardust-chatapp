import { useEffect, useState, useRef } from "react";
import { PhoneOff, Video, Mic, MicOff, VideoOff } from "lucide-react";
import AgoraRTC from "agora-rtc-sdk-ng";

const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID;

const VideoCallUI = ({ channelName, token, onEndCall }) => {
  const agoraClient = useRef(null);
  const localTracks = useRef({ audioTrack: null, videoTrack: null });
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  useEffect(() => {
    if (!token) return;

    const initCall = async () => {
      agoraClient.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

      await agoraClient.current.join(AGORA_APP_ID, channelName, token, null);

      localTracks.current.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localTracks.current.videoTrack = await AgoraRTC.createCameraVideoTrack();

      await agoraClient.current.publish(Object.values(localTracks.current));

      agoraClient.current.on("user-published", async (user, mediaType) => {
        await agoraClient.current.subscribe(user, mediaType);
        if (mediaType === "video") {
          setRemoteUsers((prevUsers) => [...prevUsers, user]);
        }
        if (mediaType === "audio") {
          user.audioTrack.play();
        }
      });

      agoraClient.current.on("user-unpublished", (user) => {
        setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
      });
    };

    initCall();

    return () => {
      if (agoraClient.current) {
        agoraClient.current.leave();
      }
      Object.values(localTracks.current).forEach((track) => track.stop());
    };
  }, [channelName, token]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white">
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {remoteUsers.map((user) => (
          <div key={user.uid} className="absolute top-5 left-5 w-32 h-32 bg-gray-800 rounded-md">
            <video ref={(ref) => ref && user.videoTrack.play(ref)} className="w-full h-full rounded-md" />
          </div>
        ))}

        {localTracks.current.videoTrack && isVideoOn && (
          <div className="absolute bottom-5 right-5 w-32 h-32 bg-gray-800 rounded-md">
            <video ref={(ref) => ref && localTracks.current.videoTrack.play(ref)} className="w-full h-full rounded-md" />
          </div>
        )}
      </div>

      <div className="absolute bottom-10 flex gap-6">
        <button onClick={() => setIsMuted(!isMuted)} className="bg-gray-700 p-4 rounded-full hover:bg-gray-600">
          {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
        </button>
        <button onClick={() => setIsVideoOn(!isVideoOn)} className="bg-gray-700 p-4 rounded-full hover:bg-gray-600">
          {isVideoOn ? <Video size={28} /> : <VideoOff size={28} />}
        </button>
        <button onClick={onEndCall} className="bg-red-600 p-4 rounded-full hover:bg-red-700">
          <PhoneOff size={28} />
        </button>
      </div>
    </div>
  );
};

export default VideoCallUI;
