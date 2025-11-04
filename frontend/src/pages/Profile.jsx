// src/pages/Profile.jsx (Revised for design and navigation)
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { User, Mail, PlusCircle, ListTodo, LogOut } from 'lucide-react'; // Added icons

const Profile = () => {
    const { currentUser, loading, logout } = useContext(AuthContext);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-orange-500">Loading user profile...</div>;
    }

    // Safety check just in case, though ProtectedRoute should handle this
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
                
                {/* Header Section */}
                <div className="p-8 bg-gray-700/50 flex items-center space-x-6">
                    <div className="p-4 bg-orange-600 rounded-full shadow-lg">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-extrabold text-white">Welcome, {currentUser.name}!</h2>
                        <p className="text-gray-400 flex items-center mt-1">
                            <Mail className="w-4 h-4 mr-2 text-orange-400" />
                            {currentUser.email}
                        </p>
                    </div>
                </div>

                {/* Body Section */}
                <div className="p-8 space-y-8">
                    
                    {/* Event Management Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* 1. Create Event Button */}
                        <Link 
                            to="/create-event" // Assuming you have a route for creating events
                            className="flex flex-col items-center justify-center p-6 bg-orange-600 rounded-xl text-white hover:bg-orange-700 transition-all transform hover:scale-[1.02] shadow-xl"
                        >
                            <PlusCircle className="w-8 h-8 mb-2" />
                            <span className="font-bold text-lg">Create New Event</span>
                            <span className="text-sm text-orange-200">Start listing a new venue or event</span>
                        </Link>

                        {/* 2. Manage Events Button */}
                        <Link 
                            to="/my-events" // 🚨 New route to see all user's events
                            className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-xl text-white hover:bg-gray-600 transition-all transform hover:scale-[1.02] shadow-xl border border-orange-500/50"
                        >
                            <ListTodo className="w-8 h-8 mb-2 text-orange-400" />
                            <span className="font-bold text-lg">Manage My Listings</span>
                            <span className="text-sm text-gray-400">Edit, update, or delete your events</span>
                        </Link>
                    </div>

                    {/* Account Links */}
                    <div className="pt-4 border-t border-gray-700">
                        <h3 className="text-xl font-semibold text-white mb-4">Account Actions</h3>
                        <div className="flex flex-wrap gap-4">
                            
                            {/* Edit Profile Button */}
                            <Link 
                                to="/edit-profile" 
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors flex items-center"
                            >
                                <User className="w-4 h-4 mr-2" /> Edit Profile
                            </Link>

                            {/* Logout Button */}
                            <button 
                                onClick={logout}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                            >
                                <LogOut className="w-4 h-4 mr-2" /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;