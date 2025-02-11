import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  contacts: [],
  messages: [],
  users: [], // This should now include a `lastMessagedAt` field for each user
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  addContact: (userId) => set((state) => ({ contacts: [...state.contacts, userId] })),
  isContact: (userId) => get().contacts.includes(userId),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      const usersWithTimestamp = res.data.map((user) => ({
        ...user,
        lastMessagedAt: user.lastMessagedAt || null, // Default to null if not provided
      }));
      set({ users: usersWithTimestamp });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });

      // Update lastMessagedAt for this user
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
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });

      // Update lastMessagedAt for the recipient
      const updatedUsers = users.map((user) =>
        user._id === selectedUser._id ? { ...user, lastMessagedAt: new Date().toISOString() } : user
      );
      set({ users: updatedUsers });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });

      // Update lastMessagedAt for the sender
      const updatedUsers = get().users.map((user) =>
        user._id === newMessage.senderId ? { ...user, lastMessagedAt: newMessage.timestamp } : user
      );
      set({ users: updatedUsers });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
