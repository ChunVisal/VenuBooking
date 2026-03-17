// src/pages/Signup.jsx (STRICTLY REVISED)
import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, UserPlus, Loader2, Calendar } from "lucide-react";
import api from "../api/axiosConfig";
import useGoogleSignIn from "../api/googleAuth";
import { AuthContext } from "../context/AuthContext";

// --- Start: Signup Component ---
export default function Signup() {
  const navigate = useNavigate();
  const { SetCurrentUser } = useContext(AuthContext);
  useGoogleSignIn(navigate, SetCurrentUser);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const userData = { username, email, password };

    try {
      await api.post("/auth/register", userData);

      setMessage("✅ Registration successful! You can now log in.");
      setUsername("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      console.error("Registration failed:", err);
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  // --- Start: Layout (Orange/Black Theme) ---
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8">
        {/* Header */}
        <Link
          to="/"
          className="flex justify-center items-center mb-6 focus:outline-none"
        >
          <Calendar className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-extrabold text-gray-800 ml-2">
            VenuBooking
          </h1>
        </Link>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Create an Account
        </h2>
        <p className="text-gray-400 mb-8">
          Join VenuBooking to start planning your next big event.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Full Name"
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border border-gray-700 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border border-gray-700 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border border-gray-700 outline-none transition-all"
            />
          </div>

          {message && (
            <p className="text-sm text-green-400 text-center font-medium">
              {message}
            </p>
          )}
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            <span>{loading ? "Signing Up..." : "Sign Up"}</span>
          </button>
        </form>

        <div className="relative flex items-center my-8">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        {/* Google Sign-In button container */}
        <div className="flex justify-center" id="googleSignInDiv"></div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?
            <Link
              to="/login"
              className="text-orange-400 hover:text-orange-300 font-medium ml-1 transition-colors"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
  // --- End: Layout (Orange/Black Theme) ---
}
