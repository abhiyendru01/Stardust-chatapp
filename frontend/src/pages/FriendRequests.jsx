import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore"; // Accessing the auth user from the store
import { useNavigate } from "react-router-dom"; // Updated import for v6

const FriendRequests = () => {
  const { authUser } = useAuthStore(); // Get the current user from the store
  const [friendRequests, setFriendRequests] = useState([]); // Initialize with an empty array
  const navigate = useNavigate(); // Use navigate instead of useHistory

  // Fetch friend requests when the page is loaded
  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (!authUser) {
        toast.error("User not authenticated");
        return;
      }

      try {
        const response = await axios.get("/api/friends/received-requests"); // Ensure this API endpoint exists in the backend
        setFriendRequests(response.data || []); // Ensure it's an array
      } catch (error) {
        console.error("Error fetching friend requests", error);
        toast.error("Error fetching friend requests");
      }
    };

    if (authUser) {
      fetchFriendRequests();
    }
  }, [authUser]);

  // Accept a friend request
  const acceptRequest = async (senderId) => {
    try {
      await axios.post("/api/friends/accept-request", { senderId });
      toast.success("Friend request accepted!");
      setFriendRequests(friendRequests.filter(request => request._id !== senderId)); // Remove the accepted request from the list
    } catch (error) {
      console.error("Error accepting request", error);
      toast.error(error.response?.data?.message || "Error accepting friend request");
    }
  };

  // Reject a friend request
  const rejectRequest = async (senderId) => {
    try {
      await axios.post("/api/friends/reject-request", { senderId });
      toast.success("Friend request rejected!");
      setFriendRequests(friendRequests.filter(request => request._id !== senderId)); // Remove the rejected request from the list
    } catch (error) {
      console.error("Error rejecting request", error);
      toast.error(error.response?.data?.message || "Error rejecting friend request");
    }
  };

  // Handle back button click
  const handleBack = () => {
    navigate(-1); // Updated to use navigate from React Router v6
  };

  return (
    <div className="flex flex-col h-screen bg-base-100 p-4 relative">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold bg-base-200 p-4 rounded-xl shadow text-base-content">
          Friend Requests
        </h1>
      </div>

      <div className="space-y-3 flex-grow overflow-y-auto">
        {Array.isArray(friendRequests) && friendRequests.length > 0 ? (
          friendRequests.map((request) => (
            <div key={request._id} className="flex justify-between items-center p-4 bg-base-200 border border-base-300/70 rounded-xl">
              <div className="flex items-center gap-4">
                <img
                  src={request.profilePic || "/avatar.png"}
                  alt={request.fullName}
                  className="w-12 h-12 object-cover rounded-full"
                />
                <div>
                  <p className="font-semibold">{request.fullName}</p>
                  
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => acceptRequest(request._id)}
                  className="btn btn-success btn-sm rounded-b-md"
                >
                  Accept
                </button>
                <button
                  onClick={() => rejectRequest(request._id)}
                  className="btn btn-error btn-sm rounded-b-md"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-base-content/70 justify-center bg-base-100 py-4">You have no friend requests</p>
        )}
      </div>

      {/* Back Button at the bottom */}
      <button
        onClick={handleBack}
        className="w-full p-4 border-t t-3 border-primary/70 bg-primary/20 text-primary-content/70  rounded-t-2xl mx-auto mt-4 fixed bottom-0 left-1/2 transform -translate-x-1/2 hover:bg-base-primary transition-colors"
      >
        
        Back
      </button>
    </div>
  );
};

export default FriendRequests;
