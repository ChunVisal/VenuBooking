// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Static components (always load)
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Breadcrumb from "./components/common/Breadcrumb";
import ScrollToTop from "./components/common/ScrollToTop";

// Lazy load page components
const Home = lazy(() => import("./pages/Home/Home"));
const DetailEvent = lazy(() => import("./pages/DetailEvent"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const BookingPage = lazy(() => import("./pages/Bookings"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const Event = lazy(() => import("./pages/Event"));
const Profile = lazy(() => import("./pages/Profile"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const ProtectedRoute = lazy(() => import("./pages/ProtectedRoute"));
const MyEvents = lazy(() => import("./pages/MyEvents"));
const EditEvent = lazy(() => import("./pages/EditEvent"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));

// Loading component
const PageLoader = () => (  
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
  </div>
);

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />
      <Breadcrumb />
      <ScrollToTop />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<DetailEvent />} />
          <Route path="/wishlist" element={<Wishlist />} />
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
      </Suspense>

      <Footer />
    </>
  );
}

export default App;
