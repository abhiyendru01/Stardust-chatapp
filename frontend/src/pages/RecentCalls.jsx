import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { fetchRecentCalls } from "../services/callService";
import Footer from "../components/Footer";
import { PhoneMissed, Video, Phone, Loader } from "lucide-react";

const RecentCalls = () => {
  const { authUser } = useAuthStore();
  const [calls, setCalls] = useState([]);  // ✅ Initialize as empty array
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);  // ✅ Add loading state

  useEffect(() => {
    const getCalls = async () => {
      if (authUser) {
        console.log(`👤 Logged-in User ID: ${authUser._id}`);
  
        setIsLoading(true); // ✅ Set loading before fetching
        try {
          const data = await fetchRecentCalls(authUser._id);
          
          console.log("📞 Received Call Data:", data); // ✅ Log received data
          
          if (!data || data.length === 0) {
            console.warn("⚠️ No recent calls found.");
          }
          
          setCalls(data || []);
        } catch (error) {
          console.error("❌ Error fetching recent calls:", error);
          setCalls([]); // ✅ Ensure it's an array
        } finally {
          setIsLoading(false); // ✅ Turn off loading after fetching
        }
      }
    };
    
    getCalls();
  }, [authUser]);
  

  // ✅ Filter calls based on search input
  const filteredCalls = calls.filter((call) =>
    call.receiver?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.caller?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col">
      {/* 🔍 Search Bar */}
      <div className="border-b-2 rounded-b-3xl border-primary/40 w-full p-5 h-50 bg-primary/20 backdrop-blur">
        <div className="flex items-center gap-2">
          <Phone className="mt-6 size-6" />
          <h1 className="mt-6 text-2xl font-bold text-base-content">Recent Calls</h1>
        </div>
        <div className="w-full p-3 lg:px-3 lg:py-2">
          <input
            type="text"
            className="input p-5 md:p-3 input-bordered border-primary/40 border-4 rounded-2xl w-full"
            placeholder="Search calls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 🔄 Loading State */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader className="animate-spin size-8 text-primary" />
        </div>
      ) : (
        <div className="overflow-y-auto w-full py-3 px-3 flex-grow space-y-1">
          {/* 📞 Calls List */}
          {filteredCalls.length > 0 ? (
            filteredCalls.map((call) => (
              <button
                key={call._id}
                className="w-full p-6 flex items-center gap-3 bg-primary/10 border-primary/10 hover:bg-primary/10 hover:border-primary/40 backdrop-blur-sm rounded-3xl border-2 transition-colors"
              >
                {/* ✅ Profile Picture */}
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={call.receiver?.profilePic || "/avatar.png"}
                    alt={call.receiver?.fullName || "Unknown"}
                    className="size-12 object-cover rounded-full"
                  />
                </div>

                {/* ✅ Call Info */}
                <div className="flex-grow text-left truncate">
                  <div className="font-semibold">{call.receiver?.fullName || "Unknown"}</div>
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

                <div className="text-xs text-gray-400 flex items-center gap-2">
                  {call.timestamp ? new Date(call.timestamp).toLocaleTimeString() : "N/A"}
                  {call.status === "missed" ? (
                    <PhoneMissed className="text-red-500" />
                  ) : call.callType === "video" ? (
                    <Video className="text-primary" />
                  ) : (
                    <Phone className="text-green-500" />
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="text-center text-zinc-500 bg-base-100 py-4">
              No recent calls
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RecentCalls;
