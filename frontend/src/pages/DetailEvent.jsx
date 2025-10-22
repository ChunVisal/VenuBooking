// src/pages/DetailCard.jsx 
// NOTE: I'm calling this EventDetailPage.jsx for clarity, but it performs the "DetailCard" function.

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext'; // Need this for currentUser

const EventDetailPage = () => {
    const { id } = useParams(); // Get the event ID from the URL: /event/7
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext); 

    const [event, setEvent] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Fetch Event Details
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                // Assuming you have a GET /api/events/:id route (Crucial!)
                // If you don't have this, use the public /api/events and filter the list
                const res = await api.get(`/events/${id}`); 
                setEvent(res.data);
            } catch (err) {
                setError("Could not load event details.");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    // Handle Buy Button Click (Uses POST /api/bookings)
    const handleBuyTicket = async () => {
        if (!currentUser) {
            setError("You must be logged in to purchase tickets.");
            setTimeout(() => navigate('/login'), 1500);
            return;
        }
        if (quantity < 1) {
            setError("Quantity must be at least 1.");
            return;
        }

        try {
            // Send ONLY event_id and quantity (Backend calculates the price!)
            const res = await api.post('/bookings', { 
                event_id: id, 
                quantity: quantity 
            });
            
            setMessage(res.data.message); 
            setError('');
            
            // Redirect to the user's booking history page after successful purchase
            setTimeout(() => {
                navigate('/my-bookings'); 
            }, 2000);

        } catch (err) {
            console.error("Booking failed:", err);
            setError(err.response?.data?.error || err.response?.data?.message || "Purchase failed. Try logging in again.");
        }
    };
    
    if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Loading Event...</div>;
    if (error && !event) return <div style={{color: 'red', textAlign: 'center', padding: '50px'}}>Error: {error}</div>;
    if (!event) return <div style={{textAlign: 'center', padding: '50px'}}>Event not found.</div>;

    const price = parseFloat(event.price).toFixed(2);
    const total = (price * quantity).toFixed(2);

    return (
        <div className="event-detail-page" style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', border: '1px solid #eee' }}>
            <h2>{event.title}</h2>
            <p><strong>Venue:</strong> {event.venue}</p>
            <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
            <p><strong>Price per Ticket:</strong> ${price}</p>
            
            <hr style={{margin: '15px 0'}}/>
            
            <p>{event.description}</p>

            <div className="buy-section" style={{marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', border: '1px solid #ddd'}}>
                {message && <p style={{color: 'green', fontWeight: 'bold'}}>{message}</p>}
                {error && <p style={{color: 'red'}}>{error}</p>}
                
                <label style={{display: 'block', marginBottom: '10px'}}>
                    Quantity:
                    <input 
                        type="number" 
                        min="1" 
                        value={quantity} 
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        style={{marginLeft: '10px', width: '60px', padding: '5px'}}
                    />
                </label>
                
                <h3 style={{marginTop: '15px'}}>Total: ${total}</h3>

                <button 
                    onClick={handleBuyTicket} 
                    disabled={!currentUser} 
                    style={{padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', marginTop: '15px'}}
                >
                    {currentUser ? 'Confirm Purchase' : 'Login to Buy'}
                </button>
            </div>
        </div>
    );
};

export default EventDetailPage;
// import { useState } from "react";
// // wishlist icon (already present)
// import { FaHeart, FaMapMarkerAlt, FaPlayCircle, FaStar } from "react-icons/fa";
// // share icon
// import { FiShare2 } from "react-icons/fi"; 

// // Sample data
// const sampleEvent = {
//   title: "Summer Music Festival 2024",
//   date: "June 15, 2024",
//   time: "6:00 PM - 11:00 PM",
//   category: "Music & Entertainment",
//   price: 45,
//   description: "Join us for an unforgettable evening of live music featuring top artists from around the country. This annual summer festival brings together music lovers for a night of celebration, great food, and amazing performances under the stars. Don't miss out on this incredible experience!",
//   images: [
//     "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&h=300&fit=crop",
//     "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&h=300&fit=crop",
//     "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&h=300&fit=crop",
//     "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop"
//   ],
//   videoUrl: "https://www.youtube.com/embed/sample-video",
//   location: {
//     name: "Central Park Amphitheater",
//     address: "123 Main Street, Central Park, New York, NY 10001",
//     mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.9503398796587!2d-73.96870288459418!3d40.71277597932951!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25f5c8b8a99b9%3A0xcee5f6d5f5f5f5f5!2sCentral%20Park!5e0!3m2!1sen!2sus!4v1234567890"
//   },
//   highlights: [
//     "Live performances from 10+ top artists",
//     "Gourmet food trucks and premium bars",
//     "VIP lounge with exclusive access",
//     "Free festival merchandise pack",
//     "Photo booths and interactive installations",
//     "Dance floor with professional lighting"
//   ]
// };

// const sampleOrganizer = {
//   id: 1,
//   name: "Event Pro Inc.",
//   email: "contact@eventpro.com",
//   joinDate: "January 2023",
//   avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
// };

// export default function EventDetails() {
//   const [activeImage, setActiveImage] = useState(sampleEvent.images[0]);
//   const [isLiked, setIsLiked] = useState(false);

//   return (
//     <div className="max-w-7xl mx-auto p-4 font-sans">
      
//       {/* MOBILE LAYOUT */}
//       <div className="md:hidden flex flex-col gap-4">
//         {/* Event Main Image */}
//         <div className="w-full h-60">
//           <img
//             src={activeImage}
//             alt={sampleEvent.title}
//             className="w-full h-full rounded-sm object-cover"
//           />
//         </div>

//         {/* Image Thumbnails */}
//         <div className="flex gap-2 overflow-x-auto">
//           {sampleEvent.images.map((img, i) => (
//             <img
//               key={i}
//               src={img}
//               alt={`Thumb ${i}`}
//               className={`w-24 h-16 object-cover rounded-sm cursor-pointer ${
//                 activeImage === img ? "border-2 border-blue-500" : ""
//               }`}
//               onClick={() => setActiveImage(img)}
//             />
//           ))}
//         </div>

//         {/* Organizer Info */}
//         <div className="flex items-center gap-3 bg-orange-500 text-white p-3">
//           <img
//             src={sampleOrganizer.avatar}
//             alt={sampleOrganizer.name}
//             className="w-12 h-12 object-cover rounded-full"
//           />
//           <div className="text-xs">
//             <p>{sampleOrganizer.name}</p>
//             <p>{sampleOrganizer.email}</p>
//             <p>Joined {sampleOrganizer.joinDate}</p>
//           </div>
//         </div>

//         <div className="flex justify-between items-start">

//         {/* Event Info */}
//         <div className="flex flex-col gap-2">
//           <h1 className="text-lg font-bold">{sampleEvent.title}</h1>
//           <p className="text-sm text-gray-600">{sampleEvent.date} • {sampleEvent.time}</p>
//           <p className="text-sm text-gray-500">{sampleEvent.category}</p>
//         </div>
          
//           {/* Action Icons */}
//         <div className="flex gap-2">
//           <button
//               onClick={() => setIsLiked(!isLiked)}
//               className="p-2 transition-transform hover:scale-110"
//             >
//               <FaHeart
//                 className={`w-6 h-6 ${
//                   isLiked ? "text-red-500" : "text-gray-400"
//                 } transition-colors duration-200`}
//               />
//             </button>
//           <button className="p-2 transition-transform hover:scale-110">
//             <FiShare2 className="w-6 h-6 text-gray-500 hover:text-gray-700"/>
//           </button>
//         </div>
//         </div>
//         {/* Location */}
//         <div className="space-y-2">
//           <div className="flex items-center gap-2">
//             <FaMapMarkerAlt className="w-4 h-4 text-gray-700" />
//             <span className="font-medium">Location</span>
//           </div>
//           <div className="text-sm">
//             <p className="font-semibold">{sampleEvent.location.name}</p>
//             <p className="text-gray-600">{sampleEvent.location.address}</p>
//           </div>
//           <div className="w-full h-40">
//             <iframe
//               src={sampleEvent.location.mapUrl}
//               width="100%"
//               height="100%"
//               style={{ border: 0 }}
//               allowFullScreen=""
//               loading="lazy"
//               title="Event Location"
//             ></iframe>
//           </div>
//         </div>

//         {/* Booking Button */}
//         <button className="w-full bg-orange-500 text-white py-2 text-sm rounded-sm hover:bg-orange-600 transition-colors">
//           Book Now - ${sampleEvent.price}
//         </button>

//         {/* Highlights */}
//         <div className="space-y-2">
//           <h2 className="font-semibold">Highlights</h2>
//           <div className="space-y-1">
//             {sampleEvent.highlights.map((highlight, i) => (
//               <div key={i} className="flex items-center gap-2">
//                 <FaStar className="w-4 h-4 text-yellow-500" />
//                 <span className="text-sm">{highlight}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* About This Event */}
//         <div className="space-y-2">
//           <h2 className="font-semibold">About This Event</h2>
//           <p className="text-sm text-gray-700">
//             {sampleEvent.description}
//           </p>
          
//           {/* Embedded Video */}
//           {sampleEvent.videoUrl && (
//             <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
//               <div className="text-center text-gray-500">
//                 <FaPlayCircle className="w-10 h-10 mx-auto" />
//                 <p className="text-sm mt-1">Embedded Video</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* DESKTOP LAYOUT */}
//       <div className="hidden sm:flex sm:gap-8">
//         {/* Left Column - 2/3 width */}
//         <div className="w-2/3 space-y-4">
//           {/* Main Image */}
//           <div className="w-full h-80">
//             <img
//               src={activeImage}
//               alt={sampleEvent.title}
//               className="w-full h-full rounded-sm object-cover"
//             />
//           </div>

//           {/* Image Thumbnails */}
//           <div className="grid grid-cols-4 gap-2">
//             {sampleEvent.images.map((img, i) => (
//               <img
//                 key={i}
//                 src={img}
//                 alt={`Thumb ${i}`}
//                 className={`w-full h-16 rounded-sm object-cover cursor-pointer ${
//                   activeImage === img ? "border-2 border-blue-500" : ""
//                 }`}
//                 onClick={() => setActiveImage(img)}
//               />
//             ))}
//           </div>

//           {/* About This Event */}
//           <div className="space-y-3">
//             <h2 className="font-semibold text-lg">About This Event</h2>
//             <p className="text-gray-700">
//               {sampleEvent.description}
//             </p>
            
//             {/* Embedded Video */}
//             {sampleEvent.videoUrl && (
//               <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
//                 <div className="text-center text-gray-500">
//                   <FaPlayCircle className="w-12 h-12 mx-auto" />
//                   <p className="text-lg mt-2">Embedded Video</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Right Column - 1/3 width */}
//         <div className="w-1/3 space-y-3 ">
//          {/* Action Icons */}
//             <div className="w-full flex items-center gap-3 bg-orange-500 text-white p-2 rounded-sm">
//               {/* FIXED: Changed w-15 h-15 to standard w-12 h-12 */}
//               <img
//                 src={sampleOrganizer.avatar}
//                 alt={sampleOrganizer.name}
//                 className="rounded-full w-12 h-12 object-cover"
//               />
//               <div className="text-sm">
//                 <p className="font-semibold">{sampleOrganizer.name}</p>
//                 <p>{sampleOrganizer.email}</p>
//                 <p>Joined {sampleOrganizer.joinDate}</p>
//               </div>
//             </div>

//           <div className="flex justify-between items-start">
//             {/* Event Title & Info */}
//           <div className="space-y-2">
//             <h1 className="text-xl font-bold">{sampleEvent.title}</h1>
//             <p className="text-sm text-gray-600">{sampleEvent.date} • {sampleEvent.time}</p>
//             <p className="text-sm text-gray-500">{sampleEvent.category}</p>
//           </div>
            
//             <div className="flex gap-0.5">
//               <button
//                   onClick={() => setIsLiked(!isLiked)}
//                   className="p-2 transition-transform hover:scale-110"
//                 >
//                   <FaHeart
//                     className={`w-6 h-6 ${
//                       isLiked ? "text-red-500" : "text-gray-400"
//                     } transition-colors duration-200`}
//                   />
//                 </button>
//               <button className="p-2 transition-transform hover:scale-110">
//                 <FiShare2 className="w-6 h-6 text-gray-500 hover:text-gray-700"/>
//               </button>
//             </div>
//           </div>
//           {/* Location */}
//           <div className="space-y-2">
//             <div className="flex items-center gap-2">
//               <FaMapMarkerAlt className="w-4 h-4 text-gray-700" />
//               <span className="font-medium">Location</span>
//             </div>
//             <div className="text-sm">
//               <p className="font-semibold">{sampleEvent.location.name}</p>
//               <p className="text-gray-600">{sampleEvent.location.address}</p>
//             </div>
//             <div className="w-full h-40">
//               <iframe
//                 src={sampleEvent.location.mapUrl}
//                 width="100%"
//                 height="100%"
//                 style={{ border: 0 }}
//                 allowFullScreen=""
//                 loading="lazy"
//                 title="Event Location"
//               ></iframe>
//             </div>
//           </div>

//           {/* Booking Button */}
//           <button className="w-full bg-orange-500 rounded-sm text-white py-2 hover:bg-orange-600 transition-colors">
//             Book Now - ${sampleEvent.price}
//           </button>

//           {/* Highlights */}
//           <div className="space-y-2">
//             <h5 className="font-semibold text-lg">Highlights</h5>
//             <div className="space-y-1">
//               {sampleEvent.highlights.map((highlight, i) => (
//                 <div key={i} className="flex items-center gap-2">
//                   <FaStar className="w-4 h-4 text-yellow-500" />
//                   <span className="text-sm">{highlight}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }