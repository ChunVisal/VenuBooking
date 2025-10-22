// src/pages/CreateEventPage.jsx

import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext'; // Import your authentication context

const CreateEventPage = () => {
    // 1. Get Authentication Context
    const { currentUser, loading } = useContext(AuthContext); 
    const navigate = useNavigate();

    // 2. State for Form Inputs (Matching your SQL Columns)
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

    // 4. Handle input changes (Generic handler for all fields)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // 5. Secure Submission Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsSubmitting(true);

        // Simple validation check
        if (!formData.title || !formData.date || !formData.price) {
            setError("Please fill out all required fields.");
            setIsSubmitting(false);
            return;
        }

        try {
            // CRITICAL: api.post uses the cookie automatically for authentication
            const res = await api.post('/events', formData); 

            setMessage(res.data || "Event created successfully!");
            // Clear the form after success
            setFormData({ title: '', description: '', date: '', venue: '', price: '' });

            // Navigate to the user's listings after a short delay
            setTimeout(() => {
                navigate('/my-listings'); // Make sure this route exists!
            }, 1500);

        } catch (err) {
            console.error("Event creation failed:", err);
            const errorMessage = err.response?.data?.error || err.response?.data || "An unexpected error occurred.";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // 6. Protection: Wait for loading or redirect if not logged in
    if (loading) {
        return <div style={{textAlign: 'center', padding: '50px'}}>Loading user status...</div>;
    }

    if (!currentUser) {
        // If not logged in, redirect them to the login page
        return <Navigate to="/login" replace />; 
    }

    // 7. Render Form (JSX)
    return (
        <div className="create-event-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h2>Create New VenuBooking Event</h2>
            <p>Posting as: **{currentUser.name}** ({currentUser.email})</p>
            
            {message && <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>}
            {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>Error: {error}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                <input type="text" name="title" placeholder="Event Title (e.g., React Workshop)" value={formData.title} onChange={handleChange} required />
                
                <textarea name="description" placeholder="Full description of the event..." value={formData.description} onChange={handleChange} required rows="4"></textarea>
                
                {/* NOTE: Input type="datetime-local" sends data in the format your backend needs */}
                <label>Date and Time:</label>
                <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required />

                <input type="text" name="venue" placeholder="Venue Name (e.g., Tech Hub Center)" value={formData.venue} onChange={handleChange} required />
                
                <input type="number" name="price" placeholder="Price (e.g., 25.00)" value={formData.price === 0 ? '' : formData.price} onChange={handleChange} required step="0.01" />

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Post Event'}INSERT INTO users (id, name, email, password, created_at)
                    VALUES (
                        id:int,
                        'name:varchar',
                        'email:varchar',
                        'password:varchar',
                        'created_at:timestamp'
                      );
                </button>
            </form>
        </div>
    );
};

export default CreateEventPage;