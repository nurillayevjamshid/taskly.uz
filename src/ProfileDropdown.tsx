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
  Keyboard,
  Bell,
  CheckCircle
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';

// Toast komponenti
const Toast = ({ message, isVisible, onClose }: { message: string; isVisible: boolean; onClose: () => void }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
      <CheckCircle className="w-5 h-5 text-green-600" />
      <span className="font-medium">{message}</span>
    </div>
  );
};

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  userAvatar: string | null;
  userName: string;
  userEmail: string;
}

export default function ProfileDropdown({ isOpen, onClose, userAvatar, userName, userEmail }: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Logout funksiyasi
  const handleLogout = async () => {
    // Tasdiqlash dialogi
    const confirmed = window.confirm('Tizimdan chiqmoqchimisiz? Barcha saqlangan vazifalar xavfsiz.');
    
    if (!confirmed) {
      return; // Foydalanuvchi bekor qildi
    }

    try {
      // 1. localStorage dan faqat auth ma'lumotlarini o'chirish (vazifalarni emas)
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('auth') || 
          key.includes('user') || 
          key.includes('token') || 
          key.includes('session') ||
          key.includes('firebase') ||
          key.includes('credential')
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // 2. sessionStorage ni to'liq tozalash
      sessionStorage.clear();

      // 3. Firebase dan chiqish
      await signOut(auth);

      // 4. Toast xabari ko'rsatish
      setToastMessage('Siz tizimdan chiqdingiz');
      setShowToast(true);

      // 5. Modal yopish
      onClose();

      // 6. 1.5 sekund kutib kirish.html ga o'tish
      setTimeout(() => {
        window.location.href = '/kirish.html';
      }, 1500);

    } catch (error) {
      console.error('Logout xatolik:', error);
      alert('Chiqishda xatolik yuz berdi. Qayta urining.');
    }
  };

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
              {userAvatar ? <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" /> : (userName ? userName.charAt(0).toUpperCase() : 'U')}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{userName}</h3>
              <p className="text-sm text-gray-500">{userEmail}</p>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <button 
              onClick={() => window.location.href = '/kirish.html'}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center"
            >
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
            <button className="md:hidden w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center justify-between">
              <span className="flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                Bildirishnomalar
              </span>
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                <span className="text-xs text-gray-500">3</span>
              </span>
            </button>
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
            <button 
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Chiqish
            </button>
          </div>
        </div>
      </div>
      
      {/* Toast xabari */}
      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
}
