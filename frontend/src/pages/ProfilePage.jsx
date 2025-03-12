import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { useChatStore } from "../store/useChatStore";
import Footer from "../components/Footer";
import { Camera, Mail, User, LogOut } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, logout } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState(authUser?.fullName || "");
  const [isSaving, setIsSaving] = useState(false);
  const { selectedUser } = useChatStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); 
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // Limit to 5MB
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'File size exceeds 5MB.',
        background: 'bg-black',
        customClass: {
          popup: 'backdrop-blur-sm bg-black bg-opacity-60 rounded-lg text-white',
        },
        confirmButtonColor: '#28a745',
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        profilePic: selectedImg || authUser.profilePic,
        fullName: name.trim(),
      });
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'Your profile has been updated successfully!',
        background: 'bg-black',
        customClass: {
          popup: 'backdrop-blur-sm bg-black bg-opacity-60 rounded-lg text-white',
        },
        confirmButtonColor: '#28a745',
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update profile. Please try again.',
        background: 'bg-black',
        customClass: {
          popup: 'backdrop-blur-sm bg-black bg-opacity-60 rounded-lg text-white',
        },
        confirmButtonColor: '#28a745',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    
    <div className="h-screen pt-10 bg-base-100">
       <div className=" flex justify-end fixed top-0 right-0 p-4">
  <button
    title="Logout"
    className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-base-300 text-primary-content hover:bg-primary active:border active:border-red-400 duration-300"
    onClick={handleLogout} // Use the new function
  >
    <LogOut className="w-5 h-5" />
    <span className="font-semibold"></span>
  </button>
</div>
      <div className="max-w-2xl mx-auto p-6 py-10">
        <div className="bg-primary/20 shadow-lg rounded-xl p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-base-content">Profile</h1>
            <p className="mt-2 text-base-content">Your profile information</p>
          </div>

          {/* Avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-base-200 shadow-lg transition-all transform hover:scale-105"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-110
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-6 h-6 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-base-content/60 mt-2">
              {isUpdatingProfile
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* Name input */}
          <div className="space-y-1.5">
            <div className="text-sm text-base-content/60 flex items-center gap-2">
              <User className="w-4 h-4 text-base-content/60" />
              Full Name
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-2.5 bg-primary/30 rounded-lg border border-primary w-full text-base-content focus:ring-2 focus:ring-lime-500 transition duration-300"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email address */}
          <div className="space-y-1.5">
            <div className="text-sm text-base-content/60 flex items-center gap-2">
              <Mail className="w-4 h-4 text-base-content/60" />
              Email Address
            </div>
            <p className="px-4 py-2.5 bg-primary/30 rounded-lg border border-primary text-base-content">
              {authUser?.email}
            </p>
          </div>

          {/* Account Information */}
          <div className="mt-6 bg-primary/30 shadow-xl rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4 text-base-content">Account Information</h2>
            <div className="space-y-3 text-sm text-base-content">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-600 bg-base-300 rounded-md px-2">Active</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-center">
            <button
              title="Save"
              className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/40 text-primary-content  hover:bg-primary/60 active:border active:border-green-400 duration-300"
              onClick={handleSave}
              disabled={isSaving}
            >
              <span className="font-semibold">{isSaving ? "Saving..." : "Save"}</span>
            </button>
          </div>

          {/* Logout Button */}
         
        </div>
      </div>
      <div className={`md:hidden fixed bottom-0 left-0 right-0`}>
        {!selectedUser && <Footer />}
      </div>
    </div>
  );
};

export default ProfilePage;
