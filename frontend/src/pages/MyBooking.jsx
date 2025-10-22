// src/pagess/Booking.jsx
// src/pages/MyBookingPage.jsx 

import React, { useState, useEffect, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext'; 

const MyBookingPage = () => {
    const { currentUser, loading: authLoading } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user's booking history
    useEffect(() => {
        if (!authLoading && currentUser) {
            const fetchBookings = async () => {
                try {
                    // Hits your protected GET /api/bookings/listing route
                    const res = await api.get('/bookings/listing'); 
                    setBookings(res.data);
                } catch (err) {
                    console.error("Failed to fetch bookings:", err);
                    setError("Could not load your ticket history.");
                } finally {
                    setLoading(false);
                }
            };
            fetchBookings();
        }
        if (!authLoading && !currentUser) {
             setLoading(false); // Stop loading if not logged in
        }
    }, [currentUser, authLoading]);

    // ** OPTIONAL: Handle Cancellation (DELETE /api/bookings/:id) **
    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        try {
            await api.delete(`/bookings/${bookingId}`);
            // Remove the cancelled booking from the state for immediate UI update
            setBookings(prev => prev.filter(b => b.id !== bookingId));
            alert("Booking cancelled successfully!");
        } catch (err) {
            console.error("Cancellation failed:", err);
            alert("Failed to cancel booking: " + (err.response?.data || "Server error."));
        }
    };
    
    // Protection: Redirect if not logged in
    if (authLoading) return <div style={{textAlign: 'center', padding: '50px'}}>Checking login status...</div>;
    if (!currentUser) return <Navigate to="/login" replace />; 

    if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Loading Your Tickets...</div>;
    if (error) return <div style={{color: 'red', textAlign: 'center', padding: '50px'}}>{error}</div>;
    
    return (
        <div className="my-bookings-container" style={{maxWidth: '900px', margin: '20px auto', padding: '20px'}}>
           <h2>{currentUser?.name || 'User'}'s Ticket History ({bookings.length})</h2>
            <p>Welcome back, {currentUser?.name || 'User'}! You are looking at your purchased tickets.</p>
            
            {bookings.length > 0 ? (
                bookings.map(booking => (
                    <div key={booking.id} className="booking-card" style={{border: '2px solid #007bff', padding: '15px', margin: '15px 0', borderRadius: '8px'}}>
                        <h3 style={{color: '#007bff'}}>{booking.title}</h3>
                        <p><strong>Venue:</strong> {booking.venue}</p>
                        <p><strong>Event Date:</strong> {new Date(booking.date).toLocaleString()}</p>
                        <p><strong>Tickets:</strong> {booking.quantity} | <strong>Total Paid:</strong> ${parseFloat(booking.total_price).toFixed(2)}</p>
                        <p><strong>Booking ID:</strong> #{booking.id}</p>
                        
                        <button 
                            onClick={() => handleCancel(booking.id)} 
                            style={{backgroundColor: 'red', color: 'white', padding: '8px 15px', border: 'none', cursor: 'pointer', marginTop: '10px'}}
                        >
                            Cancel Ticket
                        </button>
                    </div>
                ))
            ) : (
                <p>You haven't purchased any tickets yet. <Link to="/">Find an event now!</Link></p>
            )}
        </div>
    );
};

export default MyBookingPage;