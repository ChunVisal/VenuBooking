// src/pages/Home/EventList.jsx
import { useState, useEffect } from "react";
import api from "../../api/axiosConfig"
import EventCard from '../../components/events/EventCard';



export default function EventList() {
    const [events, setEvent] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllEvents = async () => {
            try {
                const res = await api.get('/events');
                setEvent(res.data);
           } catch (err) {
                console.error("Failed to fetch all events:", err);
                setError("Could not load events. Check your backend server status.");
            } finally {
                setLoading(false);
            }
        }; fetchAllEvents();
    }, []);

    if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Loading Upcoming Events...</div>;
    if (error) return <div style={{color: 'red', textAlign: 'center', padding: '20px', border: '1px solid red'}}>{error}</div>;

    return (
        <div className="event-list-container p-20">
            <h1>Upcoming Events ({events.length})</h1>
            <div className="event-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {events.length > 0 ? (
                    events.map(event => (
                        <EventCard key={event.id} event={event} /> // Pass event data to the card
                    ))
                ) : (
                    <p>No events have been posted yet. Be the first!</p>
                )}
            </div>
        </div>
    );
}