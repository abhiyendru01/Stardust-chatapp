import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { getSocket } from "../socket";

export const useChatStore = create((set, get) => ({
  contacts: [],
  messages: [],
  friends: [],
  friendRequests: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  addContact: (userId) => set((state) => ({ contacts: [...state.contacts, userId] })),
  isContact: (userId) => get().contacts.includes(userId),

  
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      let usersWithTimestamp = res.data.map((user) => ({
        ...user,
        lastMessagedAt: user.lastMessagedAt || null,
        lastMessage: user.lastMessage || "", // ✅ Include last message
        lastMessageTime: user.lastMessageTime || null, // ✅ Include last message time
      }));
  
      // ✅ Sort users by `lastMessagedAt`
      usersWithTimestamp.sort((a, b) => {
        const timeA = a.lastMessagedAt ? new Date(a.lastMessagedAt).getTime() : 0;
        const timeB = b.lastMessagedAt ? new Date(b.lastMessagedAt).getTime() : 0;
        return timeB - timeA;
      });
  
      set({ users: usersWithTimestamp });
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      set({ isUsersLoading: false });
    }
  }
,  

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      console.log("Messages Fetched from API:", res.data); // Debugging

      set({ messages: res.data });

      const updatedUsers = get().users.map((user) =>
        user._id === userId ? { ...user, lastMessagedAt: new Date().toISOString() } : user
      );
      set({ users: updatedUsers });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
},

sendMessage: async (messageData) => {
  const { selectedUser, messages, users } = get();
  try {
    console.log("Sending Message Data:", messageData);

    const tempMessage = {
      ...messageData,
      senderId: useAuthStore.getState().authUser._id,
      createdAt: new Date().toISOString(),
    };

    // ✅ Add message to the state before API call
    set({ messages: [...messages, tempMessage] });

    const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
    console.log("Message Sent Response:", res.data);

    set({ messages: [...messages, res.data] });

    let updatedUsers = users.map((user) =>
      user._id === selectedUser._id
        ? { ...user, lastMessagedAt: new Date().toISOString() }
        : user
    );

    updatedUsers.sort((a, b) => {
      const timeA = a.lastMessagedAt ? new Date(a.lastMessagedAt).getTime() : 0;
      const timeB = b.lastMessagedAt ? new Date(b.lastMessagedAt).getTime() : 0;
      return timeB - timeA;
    });

    set({ users: updatedUsers });
  } catch (error) {
    toast.error(error.response?.data?.message || "Error sending message");
  }
},




subscribeToMessages: () => {
  const socket = getSocket();
  socket.off("newMessage").on("newMessage", (newMessage) => {
    console.log("📩 [FRONTEND] New message received:", newMessage);

    set((state) => {
      let updatedUsers = state.users.map((user) =>
        user._id === newMessage.senderId || user._id === newMessage.receiverId
          ? { ...user, lastMessagedAt: new Date().toISOString() }
          : user
      );

      updatedUsers.sort((a, b) => {
        const timeA = a.lastMessagedAt ? new Date(a.lastMessagedAt).getTime() : 0;
        const timeB = b.lastMessagedAt ? new Date(b.lastMessagedAt).getTime() : 0;
        return timeB - timeA;
      });

      return { messages: [...state.messages, newMessage], users: updatedUsers };
    });
  });
}
  ,

  getFriends: async () => {
    try {
      const res = await axiosInstance.get("/api/friends/friends"); // Ensure correct API path
  
      console.log("getFriends API Response:", res); // Debugging
  
      if (Array.isArray(res.data)) {
        set({ friends: res.data });
      } else {
        console.error("Error: getFriends API did not return an array:", res.data);
        set({ friends: [] });
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      set({ friends: [] });
      toast.error(error.response?.data?.message || "Error fetching friends");
    }
  },
  

  getFriendRequests: async () => {
    try {
      const res = await axiosInstance.get("/api/friends/friend-requests"); // ✅ Ensure correct API route
      set({ friendRequests: res.data || [] }); // ✅ Ensure an array
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching friend requests");
      set({ friendRequests: [] });
    }
  },

  sendFriendRequest: async (userId) => {
    try {
      await axiosInstance.post("/api/friends/send-request", { receiverId: userId }); // ✅ Correct API path
      toast.success("Friend request sent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending friend request");
    }
  },

  acceptFriendRequest: async (senderId) => {
    try {
      await axiosInstance.post("/api/friends/accept-request", { senderId }); // ✅ Correct API path
      toast.success("Friend request accepted!");
      get().getFriends(); // Refresh friends list
      get().getFriendRequests(); // Refresh friend requests list
    } catch (error) {
      toast.error(error.response?.data?.message || "Error accepting friend request");
    }
  },

  rejectFriendRequest: async (senderId) => {
    try {
      await axiosInstance.post("/api/friends/reject-request", { senderId }); // ✅ Correct API path
      toast.success("Friend request rejected!");
      get().getFriendRequests(); // Refresh friend requests list
    } catch (error) {
      toast.error(error.response?.data?.message || "Error rejecting friend request");
    }
  },
  
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
