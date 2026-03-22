// src/pages/Wishlist.js
import { useContext } from "react";
import { WishlistContext } from "../context/WishlistContext";
import EventCard from "../components/events/EventCard";

const Wishlist = () => {
  const { wishlistItems } = useContext(WishlistContext);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        My Wishlist ({wishlistItems.length})
      </h1>
      {wishlistItems.length === 0 ? (
        <p className="text-gray-500">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {wishlistItems.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
