// src/context/WishlistContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axiosConfig";
import { AuthContext } from "./AuthContext";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { currentUser } = useContext(AuthContext);

  const fetchWishlist = async () => {
    if (!currentUser) return;
    try {
      const res = await api.get("/wishlist");
      setWishlistItems(res.data);
    } catch (err) {
      console.error("Error fetching wishlist", err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [currentUser]);

  const addToWishlist = async (eventId) => {
    try {
      await api.post("/wishlist/add", { event_id: eventId }); // Changed
      await fetchWishlist();
    } catch (err) {
      throw err;
    }
  };

  const removeFromWishlist = async (wishlistId) => {
    try {
      await api.delete(`/wishlist/${wishlistId}`);
      setWishlistItems((prev) =>
        prev.filter((item) => item.wishlist_id !== wishlistId),
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
