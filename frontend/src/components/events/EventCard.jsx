// src/components/events/EventCard.jsx

import { Link, useNavigate } from 'react-router-dom'; // <-- ADDED useNavigate
import { useState, useContext } from 'react'; // <-- ADDED useContext
import { AuthContext } from '../../context/AuthContext'; // <-- IMPORT AuthContext
import api from '../../api/axiosConfig'; // <-- IMPORT api for requests
import { Search, Bell, User, Calendar, Plus, Heart, BookOpen, Menu, X, Home } from 'lucide-react';

const EventCard = ({ event }) => {
    // 1. PULL IN CONTEXT AND HOOKS
    const { currentUser } = useContext(AuthContext); // <-- FIX: Define currentUser here
    const navigate = useNavigate(); // <-- FIX: Define navigate here
    const [isWished, setIsWished] = useState(false);

    const handleAddToWishlist = async () => {
    // FIX: Now currentUser is defined
        if (!currentUser) {
            alert("Please log in to add to your wishlist.");
            navigate('/login');
            return;
        }

        try {
            // FIX: Use event.id since 'id' is not defined in this component
            // Hits POST /api/wishlist/:eventIdf
            const res = await api.post(`/wishlist/${event.id}`); 
            alert(res.data);
            setIsWished(true); // Update state
        } catch (err) {
            const msg = err.response?.data || "Failed to add to wishlist.";
            alert(msg);
        }
    };
    
    // Helper function to format the date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
       <div style={{weight: '300px', border: '1px solid #ccc', borderRadius: '8px', padding: '15px', boxShadow: '2px 2px 12px rgba(0,0,0,0.1)', height: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
       
         <div>
              
                <button 
                    onClick={handleAddToWishlist} 
                    // currentUser is now correctly defined
                    disabled={!currentUser || isWished} 
                    style={{
                        padding: '10px 20px', 
                      backgroundColor: isWished ? 'gray' : '#DCDCDC',
                       borderRadius: '5px',
                        color: 'white', 
                        border: 'none', 
                        cursor: 'pointer', 
                        marginTop: '15px',
                        marginLeft: '10px'
                    }}
                >
                    {isWished ? <Heart color='red'/> : <Heart/>}
                </button>
            </div>
        <div className="event-card" style={{weight: '300px',  padding: '15px', }}>
            <h3 style={{marginBottom: '5px'}}>{event.title}</h3>
            <p style={{fontSize: '0.9em', color: '#555'}}>@ {event.venue}</p>
            <p><strong>Date:</strong> {formatDate(event.date)}</p>
            <p style={{fontWeight: 'bold', color: 'green'}}>Price: ${parseFloat(event.price).toFixed(2)}</p>
            <div>
         <Link to={`/event/${event.id}`}>
                    <button style={{marginTop: '10px', padding: '8px 15px', cursor: 'pointer'}}>View Details / Buy Ticket</button>
                </Link>
            </div>
            
        
        </div>
        
         </div>
    );
};

export default EventCard;

// import { Calendar, MapPin, Clock, Tag, ChevronRight, Heart, MoreVertical } from "lucide-react";
// import { Link } from "react-router-dom";
// import { useState } from "react";

// const EventCard = ({ event, className }) => {
//   const [isWishlisted, setIsWishlisted] = useState(false);

//   return (
//     <div
//       className={`w-full cursor-pointer group transition-all duration-300 ${className}`}
//     >
//       <Link
//         to={"/event"}
//         className="flex flex-col h-full border-gray-200 overflow-hidden shadow transition duration-300"
//       >
//         {/* Image Section */}
//         <div className="h-48 relative overflow-hidden">
//           <img
//             src={event.imageUrl}
//             alt={event.title}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//           />

//           {/* Price Tag */}
//           <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-md text-gray-900 text-sm sm:text-base font-semibold px-3 py-1 rounded-md shadow">
//             {event.price}
//           </span>

//           {/* Wishlist & More Button */}
//           <div className="absolute top-2 right-2 flex items-center space-x-2">
//             <button
//               onClick={(e) => {
//                 e.preventDefault();
//                 setIsWishlisted(!isWishlisted);
//               }}
//               className="bg-white/80 backdrop-blur-md p-1.5 rounded-full hover:bg-white transition"
//             >
//               <Heart
//                 className={`h-4 w-4 ${
//                   isWishlisted ? "text-red-500 fill-red-500" : "text-gray-600"
//                 } transition-all duration-300`}
//               />
//             </button>
//             <button
//               onClick={(e) => e.preventDefault()}
//               className="bg-white/80 backdrop-blur-md p-1.5 rounded-full hover:bg-white transition"
//             >
//               <MoreVertical className="h-4 w-4 text-gray-600" />
//             </button>
//           </div>
//         </div>

//         {/* Content Section */}
//         <div className="p-4 flex flex-col flex-1">
//           <h6 className="text-gray-900 font-semibold mb-1">
//             {event.title}
//           </h6>

//           {/* Date & Time */}
//           <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-1">
//             <Calendar className="h-4 w-4 mr-1" />
//             <span>{event.date}</span>
//           </div>
//           <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-1">
//             <Clock className="h-4 w-4 mr-1" />
//             <span>{event.time}</span>
//           </div>

//           {/* Location */}
//           <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-3">
//             <MapPin className="h-4 w-4 mr-1" />
//             <span className="line-clamp-1">{event.location}</span>
//           </div>

//           {/* Features */}
//           <ul className="text-gray-700 mb-3 text-xs sm:text-sm list-disc list-inside space-y-0.5">
//             {event.features.map((desc, i) => (
//               <li key={i} className="line-clamp-1">
//                 {desc}
//               </li>
//             ))}
//           </ul>

//           {/* Bottom Actions */}
//           <div className="flex justify-between items-center mt-auto">
//             <span className="inline-flex items-center text-xs sm:text-sm bg-gray-200 text-gray-700 px-2 sm:px-3 py-1 rounded-full font-medium">
//               <Tag className="h-3 w-3 mr-1 text-gray-500" /> {event.category}
//             </span>

//             <button className="flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 transition">
//               Details <ChevronRight className="h-4 w-4 ml-1" />
//             </button>
//           </div>
//         </div>
//       </Link>
//     </div>
//   );
// };

// export default EventCard;
