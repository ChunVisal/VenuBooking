// src/pages/Login.jsx (STRICTLY REVISED)
import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn as LogInIcon, Loader2, Calendar } from 'lucide-react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

// --- Start: Google Sign-In Logic (Moved from separate file) ---
const useGoogleSignIn = (navigate, SetCurrentUser) => {
    useEffect(() => {
        /* global google */
        const handleCredentialResponse = async (response) => {
            try {
                // Adjust the API call to your Google callback endpoint
                const res = await api.post("/auth/google/callback", { 
                    credential: response.credential 
                });
                
                // Assuming successful response includes user data and token
                SetCurrentUser(res.data.user);
                localStorage.setItem('token', res.data.token);
                navigate("/profile");

            } catch (err) {
                console.error("Google Login Failed:", err);
                alert("Google sign-in failed. Please try again.");
            }
        };

        const initializeGoogle = () => {
            if (window.google && document.getElementById("googleSignInDiv")) {
                google.accounts.id.initialize({
                    client_id: "1659854909-eleor0ckd60rshs6f17uv0542bi24brp.apps.googleusercontent.com",
                    callback: handleCredentialResponse,
                });
                google.accounts.id.renderButton(
                    document.getElementById("googleSignInDiv"),
                    { theme: "outline", size: "large", shape: "pill", width: '380' } // Ensure width matches the form max-width
                );
            }
        };

        const timer = setTimeout(initializeGoogle, 100); 
        return () => clearTimeout(timer);
    }, [navigate, SetCurrentUser]);
};
// --- End: Google Sign-In Logic ---


// --- Start: Login Component ---
export default function Login() {
    const navigate = useNavigate();
    const { SetCurrentUser } = useContext(AuthContext); 
    
    // Integrate Google Sign-In hook here
    useGoogleSignIn(navigate, SetCurrentUser);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/login', { email, password });
            
            // ✅ Set user and store token in local storage (Requirement 4)
            SetCurrentUser(res.data.user); 
            localStorage.setItem('token', res.data.token); 

            navigate("/profile");

        } catch (err) {
            console.error("Login Error:", err);
            const errorMessage = err.response?.data?.message || "Login failed (Network error).";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // --- Start: Layout (Orange/Black Theme) ---
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl overflow-hidden p-8 border border-gray-700">
                
                {/* Header */}
                <Link to="/" className="flex justify-center items-center mb-6 focus:outline-none">
                    <Calendar className="w-8 h-8 text-orange-500" />
                    <h1 className="text-3xl font-extrabold text-white ml-2">VenuBooking</h1>
                </Link>

                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-gray-400 mb-8">Sign in to manage your events and bookings.</p>
                
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
                            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border border-gray-700 outline-none transition-all"
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
                            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border border-gray-700 outline-none transition-all"
                        />
                    </div>
                    
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogInIcon className="w-5 h-5" />}
                        <span>{loading ? "Signing In..." : "Log In"}</span>
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
                        Don't have an account?
                        <Link to="/signup" className="text-orange-400 hover:text-orange-300 font-medium ml-1 transition-colors">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
    // --- End: Layout (Orange/Black Theme) ---
}