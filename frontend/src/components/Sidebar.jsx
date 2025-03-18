import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mic } from "lucide-react";
import Navbar from "./Navbar"; 

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers(); 
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getUsers();
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    
    // Show "Today" if the message is from today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } 
    // Show "Yesterday" if the message is from yesterday
    else if (new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString()) {
      return "Yesterday";
    } 
    // Show the date if the message is older
    else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // ✅ Sort and filter users based on last message time
  const sortedAndFilteredUsers = users
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
      const matchesOnlineStatus = !showOnlineOnly || onlineUsers.includes(user._id);
      const matchesSearchQuery = user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesOnlineStatus && matchesSearchQuery;
    });

  return (
    <aside className="h-screen fixed w-full lg:w-72 border-r border-base-300 bg-base-100  flex flex-col backdrop-blur-md">
      <div className="hidden lg:block ">
        <Navbar />
      </div>

      {/* Search Bar */}
      <div className="border-b-2 rounded-b-3xl border-primary/70 w-full p-5 h-40 bg-primary/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
        <h1 className="mt-6 text-2xl font-bold text-base-content">Chats</h1>
        <Users className="mt-6 text-base-content justify-end" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
        <div className="w-full p-3 lg:px-3 lg:py-2">
          <label className="input p-5 md:p-3 input-bordered input-md border-primary/40 border-4 rounded-2xl px-5 py-5 flex items-center gap-2 w-full backdrop-blur-sm">
            <input
              type="text"
              className="grow placeholder:text-base-content"
              placeholder="Search..."
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

      {/* Users List */}
      <div className="overflow-y-auto w-full py-3 px-3 flex-grow space-y-1">
        {sortedAndFilteredUsers.map((user) => (
         <button
         key={user._id}
         onClick={() => setSelectedUser(user)}
         className={`w-full p-6 flex items-center gap-3 bg-primary/10 border-primary/10 hover:bg-primary/10 hover:border-primary/40 backdrop-blur-sm rounded-3xl border-2 transition-colors ${
           selectedUser?._id === user._id ? "bg-primary/10 ring-1 ring-base-300" : ""
         }`}
       >
         {/* ✅ Profile Picture & Online Status */}
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
       
         {/* ✅ Replace this section with the updated bold unread messages code */}
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
       
         {/* ✅ Last message time & unread count */}
         <div className="text-xs text-gray-400 ">
           {user.lastMessageTime ? formatTime(user.lastMessageTime) : ""}
           {user.unreadCount > 0 && (
             <span className="ml-2 text-md text-base-content font-bold">({user.unreadCount})</span>
           )}
         </div>
       </button>
       
        ))}

        {sortedAndFilteredUsers.length === 0 && <div className="text-center text-base-content/70 justify-center bg-base-100 py-4">No users found</div>}
      </div>
    </aside>
  );
};

export default Sidebar;
