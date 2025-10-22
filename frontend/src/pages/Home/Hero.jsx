import { useState, useEffect } from 'react';
import { Calendar, CalendarPlus } from 'lucide-react';

const slides = [
  {
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=2070&q=80",
    headline: "Effortless Event Booking",
    subtext: "Reserve your spot at top concerts, sports, and conferences in seconds.",
  },
  {
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2070&q=80",
    headline: "Discover Local Experiences",
    subtext: "Browse curated events and venues tailored to your interests and location.",
  },
  {
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=2070&q=80",
    headline: "Secure Digital Tickets",
    subtext: "Get instant access to your tickets and manage bookings from any device.",
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

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
            src={slide.image}
            alt={slide.headline}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
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
            <button className="flex-1 flex items-center justify-center gap-2 px-5 py-1 rounded-full bg-orange-500 text-white hover:bg-orange-400 transition-colors">
              <Calendar className="w-3.5 h-3.5" />
              Get A Ticket
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-5 py-1 rounded-full border border-gray-300 text-gray-100 transition-colors bg-white/10 backdrop-blur-3xl backdrop-saturate-200 hover:bg-white/20">
              <CalendarPlus className="w-3.5 h-3.5" />
              Create Events
            </button>
          </div>
          {/* Optional Stats Row */}
        <div className="flex gap-6 text-gray-400 text-[12.5px] mt-2">
          <span>10,000+ Bookings</span>
          <span>Trusted by 500+ Venues</span>
          <span>Event Avaiable 100+</span>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-5 bg-orange-500' : 'w-2 bg-gray-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;