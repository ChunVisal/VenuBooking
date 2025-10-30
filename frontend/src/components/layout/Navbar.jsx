import { useState, useContext } from 'react';
import { Search, Bell, User, Calendar, Plus, Heart, BookOpen, Menu, X, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Reusable classes (same as yours)
  const navItemClasses = "flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors rounded-lg";
  const mobileLinkClasses = "w-full p-3 text-base text-left";
  const desktopLinkClasses = "px-3 py-2 text-sm font-medium";
  const iconButtonClasses = "p-2 text-gray-600 hover:text-orange-600 transition-colors rounded-full hover:bg-gray-100";
  const authButtonClasses = "hidden md:flex items-center space-x-1 border border-gray-200 px-4 py-1 rounded-full bg-orange-50 hover:bg-orange-100 text-sm whitespace-nowrap text-orange-700 font-semibold transition-colors";

  const navItems = [
    { name: 'Create Event', icon: Plus, to: '/create-event' },
    { name: 'Events', icon: Calendar, to: '/events' },
    { name: 'My Bookings', icon: BookOpen, to: '/my-bookings' },
    { name: 'Wishlist', icon: Heart, to: '/wishlist' },
  ];

  // 🧠 Fix 1: Don't render anything until loading is done
  if (loading) {
    return (
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 shadow-md">
        <div className="h-[48px]"></div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 ml-2 group focus:outline-none"> 
          <Calendar className="w-6 h-6 text-orange-600 group-hover:text-orange-700 transition-colors" />
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">VenuBooking</h2>
        </Link>
         
        {/* Right Section */}
        <div className="flex items-center space-x-8"> 
          
          {/* Desktop Nav */}
          <div className="hidden md:flex whitespace-nowrap items-center space-x-1"> 
            {navItems.map((item) => (
              <Link key={item.name} to={item.to} className={`${navItemClasses} ${desktopLinkClasses}`}>
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
          
          {/* Utilities */}
          <div className="flex items-center space-x-3">
              
            <div className="hidden sm:flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-orange-200 w-full max-w-xs">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search events, venues..."
                className="text-sm bg-transparent placeholder-gray-500 outline-none w-full"
              />
            </div>
            
            <button aria-label="Search" className={`${iconButtonClasses} sm:hidden`}>
              <Search className="w-5 h-5" />
            </button>
            
            <button aria-label="Notifications" className={iconButtonClasses}>
              <Bell className="w-5 h-5" />
            </button>

            {/* 🧠 Fix 2: Clean login / profile display */}
            {currentUser ? (
              <Link to="/profile" className="flex flex-col items-start leading-tight text-sm">
                <span className="font-semibold text-gray-800">{currentUser.name}</span>
                <span className="text-gray-500 text-xs">{currentUser.email}</span>
              </Link>
            ) : (
              <Link to="/login" className={authButtonClasses}>
                <User className="w-4 h-4" />
                <span>Account / Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
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
      
      {/* 🧠 Fix 3: Mobile Menu (sync with auth) */}
      {isMenuOpen && (
        <div className="md:hidden pt-4 pb-2 border-t border-gray-100 mt-3 absolute left-0 w-full bg-white shadow-lg">
          <div className="flex flex-col space-y-1 px-4">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className={`${navItemClasses} ${mobileLinkClasses}`}>
              <Home className="w-5 h-5" />
              <span className='font-semibold'>Home</span>
            </Link>

            {navItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.to} 
                onClick={() => setIsMenuOpen(false)}
                className={`${navItemClasses} ${mobileLinkClasses}`}
              >
                <item.icon className="w-5 h-5" />
                <span className='font-semibold whitespace-nowrap'>{item.name}</span>
              </Link>
            ))}

            <div className="border-t border-gray-100 my-2 pt-2"></div>
            
            {currentUser ? (
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className={`${navItemClasses} ${mobileLinkClasses}`}>
                <User className="w-5 h-5" />
                <span className='font-semibold'>Profile ({currentUser.name})</span>
              </Link>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className={`${navItemClasses} ${mobileLinkClasses}`}>
                <User className="w-5 h-5" />
                <span className='font-semibold'>Account / Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
