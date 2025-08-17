import React, { useState } from 'react';
import { X, Bell, Gift, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NavbarPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePopup = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      {/* Popup Trigger Button */}
      <Button 
        onClick={togglePopup}
        variant="ghost" 
        size="icon"
        className="text-white hover:text-blue-300 relative"
      >
        <Bell className="w-5 h-5" />
        {/* Red notification dot */}
        <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full animate-pulse"></span>
      </Button>

      {/* Popup Card */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Latest Updates</h3>
            <Button 
              onClick={() => setIsOpen(false)}
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Offer Card */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-start gap-3">
                <Gift className="w-6 h-6 text-red-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Special Offer!</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Get flat ₹500 off on orders above ₹2500. Limited time offer!
                  </p>
                  <Button className="mt-2 text-xs h-8 bg-red-500 hover:bg-red-600">
                    Shop Now
                  </Button>
                </div>
              </div>
            </div>

            {/* New Products */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <Star className="w-6 h-6 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">New Arrivals</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Check out our latest collection of custom print products!
                  </p>
                  <Button variant="outline" className="mt-2 text-xs h-8 border-blue-300 text-blue-600 hover:bg-blue-100">
                    View Collection
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-2">Today's Stats</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center">
                  <span className="block font-bold text-green-600">4.8★</span>
                  <span className="text-gray-600">Rating</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold text-green-600">2,453</span>
                  <span className="text-gray-600">Happy Customers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <p className="text-xs text-gray-500 text-center">
              Stay updated with AIJIM's latest offers and products
            </p>
          </div>
        </div>
      )}

      {/* Backdrop to close popup */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NavbarPopup;