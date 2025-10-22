import React from 'react';
import { Calendar, MapPin, Mail, Phone, Facebook, Twitter, Linkedin, Instagram, ArrowRight, BookOpen, Plus } from 'lucide-react';

// Footer component matching the Navbar's aesthetic and typography
const Footer = () => {
    // Base link style
    const linkClasses = `text-gray-600 hover:text-orange-600 transition duration-150`;
    // Heading style
    const headingClasses = ' font-semibold text-gray-900 mb-4 tracking-wider uppercase';

    return (
        <footer className=" border-t border-gray-100 py-10 md:py-16">
            <div className="mx-auto max-w-7xl px-6">
                
                {/* Main Grid Layout (4 Columns on large screen, 2 on tablet, stacked on mobile) */}
                <div className="grid grid-cols-2 gap-y-10 md:grid-cols-4 md:gap-x-12 lg:gap-x-20">

                    {/* Column 1: Brand and Mission */}
                    <div className="col-span-2 md:col-span-1 pr-6">
                        <div className="flex items-center space-x-1 mb-4">
                            <Calendar className="w-5 h-5 text-orange-600" />
                            <h2 className="text-xl font-bold text-gray-950">VenuBooking</h2>
                        </div>
                        <p className={`text-gray-600 mb-4`} style={{ lineHeight: '1.6' }}>
                            Your premier platform for discovering and booking the perfect venue for any event, 
                            from tech summits to music showcases.
                        </p>

                        {/* Newsletter Signup (Styled to match the orange accent) */}
                        <div className="mt-6">
                            <p className=" font-medium text-gray-800 mb-2">Stay Updated</p>
                            <div className="flex items-center w-full">
                                <input 
                                    type="email"
                                    placeholder="Your email"
                                    className={`p-2 border border-gray-300 rounded-l outline-none focus:border-orange-500 w-full`}
                                />
                                <button className="bg-orange-600 text-white p-2 rounded-r hover:bg-orange-700 transition duration-150" aria-label="Subscribe">
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Host Tools (For Organizers) */}
                    <div>
                        <h3 className={headingClasses}>Host Tools</h3>
                        <ul className="space-y-3">
                            {/* Primary CTA for listing */}
                            <li>
                                <a href="#" className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 font-bold transition duration-150">
                                    <Plus className="w-4 h-4" />
                                    <span >List Your Venue</span>
                                </a>
                            </li>
                            <li><a href="#" className={linkClasses}>Manage My Events</a></li>
                            <li><a href="#" className={linkClasses}>Venue Owner Portal</a></li>
                            <li><a href="#" className={linkClasses}>Analytics & Reports</a></li>
                            <li><a href="#" className={linkClasses}>Pricing & Fee Structure</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Discover Events (For Attendees) */}
                    <div>
                        <h3 className={headingClasses}>Discover Events</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className={linkClasses}>Events Near Me</a></li>
                            <li><a href="#" className={linkClasses}>Browse All Categories</a></li>
                            <li><a href="#" className={linkClasses}>Today's Hot Picks</a></li>
                            <li><a href="#" className={linkClasses}>My Bookings</a></li>
                            <li><a href="#" className={linkClasses}>Venue Directory</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact and Socials */}
                    <div>
                        <h3 className={headingClasses}>Contact</h3>
                        <ul className="space-y-3 mb-6">
                            <li className={`flex items-start space-x-2 text-gray-600`}>
                                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-orange-500" />
                                <span>Phnom Penh, Cambodia</span>
                            </li>
                            <li className={`flex items-center space-x-2 text-gray-600`}>
                                <Mail className="w-3.5 h-3.5 flex-shrink-0 text-orange-500" />
                                <a href="mailto:support@venubooking.com" className={linkClasses}>support@venubooking.com</a>
                            </li>
                            <li className={`flex items-center space-x-2 text-gray-600`}>
                                <Phone className="w-3.5 h-3.5 flex-shrink-0 text-orange-500" />
                                <span>+855 12 345 678</span>
                            </li>
                        </ul>

                        <h3 className={headingClasses}>Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" aria-label="Facebook" className="text-gray-500 hover:text-blue-600 transition duration-150"><Facebook className="w-5 h-5" /></a>
                            <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-blue-400 transition duration-150"><Twitter className="w-5 h-5" /></a>
                            <a href="#" aria-label="LinkedIn" className="text-gray-500 hover:text-blue-700 transition duration-150"><Linkedin className="w-5 h-5" /></a>
                            <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-pink-600 transition duration-150"><Instagram className="w-5 h-5" /></a>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom (Copyright and Legal Links) */}
                <div className="pt-8 mt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <p className={`text-gray-500`}>
                        &copy; {new Date().getFullYear()} VenuBooking. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        <a href="#" className={linkClasses}>Privacy Policy</a>
                        <a href="#" className={linkClasses}>Terms of Service</a>
                        <a href="#" className={linkClasses}>Security & Trust</a>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
