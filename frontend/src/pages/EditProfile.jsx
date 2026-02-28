import React, { useState, useContext, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axiosConfig";
import { Camera, Save, Trash2, ArrowLeft, Loader2 } from "lucide-react";

const EditProfile = () => {
  const { currentUser, setCurrentUser, loading, logout } =
    useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    job: "",
    address: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  // Sync form with currentUser data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
        job: currentUser.job || "",
        address: currentUser.address || "",
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatus({ type: "", msg: "" });
  };

  // --- NEW: Handle Image Uploads to Cloudinary ---
  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (Cybersecurity habit: Don't let users upload 50MB files!)
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: "error", msg: "File is too big! Max 5MB." });
      return;
    }

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      setIsSubmitting(true);
      setStatus({ type: "loading", msg: `Uploading ${type} image...` });
      const endpoint =
        type === "profile" ? "/auth/upload/profile" : "/auth/upload/background";

      const res = await api.put(endpoint, uploadData, {
        headers: {
          "Content-Type": "multipart/form-data", // Crucial for files!
        },
      });

      if (res.data.user) {
        setCurrentUser(res.data.user);
        console.log("Context Updated with:", res.data.user.profile_image);
      }

      setCurrentUser(res.data.user); // Update context with new image URL
      setStatus({ type: "success", msg: "Profile image updated! 📸" });
    } catch (err) {
      setStatus({ type: "error", msg: "Image upload failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.put("/auth/update", formData);
      setCurrentUser(res.data.user);
      setStatus({ type: "success", msg: "Profile updated successfully! ✅" });
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      setStatus({
        type: "error",
        msg: err.response?.data?.message || "Update failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="text-center p-20 text-white bg-gray-900 min-h-screen">
        Loading...
      </div>
    );
  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <button
            onClick={() => navigate("/profile")}
            className="text-gray-400 hover:text-white flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-1" /> Back
          </button>
          <h1 className="text-xl font-bold">Edit Profile</h1>
          <div className="w-10"></div>
        </div>

        <div className="p-6 space-y-8">
          <div className="relative h-32 w-full bg-gray-700 rounded-xl overflow-hidden mb-12 border border-gray-600">
            {currentUser.background_image ? (
              <img
                src={currentUser.background_image}
                className="w-full h-full object-cover"
                alt="Banner"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No Banner Set
              </div>
            )}
            <label className="absolute bottom-2 right-2 bg-black/50 p-2 rounded-lg cursor-pointer hover:bg-orange-600 transition-colors border border-white/20">
              <Camera className="w-4 h-4 text-white" />
              <span className="text-xs ml-1 text-white">Change Banner</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleImageUpload(e, "background")}
              />
            </label>
          </div>
          {/* Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <img
                src={`${currentUser.profile_image}?${Date.now()}`}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-orange-500"
              />
              <label className="absolute bottom-0 right-0 bg-orange-600 p-2 rounded-full cursor-pointer hover:bg-orange-700 transition-colors">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "profile")}
                />
              </label>
            </div>
            <p className="text-sm text-gray-400">
              Click icon to update profile picture
            </p>
          </div>

          {/* Status Messages */}
          {status.msg && (
            <div
              className={`p-4 rounded-lg text-center ${status.type === "success" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}
            >
              {status.msg}
            </div>
          )}

          {/* Form Fields */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">
                Username
              </label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Job Title
              </label>
              <input
                name="job"
                value={formData.job}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Address
              </label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Phnom Penh, Cambodia"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Bio</label>
              <textarea
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="md:col-span-2 bg-orange-600 hover:bg-orange-700 py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              <span>Save Changes</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
