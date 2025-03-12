import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { fetchRecentCalls } from "../services/callService";
import Footer from "../components/Footer";
import { PhoneMissed, Video, Phone } from "lucide-react";

const RecentCalls = () => {
  const { authUser } = useAuthStore();
  const [calls, setCalls] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const getCalls = async () => {
      if (authUser) {
        const data = await fetchRecentCalls(authUser._id);
        setCalls(data);
      }
    };
    getCalls();
  }, [authUser]);

  // ✅ Format time (like WhatsApp)
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // ✅ Filter calls based on search
  const filteredCalls = calls.filter((call) =>
    call.receiver.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.caller.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col">
     

      {/* Search Bar */}
      <div className="border-b-2 rounded-b-3xl border-primary/40 w-full p-5 h-50 bg-primary/20 backdrop-blur">
        <div className="flex items-center gap-2">
          <Phone className=" mt-6 size-6" />
          <span className="font-light text-xl">Recent Calls</span>
        </div>
        <div className="w-full p-3 lg:px-3 lg:py-2">
          <label className="input p-5 md:p-3 input-bordered input-md border-primary/40 border-4 rounded-2xl px-5 py-5 flex items-center gap-2 w-full backdrop-blur-sm">
            <input
              type="text"
              className="grow placeholder:text-base-content"
              placeholder="Search calls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          </label>
        </div>
      </div>

      {/* Recent Calls List */}
      <div className="overflow-y-auto w-full py-3 px-3 flex-grow space-y-1">
        {filteredCalls.map((call) => (
          <button
            key={call._id}
            className="w-full p-6 flex items-center gap-3 bg-primary/10 border-primary/10 hover:bg-primary/10 hover:border-primary/40 backdrop-blur-sm rounded-3xl border-2 transition-colors"
          >
            {/* ✅ Profile Picture */}
            <div className="relative mx-auto lg:mx-0">
              <img
                src={call.receiver.profilePic || "/avatar.png"}
                alt={call.receiver.fullName}
                className="size-12 object-cover rounded-full"
              />
            </div>

            {/* ✅ Call Info */}
            <div className="flex-grow text-left truncate">
              <div className="font-semibold">
                {call.receiver.fullName}
              </div>
              <div className="text-sm text-zinc-400">
                {call.status === "missed" ? (
                  <span className="text-red-500">Missed Call</span>
                ) : call.callType === "video" ? (
                  "Video Call"
                ) : (
                  "Audio Call"
                )}
              </div>
            </div>

            {/* ✅ Call Time & Icon */}
            <div className="text-xs text-gray-400 flex items-center gap-2">
              {formatTime(call.timestamp)}
              {call.status === "missed" ? (
                <PhoneMissed className="text-red-500" />
              ) : call.callType === "video" ? (
                <Video className="text-blue-500" />
              ) : (
                <Phone className="text-green-500" />
              )}
            </div>
          </button>
        ))}

        {filteredCalls.length === 0 && (
          <div className="text-center text-zinc-500 bg-base-100 py-4">No recent calls</div>
        )}
      </div>

      {/* ✅ Footer Navigation */}
      <Footer />
    </div>
  );
};

export default RecentCalls;
