import { useEffect, useState } from "react";
import { PhoneOff, Video, Mic, MicOff } from "lucide-react";

const CallUI = ({ caller, callStatus, onAcceptCall, onEndCall }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden"; // Prevent scrolling when call is active
    return () => {
      document.body.style.overflow = "auto"; // Restore scrolling when call ends
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-primary bg-opacity-95 bg-blend-multiply backdrop-blur-md flex flex-col items-center justify-center text-primary-content z-50">
      <div className="flex flex-col items-center">
        <img
          src={caller?.profilePic || "/avatar.png"}
          alt={caller?.fullName}
          className="w-24 h-24 rounded-full border-4 border-primary/20 shadow-lg"
        />
        <h2 className="text-xl font-semibold mt-3">{caller?.fullName}</h2>
        <p className="text-sm text-gray-400">{callStatus}</p>
      </div>

      {/* Call Controls */}
      <div className="flex gap-6 mt-10">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="bg-gray-700 p-4 rounded-full"
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button
          onClick={() => setIsVideoOn(!isVideoOn)}
          className="bg-gray-700 p-4 rounded-full"
        >
          <Video size={24} />
        </button>

        <button
          onClick={onEndCall}
          className="bg-red-600 p-4 rounded-full"
        >
          <PhoneOff size={24} />
        </button>
      </div>

      {callStatus === "Ringing..." && (
        <button
          onClick={onAcceptCall}
          className="bg-green-500 text-white px-6 py-3 rounded-lg mt-6"
        >
          Accept Call
        </button>
      )}
    </div>
  );
};

export default CallUI;
