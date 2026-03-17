import React, { useState, useContext, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axiosConfig";
import { Camera, Save, ArrowLeft, Loader2 } from "lucide-react";

const EditProfile = () => {
  const { currentUser, setCurrentUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    job: "",
    address: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

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

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: "error", msg: "File is too big! Max 5MB." });
      return;
    }

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      setIsSubmitting(true);
      setStatus({ type: "loading", msg: `Uploading ${type}...` });
      const endpoint =
        type === "profile" ? "/auth/upload/profile" : "/auth/upload/background";

      const res = await api.put(endpoint, uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.user) {
        setCurrentUser(res.data.user);
        setStatus({ type: "success", msg: "Image updated! 📸" });
      }
    } catch (err) {
      setStatus({ type: "error", msg: "Upload failed." });
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
      setStatus({ type: "success", msg: "Profile saved! ✅" });
      setTimeout(() => navigate("/profile"), 1000);
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
      <div className="flex h-screen items-center justify-center bg-white text-orange-600 font-bold">
        Loading...
      </div>
    );
  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-10">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 bg-white rounded-3xl shadow-md">
        {/* Simple Top Navigation */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate("/profile")}
            className="text-gray-700 hover:text-orange-600 flex items-center transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
          <h1 className="text-xl font-bold tracking-tight">Edit Profile</h1>
          <div className="w-12"></div>
        </div>

        {/* Banner Upload Area - No Border, Light Background */}
        <div className="relative h-40 w-full bg-gray-100 rounded-2xl overflow-hidden mb-16">
          {currentUser.background_image ? (
            <img
              src={currentUser.background_image}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setSelectedImage(currentUser.background_image)}
              alt="Banner"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300 text-sm">
              No banner image
            </div>
          )}
          <label className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-xl cursor-pointer group transition-all shadow-sm border border-gray-100">
            <Camera className="w-4 h-4 text-gray-600" />
            <input
              type="file"
              onChange={(e) => handleImageUpload(e, "background")}
            />
          </label>
        </div>

        {/* Profile Image - Large & Simple */}
        <div className="flex flex-col items-center -mt-28 mb-10 relative z-10">
          <div className="relative">
            <img
              src={
                currentUser.profile_image ||
                `https://ui-avatars.com/api/?name=${currentUser.username}&background=ff7e00&color=fff`
              }
              onClick={() => setSelectedImage(currentUser.profile_image)}
              className="cursor-pointer w-32 h-32 rounded-3xl object-cover ring-8 ring-white shadow-sm"
              alt="Profile"
            />
            <label className="absolute -bottom-2 -right-2 bg-orange-600 p-2.5 rounded-2xl cursor-pointer hover:bg-orange-700 shadow-lg transition-transform active:scale-90">
              <Camera className="w-5 h-5 text-white" />
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleImageUpload(e, "profile")}
              />
            </label>

            {selectedImage && (
              <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                onClick={() => setSelectedImage(null)}
              >
                <img
                  src={selectedImage}
                  alt="Full Size"
                  className="max-w-full max-h-full rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
          <p className="mt-4 text-xs font-bold text-gray-700 uppercase tracking-widest">
            Profile Identity
          </p>
        </div>

        {/* Status Notification */}
        {status.msg && (
          <div
            className={`mb-8 p-4 rounded-xl text-center text-sm font-medium ${status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {status.msg}
          </div>
        )}

        {/* Professional Form Layout */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Username */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-gray-50 border-0 rounded-xl p-4 text-gray-700 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Role / Title
              </label>
              <input
                name="job"
                value={formData.job}
                onChange={handleChange}
                placeholder="Software Engineer"
                className="w-full bg-gray-50 border-0 rounded-xl p-4 text-gray-700 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Location
              </label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Phnom Penh, Cambodia"
                className="w-full bg-gray-50 border-0 rounded-xl p-4 text-gray-700 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Professional Bio
              </label>
              <textarea
                name="bio"
                rows="4"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell users about yourself..."
                className="w-full bg-gray-50 border-0 rounded-xl p-4 text-gray-700 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-orange-600/20"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span>Update Profile</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
