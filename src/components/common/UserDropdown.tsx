import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface User {
  id: number;
  name: string;
  avatar: string;
  initials: string;
}

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number } | null;
}

const users: User[] = [
  { id: 1, name: 'Jane Smith', avatar: 'https://i.pravatar.cc/100?img=1', initials: 'JS' },
  { id: 2, name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/100?img=2', initials: 'MJ' },
  { id: 3, name: 'John Doe', avatar: 'https://i.pravatar.cc/100?img=3', initials: 'JD' },
  { id: 4, name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/100?img=4', initials: 'SW' },
  { id: 5, name: 'Alex Brown', avatar: 'https://i.pravatar.cc/100?img=5', initials: 'AB' }
];

export default function UserDropdown({ isOpen, onClose, position }: UserDropdownProps) {
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

  if (!isOpen || !position) return null;

  return (
    <div 
      className="fixed z-50 left-4 right-4 sm:left-auto sm:right-auto mx-auto sm:mx-0 user-dropdown-wrapper"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: 'translateX(-50%)'
      }}
    >
      <div 
        ref={dropdownRef}
        className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-[calc(100vw-2rem)] sm:w-80 max-h-96 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Loyihada ishtirokchilar
          </h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-3 h-3 text-gray-500" />
          </button>
        </div>

        {/* Users List */}
        <div className="overflow-y-auto custom-scrollbar p-3 space-y-2">
          {users.map((user) => (
            <div 
              key={user.id}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer group bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-semibold text-xs shadow-sm overflow-hidden flex-shrink-0">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-full h-full flex items-center justify-center">
                  {user.initials}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {user.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {user.name.toLowerCase().replace(' ', '.')}@taskly.uz
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
