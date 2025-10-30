import React, { useState, useContext, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Path adjusted for common setup
import api from '../api/axiosConfig'; // Path adjusted for common setup

const EditProfile = () => {
    // Destructure necessary values from context
    const { currentUser, SetCurrentUser, loading, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // State for form fields, initialized with currentUser data
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [error, setError] = useState(null);

    // --- State & Navigation Checks ---

    if (loading) {
        return <div className="text-center p-8 text-xl text-yellow-600">Loading profile data...</div>;
    }

    if (!currentUser) {
        // If not logged in, redirect to login page
        return <Navigate to="/login" replace />;
    }

    // Effect to update local form state when currentUser loads or changes in context
    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                email: currentUser.email || '',
            });
        }
    }, [currentUser]);


    // --- Form Handlers ---

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setUpdateMessage(''); // Clear message on input change
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setUpdateMessage('');
        setError(null);

        // Check if data actually changed
        if (formData.name === currentUser.name && formData.email === currentUser.email) {
            setError("No changes detected. Please modify a field to update.");
            setIsSubmitting(false);
            return;
        }

        try {
            // Send PUT request to update the profile (to /api/auth/update)
            const res = await api.put('/auth/update', formData);
            
            // Success: Re-fetch the updated user data to refresh AuthContext
            const updatedUserResponse = await api.get('/auth/me');
            SetCurrentUser(updatedUserResponse.data);

            setUpdateMessage(res.data || 'Profile updated successfully!');
        } catch (err) {
            console.error("Profile update failed:", err);
            // Handle errors, including the 409 error from the backend (email already taken)
            const errorMsg = typeof err.response?.data === 'string'
                ? err.response.data
                : (err.response?.data?.error || "An unexpected error occurred during update.");
                
            setError(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async () => {
        if (!window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone and will erase all your data.")) {
            return;
        }

        try {
            // Send DELETE request to delete the account (to /api/auth/delete)
            const res = await api.delete('/auth/delete');
            
            // If successful, log out from the frontend and navigate
            logout(); // Clears local state and cookies
            alert(res.data || "Account deleted successfully. Sorry to see you go!");
            navigate('/', { replace: true }); // Navigate to home or login page
        } catch (err) {
            console.error("Account deletion failed:", err);
            const errorMsg = err.response?.data || "Failed to delete account due to a server error.";
            alert("Deletion Failed: " + errorMsg);
        }
    };


    // --- Render ---
    return (
        <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 sm:p-8">
            <div className="w-full max-w-lg bg-white shadow-2xl rounded-xl p-6 sm:p-10 transition duration-300">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-3 flex items-center justify-between">
                    <span>Edit Profile</span>
                    <span className="text-base text-yellow-600 font-semibold">ID: {currentUser.id}</span>
                </h1>

                {/* Status Messages */}
                {updateMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md" role="alert">
                        <p className="font-bold">Success</p>
                        <p>{updateMessage}</p>
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{typeof error === 'string' ? error : 'An unexpected error occurred.'}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name (Currently: {currentUser.name})
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter new name"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email (Currently: {currentUser.email})
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter new email address"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                        />
                    </div>
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white transition duration-200 
                            ${isSubmitting ? 'bg-yellow-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'}`}
                    >
                        {isSubmitting ? 'Updating...' : 'Update Profile'}
                    </button>
                </form>

                {/* Delete Account Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-red-600 mb-3">Danger Zone</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Permanently delete your account and all associated data (wishlists, bookings, etc.). This action cannot be undone.
                    </p>
                    <button
                        onClick={handleDelete}
                        className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"
                    >
                        Delete My Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;