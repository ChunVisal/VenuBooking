// src/pages/MyEvents.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Edit3, Trash2, Calendar, MapPin, DollarSign } from 'lucide-react'; 

const MyEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch the user's listings
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Use the secure backend route you provided
                const res = await api.get('/events/user/events'); 
                setEvents(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch user events:", err);
                setError("Failed to load your events. Please try again.");
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Function to handle event deletion
    const handleDelete = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

        try {
            await api.delete(`/events/${eventId}`);
            // Optimistically update the UI by removing the deleted event
            setEvents(events.filter(event => event.id !== eventId));
        } catch (err) {
            console.error("Deletion failed:", err);
            alert("Failed to delete event. You might not have permission.");
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-orange-500">Loading your event listings...</div>;
    }

    if (error) {
        return <div className="min-h-screen bg-gray-900 text-center pt-20 text-red-400">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8 border-b border-orange-500 pb-2">Your Event Listings ({events.length})</h1>
                
                {events.length === 0 ? (
                    <div className="text-center p-10 bg-gray-800 rounded-xl text-gray-400">
                        <p className="text-xl">You haven't listed any events yet.</p>
                        <Link to="/create-event" className="mt-4 inline-block text-orange-400 hover:text-orange-300 font-medium">
                            Click here to create your first event!
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {events.map((event) => (
                            <div key={event.id} className="bg-gray-800 p-6 rounded-xl shadow-lg flex justify-between items-center border border-gray-700 hover:border-orange-500/50 transition-all">
                                
                                {/* Event Details */}
                                <div className="flex-grow">
                                    <h2 className="text-2xl font-semibold text-white mb-1">{event.title}</h2>
                                    <p className="text-gray-400 line-clamp-2">{event.description}</p>
                                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-400">
                                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-orange-400" /> {new Date(event.date).toLocaleDateString()}</span>
                                        <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-orange-400" /> {event.venue}</span>
                                        <span className="flex items-center font-bold text-green-400"><DollarSign className="w-4 h-4 mr-1 text-green-400" /> {event.price}</span>
                                    </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex space-x-3 ml-6 flex-shrink-0">
                                    <Link 
                                        to={`/edit-event/${event.id}`} // 🚨 New route for editing
                                        className="p-3 rounded-full bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                                        title="Edit Event"
                                    >
                                        <Edit3 className="w-5 h-5" />
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(event.id)}
                                        className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                                        title="Delete Event"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyEvents;