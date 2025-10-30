// src/pages/MyWishlistPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext'; 

const MyWishlistPage = () => {
    const { currentUser, loading: authLoading } = useContext(AuthContext);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch the wishlist
    const fetchWishlist = async () => {
        try {
            // Hits your protected GET /api/wishlist route
            const res = await api.get('/wishlist'); 
            setWishlist(res.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch wishlist:", err);
            setError("Could not load your wishlist.");
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch on component mount
    useEffect(() => {
        if (!authLoading && currentUser) {
            fetchWishlist();
        }
        if (!authLoading && !currentUser) {
             setLoading(false);
        }
    }, [currentUser, authLoading]);

  // Handle removal of an item
const handleRemove = async (wishlistId) => {
  if (!window.confirm("Remove this event from your wishlist?")) return; 

  try {
    // Hits your DELETE /api/wishlist/:id route
    await api.delete(`/wishlist/${wishlistId}`);

    // Update state to remove the item immediately
    setWishlist((prev) => prev.filter((item) => item.wishlist_id !== wishlistId));

    alert("Item removed successfully!");
  } catch (err) {
    console.error("Removal failed:", err);

    // FIX: Safely extract error message from response data
    const errorData = err.response?.data;
    const errorMsg =
      typeof errorData === "string"
        ? errorData // For 404/200 .send() errors
        : (errorData?.error || "Unknown server error (Check backend terminal for SQL error).");

    alert("Failed to remove item: " + errorMsg);
  }
};

    
    // Protection: Redirect if not logged in
    if (authLoading) return <div style={{textAlign: 'center', padding: '50px'}}>Checking login status...</div>;
    if (!currentUser) return <Navigate to="/login" replace />; 

    if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Loading Your Wishlist...</div>;
    if (error) return <div style={{color: 'red', textAlign: 'center', padding: '50px'}}>{error}</div>;
    
    return (
        <div className="my-wishlist-container" style={{maxWidth: '900px', margin: '20px auto', padding: '20px'}}>
            <h2>{currentUser?.name || 'User'}'s Wishlist ({wishlist.length})</h2>
            
            {wishlist.length > 0 ? (
                wishlist.map(item => (
                    <div key={item.wishlist_id} className="wishlist-card" style={{border: '1px solid #ffc107', padding: '15px', margin: '15px 0', borderRadius: '8px'}}>
                        <h3 style={{color: '#ffc107'}}>{item.title}</h3>
                        <p><strong>Venue:</strong> {item.venue}</p>
                        <p><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</p>
                        <p><strong>Price:</strong> ${parseFloat(item.price).toFixed(2)}</p>
                        
                        <Link to={`/event/${item.event_id}`}>
                            <button style={{marginRight: '10px', padding: '8px 15px', cursor: 'pointer'}}>View Event</button>
                        </Link>
                        <button 
                            onClick={() => handleRemove(item.wishlist_id)} 
                            style={{backgroundColor: '#dc3545', color: 'white', padding: '8px 15px', border: 'none', cursor: 'pointer'}}
                        >
                            Remove
                        </button>
                    </div>
                ))
            ) : (
                <p>Your wishlist is empty! <Link to="/">Find events to save.</Link></p>
            )}
        </div>
    );
};

export default MyWishlistPage;