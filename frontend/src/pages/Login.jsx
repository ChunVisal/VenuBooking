// src/pages/Login.jsx (STRICTLY REVISED)
import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  LogIn as LogInIcon,
  Loader2,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../api/axiosConfig";
import useGoogleSignIn from "../api/googleAuth";
import { AuthContext } from "../context/AuthContext";

// --- Start: Login Component ---
export default function Login() {
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useGoogleSignIn(navigate);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      // ✅ Set user and store token in local storage (Requirement 4)
      localStorage.setItem("token", res.data.token);
      setCurrentUser(res.data.user);
      navigate("/profile");
    } catch (err) {
      console.error("Login Error:", err);
      const errorMessage =
        err.response?.data?.message || "Login failed (Network error).";
      setError(errorMessage);
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

        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-gray-600 mb-8">
          Sign in to manage your events and bookings.
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border border-gray-300 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full pl-10 pr-10 py-3 bg-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border border-gray-700 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-orange-600 text-gray-200 font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogInIcon className="w-5 h-5" />
            )}
            <span>{loading ? "Signing In..." : "Log In"}</span>
          </button>
        </form>

        <div className="relative flex items-center my-8">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Google Sign-In button container */}
        <div className="flex justify-center" id="googleSignInDiv"></div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?
            <Link
              to="/signup"
              className="text-orange-400 hover:text-orange-300 font-medium ml-1 transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
  // --- End: Layout (Orange/Black Theme) ---
}
