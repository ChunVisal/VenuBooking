import { useState, useEffect } from "react";
import { Calendar, CalendarPlus } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axiosConfig";

const slides = [
  {
    image:
      "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
    headline: "Effortless Event Booking",
    subtext:
      "Reserve your spot at top concerts, sports, and conferences in seconds.",
  },
  {
    image:
      "https://res.cloudinary.com/dexr27qho/image/upload/v1778132246/9db3ad48-86e9-4b0b-932b-bc0444c03b60_hpwtrc.jpg",
    headline: "Discover Local Experiences",
    subtext:
      "Browse curated events and venues tailored to your interests and location.",
  },
  {
    image:
      "https://static.vecteezy.com/system/resources/thumbnails/032/945/972/small/shiny-microphone-illuminates-singer-face-on-stage-free-photo.jpg",
    headline: "Secure Digital Tickets",
    subtext:
      "Get instant access to your tickets and manage bookings from any device.",
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({ bookings: 0, venues: 0, events: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative sm:h-[60vh] h-40vh] min-h-[350px] flex items-center justify-center bg-black overflow-hidden font-sans">
      {/* Background Image Slider */}
      <div className="absolute inset-0">
        {slides.map((slide, idx) => (
          <img
            key={idx}
            src={slide.image
              .replace("w=2070", "w=1200")
              .replace("q=80", "q=60")}
            alt={slide.headline}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${idx === currentSlide ? "opacity-100" : "opacity-0"}`}
            draggable={false}
          />
        ))}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full mx-auto px-7 flex flex-col items-start">
        {/* Headline & Subtext */}
        <h1 className="text-white sm:text-3xl text-2xl font-medium text-center mb-1 leading-tight">
          {slides[currentSlide].headline}
        </h1>
        <p className="text-gray-200 sm:whitespace-nowrap text-[13px] sm:text-center text-start mb-2 max-w-md">
          {slides[currentSlide].subtext}
        </p>
        <div className="flex gap-3 text-[12.5px] whitespace-nowrap ">
          <Link
            to="/events"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-1 rounded-full bg-orange-500 text-white hover:bg-orange-400 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            Get A Ticket
          </Link>
          <Link
            to="/create-event"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-1 rounded-full border border-gray-300 text-gray-100 transition-colors bg-white/10 backdrop-blur-3xl backdrop-saturate-200 hover:bg-white/20"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            Create Events
          </Link>
        </div>
        {/* Optional Stats Row */}
        <div className="flex gap-6 text-gray-400 text-[12.5px] mt-2">
          <span>{stats.bookings.toLocaleString()}+ Bookings</span>
          <span>Trusted by {stats.venues}+ Venues</span>
          <span>{stats.events}+ Events Available</span>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide ? "w-5 bg-orange-500" : "w-2 bg-gray-400"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
