// src/pages/EditEventPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Loader2, Calendar } from 'lucide-react'; 

const EditEventPage = () => {
    // 1. Context and Hooks
    const { currentUser, loading } = useContext(AuthContext); 
    const { id } = useParams(); // Get the event ID from the URL: /edit-event/:id
    const navigate = useNavigate();

    // 2. State for Form Inputs (Matches your SQL Columns)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        venue: '',
        price: '',
    });

    // 3. State for UI Feedback
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true); // New state for fetching initial data

    // --- CRITICAL: Fetch Existing Event Data ---
    useEffect(() => {
        if (!id) return;

        const fetchEvent = async () => {
            try {
                // Call the GET /api/events/:id route (Ensure this route exists and returns data[0])
                const res = await api.get(`/events/${id}`); 
                const event = res.data;

                // Format the date for the input[type="datetime-local"]
                // It expects YYYY-MM-DDTHH:MM format
                const formattedDate = event.date ? event.date.slice(0, 16) : '';

                // Populate the state with the fetched data
                setFormData({
                    title: event.title || '',
                    description: event.description || '',
                    date: formattedDate,
                    venue: event.venue || '',
                    price: event.price || 0,
                });

                setIsLoadingData(false);

            } catch (err) {
                console.error("Failed to fetch event:", err);
                setError("Failed to load event data. Event not found or unauthorized.");
                setIsLoadingData(false);
                // Redirect user back if fetching fails
                setTimeout(() => navigate('/my-events'), 2000); 
            }
        };
        fetchEvent();
    }, [id, navigate]);
    
    // 4. Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // 5. Secure Submission Handler (PUT request)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsSubmitting(true);

        if (!formData.title || !formData.date || !formData.price) {
            setError("Please fill out all required fields.");
            setIsSubmitting(false);
            return;
        }

        try {
            // CRITICAL: Use PUT request to your /api/events/:id route
            const res = await api.put(`/events/${id}`, formData); 

            setMessage(res.data || "Event updated successfully!");

            // Navigate back to the user's listings after success
            setTimeout(() => {
                navigate('/my-events'); 
            }, 1500);

        } catch (err) {
            console.error("Event update failed:", err);
            const errorMessage = err.response?.data?.error || err.response?.data || "An unexpected error occurred during update.";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // 6. Protection & Loading Checks
    if (loading || isLoadingData) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-orange-500">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            Loading event data...
        </div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />; 
    }

    // 7. Render Form (JSX - similar to your Create form)
    return (
        <div className="min-h-screen bg-gray-900 flex items-start justify-center p-8">
            <div className="w-full max-w-lg bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                    <Calendar className="w-6 h-6 mr-2 text-orange-500" />
                    Edit Your Event Listing
                </h2>
                <p className="text-gray-400 mb-4">You are updating the event with ID: **{id}**</p>
                
                {message && <p className="text-green-400 font-bold mb-4">{message}</p>}
                {error && <p className="text-red-400 border border-red-400 p-3 rounded mb-4">Error: {error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="title" placeholder="Event Title" value={formData.title} onChange={handleChange} required className="w-full p-3 bg-gray-700 text-white rounded focus:ring-2 focus:ring-orange-500" />
                    
                    <textarea name="description" placeholder="Full description of the event..." value={formData.description} onChange={handleChange} required rows="4" className="w-full p-3 bg-gray-700 text-white rounded focus:ring-2 focus:ring-orange-500"></textarea>
                    
                    <label className="text-gray-400 block pt-2">Date and Time:</label>
                    <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required className="w-full p-3 bg-gray-700 text-white rounded focus:ring-2 focus:ring-orange-500" />

                    <input type="text" name="venue" placeholder="Venue Name" value={formData.venue} onChange={handleChange} required className="w-full p-3 bg-gray-700 text-white rounded focus:ring-2 focus:ring-orange-500" />
                    
                    <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required step="0.01" className="w-full p-3 bg-gray-700 text-white rounded focus:ring-2 focus:ring-orange-500" />

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed mt-6"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        <span>{isSubmitting ? 'Updating...' : 'Update Event Listing'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditEventPage;