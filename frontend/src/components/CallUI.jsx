import { useEffect, useState } from "react";
import { PhoneOff, Video, Mic, MicOff, Phone } from "lucide-react";

const CallUI = ({ 
  caller, 
  callStatus, 
  isIncoming, 
  onAcceptCall, 
  onEndCall 
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden"; // Prevent scrolling during call
    return () => {
      document.body.style.overflow = "auto"; // Restore scrolling when call ends
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-base-300 bg-opacity-80 bg-blend-multiply backdrop-blur-md flex flex-col items-center justify-center text-base-content z-50">
      
      {/* User Info */}
      <div className="flex flex-col items-center">
        <img
          src={caller?.profilePic || "/avatar.png"}
          alt={caller?.fullName}
          className="w-24 h-24 rounded-full border-4 border-primary-content shadow-lg"
        />
        <h2 className="text-2xl font-semibold mt-3">{caller?.fullName}</h2>
        <p className="text-lg text-gray-400 mt-1">{callStatus}</p>
      </div>

      {/* Call Controls */}
      <div className="flex gap-6 mt-10">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="bg-gray-700 p-4 rounded-full hover:bg-gray-600"
        >
          {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
        </button>

        <button
          onClick={() => setIsVideoOn(!isVideoOn)}
          className="bg-gray-700 p-4 rounded-full hover:bg-gray-600"
        >
          <Video size={28} />
        </button>

        <button
          onClick={onEndCall}
          className="bg-red-600 p-4 rounded-full hover:bg-red-700"
        >
          <PhoneOff size={28} />
        </button>
      </div>

      {/* Incoming Call - Accept or Decline */}
      {isIncoming && (
        <div className="flex gap-6 mt-6">
          <button
            onClick={onAcceptCall}
            className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-600"
          >
            {Phone}
          </button>
          <button
            onClick={onEndCall}
            className="bg-red-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-red-600"
          >
            {PhoneOff}
          </button>
        </div>
      )}
    </div>
  );
};

export default CallUI;
