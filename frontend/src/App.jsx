// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home/Home";
import Footer from "./components/layout/Footer";
import DetailEvent from "./pages/DetailEvent";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CreateEvent from "./pages/CreateEvent";
import MyBookings from "./pages/MyBookings";
import BookingPage from "./pages/Bookings";
import PaymentPage from "./pages/PaymentPage";
import Event from "./pages/Event";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import EditProfile from "./pages/EditProfile";
import PublicProfile from "./pages/PublicProfile";
import ProtectedRoute from "./pages/ProtectedRoute";
import MyEvents from "./pages/MyEvents";
import EditEvent from "./pages/EditEvent";
import Breadcrumb from "./components/common/Breadcrumb";
import ScrollToTop from "./components/common/ScrollToTop";
import NotificationsPage from "./pages/NotificationsPage";

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />
      <Breadcrumb />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<DetailEvent />} />
        <Route path="/wishlist" element={<Wishlist />}></Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/book/:eventId" element={<BookingPage />} />
        <Route path="/payment/:eventId" element={<PaymentPage />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/events" element={<Event />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/profile/:username" element={<PublicProfile />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-event/:id"
          element={
            <ProtectedRoute>
              <EditEvent />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
