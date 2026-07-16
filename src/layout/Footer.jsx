import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Upper Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              className="text-xl font-black tracking-wider text-[#0f172a] dark:text-white flex items-center gap-1.5"
            >
              <span className="text-blue-500">KH</span> PHARMACY.
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500 max-w-xs">
              Your trusted partner in healthcare management and pharmaceutical supplies. Quality formula items delivered with standard care.
            </p>
          </div>

          {/* Navigation Links Column */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/kh/home" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/kh/favourites" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link to="/kh/cart" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policies Column */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/terms" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                  Security Guard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Support Column */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Contact Support
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400 dark:text-slate-500">
              <li className="flex items-center gap-2">
                <span>📍</span> Phnom Penh, Cambodia
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span> support@khpharmacy.com
              </li>
            </ul>
          </div>

        </div>

        {/* Lower Divider Line & Copyright Context */}
        <div className="pt-8 border-t border-gray-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 tracking-wide text-center sm:text-left capitalize">
            &copy; {currentYear} Copyright by Sokleap. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">
            <span>Pure Backend Architecture System</span>
          </div>
        </div>

      </div>
    </footer>
  );
}