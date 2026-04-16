import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  MoreHorizontal,
  Check,
  X
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'task' | 'reminder' | 'activity';
  title: string;
  description: string;
  date: string;
  time?: string;
  status?: string;
  department?: string;
  isRead: boolean;
  userInitials?: string;
  userName?: string;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'task',
      title: 'Vazifa bajarildi',
      description: "Durdona bilan 1 haftalik miya storislarini videosini olish 13:00 gacha",
      date: '7 апр. - 8 апр.',
      status: 'Marketing bo\'limi: Bajarildi',
      isRead: false
    },
    {
      id: '2',
      type: 'reminder',
      title: 'Eslatma',
      description: 'Muhum topshiriqni tugatish eslatmasi',
      date: 'Истек 8 апр. 2026 г.',
      time: '13:00',
      isRead: false
    },
    {
      id: '3',
      type: 'activity',
      title: 'Faollik',
      description: "Kartochka \"Jarayonda\" ustuniga ko'chirildi",
      date: '8 апр. 2026 г., 14:30',
      userInitials: 'JD',
      userName: 'Jamshid',
      isRead: true
    },
    {
      id: '4',
      type: 'task',
      title: 'Yangi vazifa',
      description: "Web dizayni loyihasi uchun prototip yaratish",
      date: '8 апр. - 9 апр.',
      status: 'Dizayn bo\'limi: Jarayonda',
      isRead: true
    },
    {
      id: '5',
      type: 'activity',
      title: 'Faollik',
      description: "Kartochka \"Bajarildi\" ustuniga ko'chirildi",
      date: '9 апр. 2026 г., 10:15',
      userInitials: 'DN',
      userName: 'Durdona',
      isRead: false
    }
  ]);

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

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const filteredNotifications = showOnlyUnread 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div 
        ref={dropdownRef}
        className="absolute right-16 top-16 w-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-h-[600px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Bildirishnomalar</h3>
            <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyUnread}
                onChange={(e) => setShowOnlyUnread(e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Faqat o'qilmaganlarni ko'rsatish
            </label>
            
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Barchasini o'qilgan deb belgilash
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Bildirishnomalar yo'q</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                    !notification.isRead ? 'bg-blue-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {notification.type === 'task' && (
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                      )}
                      {notification.type === 'reminder' && (
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                      )}
                      {notification.type === 'activity' && (
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                          {notification.userInitials}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-900 leading-relaxed">
                          {notification.type === 'reminder' && (
                            <span className="text-orange-600 font-semibold">Eslatma: </span>
                          )}
                          {notification.description}
                        </p>
                        
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-500 font-medium">
                            {notification.date}
                            {notification.time && ` • ${notification.time}`}
                          </p>
                          
                          {notification.status && (
                            <p className="text-xs text-gray-600 bg-gray-100 inline-block px-2 py-1 rounded-md">
                              {notification.status}
                            </p>
                          )}
                          
                          {notification.userName && (
                            <p className="text-xs text-gray-600 italic">
                              {notification.userName} tomonidan amalga oshirildi
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="absolute top-4 right-4">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
