import React, { useState } from 'react';
import { Search, Bell, User, Calendar, Plus, Heart, BookOpen, Menu, X, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  // State to control the visibility of the collapsed mobile menu/links
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Define all reusable navigation items as an array
  const navItems = [
    { name: 'Create Event', icon: Plus, to: '/create-event' }, 
    { name: 'Events', icon: Calendar, to: '/events' },
    { name: 'My Bookings', icon: BookOpen, to: '/my-bookings' },
    { name: 'Wishlsit', icon: Heart, to: '/wishlist' },
  ];

  // Reusable classes for internal links (Orange theme)
  const navItemClasses = "flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors rounded-lg";
  const mobileLinkClasses = "w-full p-3 text-base text-left";
  const desktopLinkClasses = "px-3 py-2 text-sm font-medium";

  // Reusable button for utility icons (Orange theme)
  const iconButtonClasses = "p-2 text-gray-600 hover:text-orange-600 transition-colors rounded-full hover:bg-gray-100";

  // New clean class for the Sign In button
  const authButtonClasses = "hidden md:flex items-center space-x-1 border border-gray-200 px-4 py-1 rounded-full bg-orange-50 hover:bg-orange-100 text-sm whitespace-nowrap text-orange-700 font-semibold transition-colors";


  return (
    <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LEFT SECTION: Logo/Brand (FIXED: Removed manual padding, relying on main py-3 and items-center) */}
        <Link to="/" className="flex items-center space-x-2 ml-2 group focus:outline-none"> 
          <Calendar className="w-6 h-6 text-orange-600 group-hover:text-orange-700 transition-colors" />
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">VenuBooking</h2>
        </Link>
         
        {/* RIGHT SECTION (COMBINED): Main Nav + Utility Icons */}
        <div className="flex items-center space-x-8"> 
          
          {/* Main Navigation Items (Visible at MD/Laptop breakpoint) */}
          <div className="hidden md:flex whitespace-nowrap items-center space-x-1"> 
            {navItems.map((item) => (
              <Link key={item.name} to={item.to} className={`${navItemClasses} ${desktopLinkClasses}`}>
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
          
          {/* Utility Icons & Search Bar (Responsive) */}
          <div className="flex items-center space-x-3">
              
            {/* Desktop Search Bar (Orange ring focus) */}
            <div className="hidden sm:flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-orange-200 w-full max-w-xs">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search events, venues..."
                className="text-sm bg-transparent placeholder-gray-500 outline-none w-full"
              />
            </div>
            
            {/* Universal Icons */}
            <button aria-label="Search" className={`${iconButtonClasses} sm:hidden`}>
                <Search className="w-5 h-5" />
            </button>
            
            <button aria-label="Notifications" className={iconButtonClasses}>
              <Bell className="w-5 h-5" />
            </button>
            
            {/* Account/Auth Links (Sign In button - using new clean class) */}
            <Link to={'/login'} className={authButtonClasses}> 
              <User className="w-5 h-5 text-orange-600" />
              <span>Sign In</span>
            </Link>
            
            {/* Hamburger/Close Toggle Button (Mobile Only) */}
            <button 
              aria-label="Toggle Menu"
              className={`${iconButtonClasses} md:hidden`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* COLLAPSED MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden pt-4 pb-2 border-t border-gray-100 mt-3 absolute left-0 w-full bg-white shadow-lg">
            <div className="flex flex-col space-y-1 px-4">
                
                {/* Home Link */}
                <Link to="/" onClick={() => setIsMenuOpen(false)} className={`${navItemClasses} ${mobileLinkClasses}`}>
                    <Home className="w-5 h-5" />
                    <span className='font-semibold'>Home</span>
                </Link>

                {navItems.map((item) => (
                    <Link 
                        key={item.name} 
                        to={item.to} 
                        onClick={() => setIsMenuOpen(false)} // Close menu on click
                        className={`${navItemClasses} ${mobileLinkClasses}`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className='font-semibold whitespace-nowrap'>{item.name}</span>
                    </Link>
                ))}
                
                {/* Auth Links (Mobile) */}
                <div className="border-t border-gray-100 my-2 pt-2"></div>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className={`${navItemClasses} ${mobileLinkClasses}`}>
                    <User className="w-5 h-5" />
                    <span className='font-semibold'>Account / Sign In</span>
                </Link>
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
