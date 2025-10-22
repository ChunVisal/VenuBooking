// src/App.jsx
import { Routes, Route } from "react-router-dom"
import Navbar from "./components/layout/Navbar"
import Home from "./pages/Home/Home"
import Footer from "./components/layout/Footer"
import DetailEvent from "./pages/DetailEvent"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import CreateEvent from "./pages/CreateEvent"
import MyBooking from "./pages/MyBooking"
import Event from "./pages/Event"
import Profile from "./pages/Profile"
import Wishlist from "./pages/Wishlist"
import EditProfile from "./pages/EditProfile"

function App() {
return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<DetailEvent/>}/>
        <Route path="/wishlist" element={<Wishlist/>}></Route>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/my-bookings" element={<MyBooking/>}/>
        <Route path="/create-event" element={<CreateEvent/>}/>
        <Route path="/events" element={<Event/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/edit-profile" element={<EditProfile/>}/>
      </Routes>
      <Footer />

    </>
  )
}

export default App
