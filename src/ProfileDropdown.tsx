import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Activity, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  ExternalLink, 
  ChevronRight,
  Plus,
  Keyboard
} from 'lucide-react';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  userAvatar: string | null;
  userName: string;
  userEmail: string;
}

export default function ProfileDropdown({ isOpen, onClose, userAvatar, userName, userEmail }: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div 
        ref={dropdownRef}
        className="absolute right-4 top-16 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Account Section */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-semibold text-sm shadow-sm overflow-hidden">
              {userAvatar ? <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" /> : 'JD'}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{userName}</h3>
              <p className="text-sm text-gray-500">{userEmail}</p>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center">
              <User className="w-4 h-4 mr-2" />
              Hisoblarni almashtirish
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center justify-between">
              <span className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Hisobni boshqarish
              </span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Taskly Section */}
        <div className="p-2">
          <h4 className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Taskly</h4>
          <div className="space-y-1 mt-1">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center">
              <User className="w-4 h-4 mr-2" />
              Profil va ko'rinish
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Faoliyat
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Kartalar
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Sozlamalar
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center justify-between">
              <span className="flex items-center">
                <div className="w-4 h-4 mr-2 flex items-center justify-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>
                Mavzu
              </span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Other Options */}
        <div className="p-2 border-t border-gray-100">
          <div className="space-y-1">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Ish joyini yaratish
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center">
              <HelpCircle className="w-4 h-4 mr-2" />
              Yordam
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center">
              <Keyboard className="w-4 h-4 mr-2" />
      Yorliqlar
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center">
              <LogOut className="w-4 h-4 mr-2" />
              Chiqish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
