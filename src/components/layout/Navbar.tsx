import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, X, Globe } from 'lucide-react';
import NotificationDropdown from '../../NotificationDropdown';
import ProfileDropdown from '../../ProfileDropdown';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

interface NavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  user: User | null;
  userAvatar: string | null;
  translations: {
    searchPlaceholder: string;
    menu: string;
  };
  onSearch?: (query: string) => void;
}

export default function Navbar({ 
  isSidebarOpen, 
  onToggleSidebar, 
  user, 
  userAvatar,
  translations,
  onSearch 
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center flex-1">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
          aria-label={translations.menu}
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile Logo */}
        <div className="md:hidden flex items-center mr-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="ml-2 text-lg font-bold text-gray-900">Taskly</span>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md ml-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={translations.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg text-sm transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2">
        {/* Language Toggle */}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:flex items-center space-x-1">
          <Globe className="w-5 h-5 text-gray-600" />
        </button>

        {/* Notifications */}
        <div ref={notificationRef} className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <NotificationDropdown 
            isOpen={showNotifications} 
            onClose={() => setShowNotifications(false)} 
          />
        </div>

        {/* User Profile */}
        <div ref={profileRef} className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-semibold text-sm shadow-sm overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || '?'
              )}
            </div>
          </button>
          <ProfileDropdown 
            isOpen={showProfile} 
            onClose={() => setShowProfile(false)} 
            userAvatar={userAvatar}
            userName={user?.name || ''}
            userEmail={user?.email || ''}
          />
        </div>
      </div>
    </header>
  );
}
