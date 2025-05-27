import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheackingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    set({ isCheackingAuth: true });

    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data.data });

      get().connectSocket();
    } catch (err) {
      console.log("Error in checkAuth: ", err);

      set({ authUser: null });
      get.logout();
    } finally {
      set({ isCheackingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });

    try {
      const res = await axiosInstance.post("/auth/signup", data);
      const { access_token, ...result } = res.data.data;

      set({ authUser: result });
      localStorage.setItem("access_token", access_token);

      toast.success("Account created successfully");

      get().connectSocket();
    } catch (err) {
      console.log("Error in signUp: ", err);
      toast.error(err.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });

    try {
      const res = await axiosInstance.post("/auth/login", data);
      // console.log(res.data.data);
      const { access_token, ...result } = res.data.data;

      set({ authUser: result });
      localStorage.setItem("access_token", access_token);

      toast.success("User logged in successfully");

      get().connectSocket();
    } catch (err) {
      console.log("Error in login: ", err);
      toast.error(err.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      localStorage.removeItem("access_token");
      toast.success("Logged out sucessfully");

      get().disconnectSocket();
    } catch (err) {
      console.log("Error in logout: ", err);
      toast.error(err.response.data.message);
    }
  },

  updateProfile: async (body) => {
    set({ isUpdatingProfile: true });

    try {
      const res = await axiosInstance.patch("/auth/update-profile", body);
      // console.log(res.data.data);

      set({ authUser: res.data.data });

      if (body?.profilePic) {
        toast.success("Profile image updated");
      } else if (body?.fullName) {
        toast.success("Username updated");
      } else {
        toast.success("Email updated");
      }
    } catch (err) {
      console.log("Error in updateProfile: ", err);
      toast.error(err.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(import.meta.env.VITE_SOCKET_BASE_URL, {
      query: { userId: authUser._id },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
