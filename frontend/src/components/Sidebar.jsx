import { useEffect, useState } from "react";
import { Users } from "lucide-react"; // You can use the Users icon for the friend request button
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mic } from "lucide-react";
import { Link } from "react-router-dom"; // Import Link for navigation
import axios from "axios"; 
import { toast } from "react-hot-toast"; 

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore(); 

  const [searchQuery, setSearchQuery] = useState(""); 
  const [searchResults, setSearchResults] = useState([]);
  
  useEffect(() => {
    getUsers(); 
  }, [getUsers]);

  useEffect(() => {
    const interval = setInterval(() => {
      getUsers(); // Refresh the user list every 5 seconds
    }, 5000);

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, []);

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

  const handleSearch = async (query) => {
    setSearchQuery(query);  
  
    if (query.length < 3) return;  
  
    try {
      const response = await axios.post("/api/friends/search-users", { query });  
      setSearchResults(response.data);  
    } catch {
      toast.error("Error searching for users");
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await axios.post("/api/auth/send-request", { receiverId: userId });
      toast.success("Friend request sent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending friend request");
    }
  };

  const friendsList = authUser?.friends || [];

  const sortedAndFilteredUsers = users
    .filter((user) => friendsList.includes(user._id)) // Show only friends
    .map((user) => ({
      ...user,
      lastMessagedAt: user.lastMessagedAt || null,
    }))
    .sort((a, b) => {
      const timeA = a.lastMessagedAt ? new Date(a.lastMessagedAt).getTime() : 0;
      const timeB = b.lastMessagedAt ? new Date(b.lastMessagedAt).getTime() : 0;
      return timeB - timeA;
    })
    .filter((user) => {
      const matchesSearchQuery = user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearchQuery;
    });

  return (
    <aside className="h-screen fixed w-full lg:w-72 border-r border-base-300 bg-base-100 flex flex-col backdrop-blur-md">
      <div className="hidden lg:block"></div>

      {/* Search Bar */}
      <div className="border-b-2 rounded-b-3xl border-primary/70 w-full p-5 h-40 bg-primary/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <h1 className="mt-6 text-2xl font-bold text-base-content">Chats</h1>
          <Users className="mt-6 text-base-content justify-end" />
        </div>
        <div className="w-full p-3 lg:px-3 lg:py-2">
          <label className="input p-5 md:p-3 input-md border-4 rounded-2xl px-5 py-5 flex items-center gap-2 w-full backdrop-blur-sm">
            <input
              type="text"
              className="grow placeholder:text-base-content"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)} 
            />
          </label>
        </div>
        <Link to="/friend-requests">
        <button className="absolute top-5 right-5 bg-primary/30 p-3 rounded-full hover:bg-primary/50">
          <Users size={24} className="text-base-content" />
        </button>
      </Link>
      </div>

      {/* Display Search Results */}
      <div className="relative w-full py-3 px-3 flex-grow space-y-1">
  {/* Search Results Overlay */}
  {searchQuery.length > 0 && (
    <div className="absolute top-0 left-0 right-0 bottom-0 z-10 overflow-y-auto w-full py-3 px-3 space-y-1 bg-primary/20 backdrop-blur-md rounded-lg">
      {searchResults.length > 0 ? (
        searchResults.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className="w-full p-6 flex items-center gap-3 bg-primary/10 border-primary/10 hover:bg-primary/10 hover:border-primary/40 backdrop-blur-sm rounded-3xl border-2 transition-colors"
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-12 object-cover rounded-full"
              />
            </div>

            <div className="flex-grow text-left truncate">
              <div className="font-semibold">{user.fullName}</div>
            </div>

            {/* Add Friend Button */}
            {!authUser.friends.includes(user._id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering parent onClick
                  sendFriendRequest(user._id);
                }}
                className="ml-4 bg-secondary/50 text-primary-content p-2 rounded-md hover:bg-primary/80 transition-colors"
              >
                Add
              </button>
            )}
          </button>
        ))
      ) : (
        <div className="text-center text-base-content/70 justify-center bg-base-100 py-4">No users found</div>
      )}
    </div>
  )}

  {/* Friends List (only shown when no search query) */}
  {searchQuery.length === 0 &&
    sortedAndFilteredUsers.map((user) => (
      <button
        key={user._id}
        onClick={() => setSelectedUser(user)}
        className={`w-full p-6 flex items-center gap-3 bg-primary/10 border-primary/10 hover:bg-primary/10 hover:border-primary/40 backdrop-blur-sm rounded-3xl border-2 transition-colors ${
          selectedUser?._id === user._id ? "bg-primary/10 ring-1 ring-base-300" : ""
        }`}
      >
        <div className="relative mx-auto lg:mx-0">
          <img
            src={user.profilePic || "/avatar.png"}
            alt={user.fullName}
            className="size-12 object-cover rounded-full"
          />
          {onlineUsers.includes(user._id) && (
            <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
          )}
        </div>

        <div className="flex-grow text-left truncate">
          <div className={`font-semibold ${user.unreadCount > 0 ? "font-bold" : ""}`}>
            {user.fullName}
          </div>

          <div className={`text-sm flex items-center gap-1 ${user.unreadCount > 0 ? "font-extrabold text-base-content/90" : "text-zinc-400"}`}>
            {user.lastMessage ? (
              user.lastMessage.includes("📷 Image") ? (
                <>
                  <Camera size={14} className="text-green-500" /> <span>Image</span>
                </>
              ) : user.lastMessage.includes("🎵 Voice Note") ? (
                <>
                  <Mic size={14} className="text-green-500" /> <span>Voice Note</span>
                </>
              ) : (
                user.lastMessage
              )
            ) : "No messages yet"}
          </div>
        </div>

        <div className="text-xs text-gray-400">
          {user.lastMessageTime ? formatTime(user.lastMessageTime) : ""}
          {user.unreadCount > 0 && (
            <span className="ml-2 text-md text-base-content font-bold">({user.unreadCount})</span>
          )}
        </div>
      </button>
        ))}
        {sortedAndFilteredUsers.length === 0 && <div className="text-center text-base-content/70 justify-center bg-base-100 py-4"></div>}
      </div>
    </aside>
  );
};

export default Sidebar;
