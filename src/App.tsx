import React, { useState, useEffect, useRef, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, isToday } from 'date-fns';
import { uz, ru, enUS } from 'date-fns/locale';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Cropper from 'react-easy-crop';
import ProfileDropdown from './ProfileDropdown';
import NotificationDropdown from './NotificationDropdown';
import ColumnOptionsModal from './ColumnOptionsModal';
import { useIntegratedColumns } from './hooks/useFirestoreIntegrated';
import { useFirestoreProjects } from './hooks/useFirestore';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { BORDER_COLOR_CLASSES, BG_COLOR_CLASSES, AVAILABLE_COLORS } from './constants/columnColors';
import {
  LayoutDashboard,
  KanbanSquare,
  Settings,
  Search,
  Bell,
  Plus,
  MoreHorizontal,
  Calendar,
  MessageSquare,
  Paperclip,
  Menu,
  CheckCircle2,
  Clock,
  ListTodo,
  TrendingUp,
  Globe,
  X
} from 'lucide-react';

type Tag = {
  id: string;
  text: string;
  color: string;
  createdAt: string;
};

type Comment = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  tags: Tag[];
  startDate: string | null;
  dueDate: string | null;
  assignee: string | null;
  comments: Comment[];
  attachments: number;
  columnId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

type ColumnData = {
  id: string;
  title: string;
  tasks: Task[];
  color: string | null;
  order: number;
  isStandard: boolean;
  createdAt: string;
  updatedAt: string;
};

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    return null;
  }

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    croppedCanvas.toBlob((file) => {
      if (file) {
        resolve(URL.createObjectURL(file));
      } else {
        resolve(null);
      }
    }, 'image/jpeg');
  });
}

const translations = {
  uz: {
    menu: "Menyu",
    dashboard: "Boshqaruv paneli",
    boards: "Vazifalar",
    settings: "Sozlamalar",
    yourBoards: "Sizning loyihalaringiz",
    newBoard: "Yangi loyiha",
    searchPlaceholder: "Vazifalar, loyihalar yoki a'zolarni qidirish...",
    productRoadmap: "Vazifalar jadvali",
    manageTasks: "Bu yerda vazifalaringizni ko'rib turishingiz mumkin.",
    share: "Ulashish",
    addCard: "Vazifa qo'shish",
    addList: "Boshqa ro'yxat qo'shish",
    dropCards: "Kartalarni shu yerga tashlang",
    overview: "Loyihalar va vazifalaringizning umumiy ko'rinishi.",
    totalTasks: "Jami vazifalar",
    inProgress: "Jarayonda",
    completed: "Bajarilgan",
    completionRate: "Bajarilish ko'rsatkichi",
    allTasks: "Barcha vazifalar",
    taskName: "Vazifa nomi",
    status: "Holati",
    dueDate: "Muddati",
    dueToday: "Bugun topshirilishi kerak",
    tags: "Teglar",
    noTasks: "Vazifalar topilmadi.",
    profile: "Profil",
    updateProfile: "Shaxsiy ma'lumotlaringizni yangilang.",
    changeAvatar: "Avatarni o'zgartirish",
    firstName: "Ism",
    lastName: "Familiya",
    email: "Elektron pochta",
    saveChanges: "O'zgarishlarni saqlash",
    preferences: "Afzalliklar",
    customizeWorkspace: "Ish joyingizni moslashtiring.",
    emailNotifs: "Email xabarnomalari",
    receiveDaily: "Kunlik xulosalar va eslatmalarni oling.",
    darkMode: "Qorong'i rejim",
    switchTheme: "Yorug' va qorong'i mavzular o'rtasida almashish.",
    language: "Til",
    selectLanguage: "O'zingizga qulay tilni tanlang.",
    'todo': "Vazifalar",
    'in-progress': "Jarayonda",
    'review': "Ko'rib chiqilmoqda",
    'done': "Bajarildi",
    'failed': "Bajarilmadi",
    addProject: "Loyiha qo'shish",
    projectName: "Loyiha nomi",
    cancel: "Bekor qilish",
    add: "Qo'shish",
    taskDetails: "Vazifa tafsilotlari",
    description: "Tavsif",
    noDescription: "Tavsif kiritilmagan.",
    noTags: "Teglar yo'q",
    addTag: "Teg qo'shish",
    tagName: "Teg nomi",
    color: "Rang",
    close: "Yopish",
    addComment: "Izoh qo'shish",
    writeComment: "Izoh yozing...",
    post: "Yuborish",
    comments: "Izohlar",
    attachments: "Birkiktirilgan fayllar",
    addAttachment: "Fayl qo'shish",
    noAttachments: "Fayllar yo'q",
    assignee: "Mas'ul shaxs",
    startDate: "Boshlanish vaqti",
    endDate: "Tugash vaqti",
    selectAssignee: "Mas'ulni tanlang"
  },
  en: {
    menu: "Menu",
    dashboard: "Dashboard",
    boards: "Boards",
    settings: "Settings",
    yourBoards: "Your Boards",
    newBoard: "New Board",
    searchPlaceholder: "Search tasks, boards, or members...",
    productRoadmap: "Product Roadmap",
    manageTasks: "Manage and track product development tasks.",
    share: "Share",
    addCard: "Add Card",
    addList: "Add another list",
    dropCards: "Drop cards here",
    overview: "Overview of your projects and tasks.",
    totalTasks: "Total Tasks",
    inProgress: "In Progress",
    completed: "Completed",
    completionRate: "Completion Rate",
    allTasks: "All Tasks",
    taskName: "Task Name",
    status: "Status",
    dueDate: "Due Date",
    dueToday: "Due Today",
    tags: "Tags",
    noTasks: "No tasks found.",
    profile: "Profile",
    updateProfile: "Update your personal information.",
    changeAvatar: "Change Avatar",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    saveChanges: "Save Changes",
    preferences: "Preferences",
    customizeWorkspace: "Customize your workspace experience.",
    emailNotifs: "Email Notifications",
    receiveDaily: "Receive daily summaries and mentions.",
    darkMode: "Dark Mode",
    switchTheme: "Switch between light and dark themes.",
    language: "Language",
    selectLanguage: "Select your preferred language.",
    'todo': "Tasks",
    'in-progress': "In Progress",
    'review': "Review",
    'done': "Done",
    'failed': "Failed",
    addProject: "Add Project",
    projectName: "Project Name",
    cancel: "Cancel",
    add: "Add",
    taskDetails: "Task Details",
    description: "Description",
    noDescription: "No description provided.",
    noTags: "No tags",
    addTag: "Add Tag",
    tagName: "Tag Name",
    color: "Color",
    close: "Close",
    addComment: "Add Comment",
    writeComment: "Write a comment...",
    post: "Post",
    comments: "Comments",
    attachments: "Attachments",
    addAttachment: "Add Attachment",
    noAttachments: "No attachments",
    assignee: "Assignee",
    startDate: "Start Date",
    endDate: "End Date",
    selectAssignee: "Select Assignee"
  },
  ru: {
    menu: "Меню",
    dashboard: "Панель управления",
    boards: "Доски",
    settings: "Настройки",
    yourBoards: "Ваши доски",
    newBoard: "Новая доска",
    searchPlaceholder: "Поиск задач, досок или участников...",
    productRoadmap: "Дорожная карта продукта",
    manageTasks: "Управление и отслеживание задач разработки продукта.",
    share: "Поделиться",
    addCard: "Добавить карточку",
    addList: "Добавить другой список",
    dropCards: "Перетащите карточки сюда",
    overview: "Обзор ваших проектов и задач.",
    totalTasks: "Всего задач",
    inProgress: "В процессе",
    completed: "Завершено",
    completionRate: "Процент выполнения",
    allTasks: "Все задачи",
    taskName: "Название задачи",
    status: "Статус",
    dueDate: "Срок",
    dueToday: "Срок сегодня",
    tags: "Теги",
    noTasks: "Задачи не найдены.",
    profile: "Профиль",
    updateProfile: "Обновите вашу личную информацию.",
    changeAvatar: "Изменить аватар",
    firstName: "Имя",
    lastName: "Фамилия",
    email: "Электронная почта",
    saveChanges: "Сохранить изменения",
    preferences: "Настройки",
    customizeWorkspace: "Настройте свое рабочее пространство.",
    emailNotifs: "Email уведомления",
    receiveDaily: "Получайте ежедневные сводки и упоминания.",
    darkMode: "Темный режим",
    switchTheme: "Переключение между светлой и темной темами.",
    language: "Язык",
    selectLanguage: "Выберите предпочитаемый язык.",
    'todo': "Задачи",
    'in-progress': "В процессе",
    'review': "На проверке",
    'done': "Готово",
    'failed': "Не выполнено",
    addProject: "Добавить проект",
    projectName: "Название проекта",
    cancel: "Отмена",
    add: "Добавить",
    taskDetails: "Детали задачи",
    description: "Описание",
    noDescription: "Описание не предоставлено.",
    noTags: "Нет тегов",
    addTag: "Добавить тег",
    tagName: "Имя тега",
    color: "Цвет",
    close: "Закрыть",
    addComment: "Добавить комментарий",
    writeComment: "Написать комментарий...",
    post: "Отправить",
    comments: "Комментарии",
    attachments: "Вложения",
    addAttachment: "Добавить вложение",
    noAttachments: "Нет вложений",
    assignee: "Исполнитель",
    startDate: "Дата начала",
    endDate: "Дата окончания",
    selectAssignee: "Выберите исполнителя"
  }
};

type Language = keyof typeof translations;

// Feedback Modal Component
function FeedbackModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'complaint' | 'request'>('suggestion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally send the data to your backend
    console.log('Feedback submitted:', { feedbackType, title, description, email });
    
    // Reset form and close modal
    setTitle('');
    setDescription('');
    setEmail('');
    setFeedbackType('suggestion');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Takliflar va shikoyatlar
          </h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xabar turi
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFeedbackType('suggestion')}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  feedbackType === 'suggestion' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Taklif
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('request')}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  feedbackType === 'request' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Talab
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('complaint')}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  feedbackType === 'complaint' 
                    ? 'bg-red-50 border-red-200 text-red-700' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Shikoyat
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="feedbackTitle" className="block text-sm font-medium text-gray-700 mb-1.5">
              Sarlavha
            </label>
            <input
              id="feedbackTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Qisqacha mazmunni kiriting..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 shadow-sm transition-colors hover:border-gray-400 outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="feedbackDescription" className="block text-sm font-medium text-gray-700 mb-1.5">
              Batafsil ma'lumot
            </label>
            <textarea
              id="feedbackDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="To'liq ma'lumotlarni kiriting..."
              rows={5}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 shadow-sm transition-colors hover:border-gray-400 outline-none resize-none"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="feedbackEmail" className="block text-sm font-medium text-gray-700 mb-1.5">
              Elektron pochta (ixtiyoriy)
            </label>
            <input
              id="feedbackEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sizning@email.com"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 shadow-sm transition-colors hover:border-gray-400 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Yuborish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



// User Dropdown Component
function UserDropdown({ isOpen, onClose, position }: { isOpen: boolean; onClose: () => void; position: { x: number; y: number } | null }) {
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

  const users = [
    { id: 1, name: 'Jane Smith', avatar: 'https://i.pravatar.cc/100?img=1', initials: 'JS' },
    { id: 2, name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/100?img=2', initials: 'MJ' },
    { id: 3, name: 'John Doe', avatar: 'https://i.pravatar.cc/100?img=3', initials: 'JD' },
    { id: 4, name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/100?img=4', initials: 'SW' },
    { id: 5, name: 'Alex Brown', avatar: 'https://i.pravatar.cc/100?img=5', initials: 'AB' }
  ];

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

export default function App() {
  const { columns, setColumns, loading: columnsLoading, createColumn, updateColumn, deleteColumn, createTask, updateTask, deleteTask, createDefaultColumnsIfNeeded, updateColumnColor } = useIntegratedColumns();
  // createTask, updateTask, deleteTask endi useIntegratedColumns dan keladi
  
  // Debug: log columns state
  useEffect(() => {
    console.log('Columns in App:', columns);
    console.log('Columns loading:', columnsLoading);
  }, [columns, columnsLoading]);

  // Create default columns if empty (fallback when API fails)
  useEffect(() => {
    if (!columnsLoading && columns.length === 0) {
      console.log('Creating default columns in App...');
      const defaultColumns: ColumnData[] = [
        { id: 'todo', title: 'Vazifalar', tasks: [], color: '#3b82f6', order: 0, isStandard: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'in-progress', title: 'Jarayonda', tasks: [], color: '#f59e0b', order: 1, isStandard: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'review', title: "Ko'rib chiqilmoqda", tasks: [], color: '#8b5cf6', order: 2, isStandard: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'done', title: 'Bajarildi', tasks: [], color: '#10b981', order: 3, isStandard: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'failed', title: 'Bajarilmadi', tasks: [], color: '#ef4444', order: 4, isStandard: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ];
      setColumns(defaultColumns);
    }
  }, [columnsLoading, columns.length, setColumns]);
  const { projects, createProject, deleteProject } = useFirestoreProjects();
  const { user } = useFirebaseAuth();
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [draggingColId, setDraggingColId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'board' | 'settings' | 'profile'>('dashboard');
  const [lang, setLang] = useState<Language>('uz');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [addingCardToCol, setAddingCardToCol] = useState<string | null>(null);
  const [newCardText, setNewCardText] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [newCardStartDate, setNewCardStartDate] = useState('');
  const [newCardDate, setNewCardDate] = useState('');
  const [newCardAssignee, setNewCardAssignee] = useState('');
  const [newCardAttachments, setNewCardAttachments] = useState<number>(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Avatar and Crop state
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Column options handlers
  const openColumnOptions = (columnId: string, columnTitle: string, isStandard: boolean) => {
    setColumnOptionsModal({
      isOpen: true,
      columnId,
      columnTitle,
      isStandard
    });
  };

  const closeColumnOptions = () => {
    setColumnOptionsModal({
      isOpen: false,
      columnId: '',
      columnTitle: '',
      isStandard: false
    });
  };

  const handleEditColumn = () => {
    // TODO: Implement column editing functionality
    console.log('Edit column:', columnOptionsModal.columnId);
  };

  const handleDeleteColumn = async () => {
    try {
      await deleteColumn(columnOptionsModal.columnId);
    } catch (error) {
      console.error('Failed to delete column:', error);
      alert('Ustunni o\'chirishda xatolik yuz berdi.');
    }
  };

  const handleArchiveColumn = () => {
    // TODO: Implement column archiving functionality
    console.log('Archive column:', columnOptionsModal.columnId);
  };

  const handleDuplicateColumn = () => {
    // TODO: Implement column duplication functionality
    console.log('Duplicate column:', columnOptionsModal.columnId);
  };

  const handleChangeColumnColor = (color: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnOptionsModal.columnId 
        ? { ...col, color }
        : col
    ));
  };

  const mockUsers = ['Jane Smith', 'Mike Johnson', 'John Doe', 'You'];
  
  // Comment management state
  const [newCommentText, setNewCommentText] = useState('');

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Profile dropdown state
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // Notification dropdown state
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  
  // Column options modal state
  const [columnOptionsModal, setColumnOptionsModal] = useState<{
    isOpen: boolean;
    columnId: string;
    columnTitle: string;
    isStandard: boolean;
  }>({
    isOpen: false,
    columnId: '',
    columnTitle: '',
    isStandard: false
  });

  // User dropdown state
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [userDropdownPosition, setUserDropdownPosition] = useState<{ x: number; y: number } | null>(null);

  // Feedback modal state
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  
  // Tag management state
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [newTagColor, setNewTagColor] = useState(isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700');

  const tagColors = isDarkMode ? [
    { bg: 'bg-blue-900', text: 'text-blue-300', value: 'bg-blue-900 text-blue-300' },
    { bg: 'bg-purple-900', text: 'text-purple-300', value: 'bg-purple-900 text-purple-300' },
    { bg: 'bg-pink-900', text: 'text-pink-300', value: 'bg-pink-900 text-pink-300' },
    { bg: 'bg-orange-900', text: 'text-orange-300', value: 'bg-orange-900 text-orange-300' },
    { bg: 'bg-green-900', text: 'text-green-300', value: 'bg-green-900 text-green-300' },
    { bg: 'bg-red-900', text: 'text-red-300', value: 'bg-red-900 text-red-300' },
    { bg: 'bg-yellow-900', text: 'text-yellow-300', value: 'bg-yellow-900 text-yellow-300' },
    { bg: 'bg-gray-800', text: 'text-gray-300', value: 'bg-gray-800 text-gray-300' },
  ] : [
    { bg: 'bg-blue-100', text: 'text-blue-700', value: 'bg-blue-100 text-blue-700' },
    { bg: 'bg-purple-100', text: 'text-purple-700', value: 'bg-purple-100 text-purple-700' },
    { bg: 'bg-pink-100', text: 'text-pink-700', value: 'bg-pink-100 text-pink-700' },
    { bg: 'bg-orange-100', text: 'text-orange-700', value: 'bg-orange-100 text-orange-700' },
    { bg: 'bg-green-100', text: 'text-green-700', value: 'bg-green-100 text-green-700' },
    { bg: 'bg-red-100', text: 'text-red-700', value: 'bg-red-100 text-red-700' },
    { bg: 'bg-yellow-100', text: 'text-yellow-700', value: 'bg-yellow-100 text-yellow-700' },
    { bg: 'bg-gray-100', text: 'text-gray-700', value: 'bg-gray-100 text-gray-700' },
  ];

  const t = (key: keyof typeof translations['uz']) => translations[lang][key] || key;
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveAvatar = async () => {
    try {
      const croppedImage = await getCroppedImg(selectedImage!, croppedAreaPixels);
      if (croppedImage) {
        setUserAvatar(croppedImage);
        setIsCropModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      try {
        await createProject(newProjectName.trim(), user?.id);
        setNewProjectName('');
        setIsProjectModalOpen(false);
      } catch (error) {
        console.error('Failed to create project:', error);
        alert('Loyiha qo\'shishda xatolik yuz berdi. Server ishlayotganini tekshiring.');
      }
    }
  };

  const handleAddCardSubmit = async (e: React.FormEvent, colId: string) => {
    e.preventDefault();
    if (!newCardText.trim()) return;

    try {
      const taskData = {
        title: newCardText.trim(),
        description: newCardDescription.trim() || undefined,
        startDate: newCardStartDate || undefined,
        dueDate: newCardDate || undefined,
        assignee: newCardAssignee || undefined,
        attachments: newCardAttachments,
        columnId: colId,
        order: 0
      };

      await createTask(taskData);
      
      // Formni tozalash
      setNewCardText('');
      setNewCardDescription('');
      setNewCardStartDate('');
      setNewCardDate('');
      setNewCardAssignee('');
      setNewCardAttachments(0);
      setAddingCardToCol(null);
      
      console.log('Vazifa muvaffaqiyatli qo\'shildi:', colId);
    } catch (error) {
      console.error('Vazifa qo\'shishda xatolik:', error);
      alert('Vazifa qo\'shishda xatolik yuz berdi');
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      setSelectedTask(updatedTask);
      
      await updateTask(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description || undefined,
        startDate: updatedTask.startDate || undefined,
        dueDate: updatedTask.dueDate || undefined,
        assignee: updatedTask.assignee || undefined,
        attachments: updatedTask.attachments,
        columnId: updatedTask.columnId,
        order: updatedTask.order,
        tags: updatedTask.tags,
        comments: updatedTask.comments
      });
      
      console.log('Vazifa muvaffaqiyatli yangilandi:', updatedTask.title);
    } catch (error) {
      console.error('Vazifani yangilashda xatolik:', error);
      alert('Vazifani yangilashda xatolik yuz berdi');
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagText.trim() || !selectedTask) return;
    const newTag = { 
      id: `tag${Date.now()}`,
      text: newTagText.trim(), 
      color: newTagColor,
      createdAt: new Date().toISOString()
    };
    handleUpdateTask({ ...selectedTask, tags: [...selectedTask.tags, newTag] });
    setNewTagText('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (indexToRemove: number) => {
    if (!selectedTask) return;
    handleUpdateTask({
      ...selectedTask,
      tags: selectedTask.tags.filter((_, index) => index !== indexToRemove)
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedTask) return;
    const newComment: Comment = {
      id: `c${Date.now()}`,
      text: newCommentText.trim(),
      createdAt: new Date().toISOString(),
      author: 'You'
    };
    handleUpdateTask({ ...selectedTask, comments: [...selectedTask.comments, newComment] });
    setNewCommentText('');
  };

  const handleToggleTaskCompletion = async (e: React.MouseEvent, taskId: string, sourceColId: string) => {
    e.stopPropagation();
    
    // If it's done or failed, move to todo. If it's anything else, move to done.
    const targetColId = (sourceColId === 'done' || sourceColId === 'failed') ? 'todo' : 'done';
    if (sourceColId === targetColId) return;

    try {
      await updateTask(taskId, {
        columnId: targetColId,
        order: 0 // Boshida qo'yish
      });
      
      console.log(`Vazifa ${sourceColId} dan ${targetColId} ga o'tkazildi`);
    } catch (error) {
      console.error('Vazifa completion ni yangilashda xatolik:', error);
      alert('Vazifa holatini o\'zgartirishda xatolik yuz berdi');
    }
  };

  // Automation: Move tasks to 'in-progress' if start date has arrived
  useEffect(() => {
    const checkStartDates = () => {
      setColumns(prev => {
        let hasChanges = false;
        const newCols = JSON.parse(JSON.stringify(prev)) as ColumnData[];
        
        const todoCol = newCols.find(c => c.id === 'todo');
        const inProgressCol = newCols.find(c => c.id === 'in-progress');
        
        if (!todoCol || !inProgressCol) return prev;

        const today = new Date();

        const tasksToMove: Task[] = [];
        todoCol.tasks = todoCol.tasks.filter(task => {
          if (task.startDate) {
            const startDate = new Date(task.startDate);
            if (startDate <= today) {
              tasksToMove.push(task);
              hasChanges = true;
              return false;
            }
          }
          return true;
        });

        if (hasChanges) {
          inProgressCol.tasks = [...tasksToMove, ...inProgressCol.tasks];
          return newCols;
        }
        return prev;
      });
    };

    checkStartDates();
    const interval = setInterval(checkStartDates, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Dashboard Stats
  const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0);
  const doneTasks = columns.find(c => c.id === 'done')?.tasks.length || 0;
  const inProgressTasks = columns.find(c => c.id === 'in-progress')?.tasks.length || 0;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const allTasks = columns.flatMap(col => col.tasks.map(task => ({ ...task, statusId: col.id as keyof typeof translations['uz'] })));

  // Drag and Drop Handlers
  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside list
    if (!destination) {
      return;
    }

    // Dropped in same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    try {
      // Vazifani topish
      const sourceCol = columns.find(c => c.id === source.droppableId);
      if (!sourceCol) return;
      
      const task = sourceCol.tasks[source.index];
      if (!task) return;

      // Agar column o'zgargan bo'lsa, statusini yangilash
      if (source.droppableId !== destination.droppableId) {
        await updateTask(task.id, {
          columnId: destination.droppableId,
          order: destination.index
        });
        
        console.log(`Vazifa "${task.title}" ${source.droppableId} dan ${destination.droppableId} ga o'tkazildi`);
      } else {
        // Column ichida tartibni o'zgartirish
        await updateTask(task.id, {
          columnId: destination.droppableId,
          order: destination.index
        });
      }
    } catch (error) {
      console.error('Vazifa o\'tkazishda xatolik:', error);
      alert('Vazifa o\'tkazishda xatolik yuz berdi');
    }
  };

  const getColumnColor = (column: ColumnData) => {
    const borderClass = column.color ? BORDER_COLOR_CLASSES[column.color] || 'border-gray-500' : 'border-gray-500';
    return `border-t-4 ${borderClass}`;
  };

  const getCardBackgroundColor = (column: ColumnData) => {
    if (!column.color) return 'bg-white';
    
    return BG_COLOR_CLASSES[column.color] || 'bg-white';
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleString(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F7F8FA] text-gray-900 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64 translate-x-0 opacity-100' : 'w-0 -translate-x-full opacity-0'} transition-all duration-300 ease-in-out shrink-0 bg-white border-r border-gray-200 flex flex-col h-full z-20 fixed md:relative md:translate-x-0 md:opacity-100 md:w-64 overflow-hidden`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <KanbanSquare className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Taskly</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          <div>
            <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t('menu')}</p>
            <nav className="space-y-1">
              <button 
                onClick={() => {
                  setActiveView('dashboard');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${activeView === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <LayoutDashboard className={`w-4 h-4 mr-3 ${activeView === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`} />
                {t('dashboard')}
              </button>
              <button 
                onClick={() => {
                  setActiveView('board');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${activeView === 'board' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <KanbanSquare className={`w-4 h-4 mr-3 ${activeView === 'board' ? 'text-blue-600' : 'text-gray-400'}`} />
                {t('boards')}
              </button>
              <button 
                onClick={() => {
                  setActiveView('settings');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${activeView === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Settings className={`w-4 h-4 mr-3 ${activeView === 'settings' ? 'text-blue-600' : 'text-gray-400'}`} />
                {t('settings')}
              </button>
            </nav>
          </div>

          <div>
            <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t('yourBoards')}</p>
            <nav className="space-y-1">
              {projects.map((project, i) => (
                <a key={project.id} href="#" className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
                  <div className={`w-2 h-2 rounded-full mr-3 ${i % 3 === 0 ? 'bg-purple-500' : i % 3 === 1 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                  {project.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100">
          {/* Mobile: Bell & Profile above New Board */}
          <div className="flex md:hidden items-center justify-between mb-3 pb-3 border-b border-gray-100">
            <button 
              onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full relative transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-semibold text-sm shadow-sm cursor-pointer border border-white ring-2 ring-transparent hover:ring-gray-200 transition-all overflow-hidden"
            >
              {userAvatar ? <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" /> : 'JD'}
            </div>
          </div>
          <button className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4 mr-3 text-gray-400" />
            {t('newBoard')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center flex-1">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center mr-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <KanbanSquare className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight ml-2">Taskly</span>
            </div>
            
            <div className="max-w-md w-full relative hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')} 
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Mobile: Hamburger Menu */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Desktop: Notification Bell */}
            <button 
              onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
              className="hidden md:block p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full relative transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            
            {/* Desktop: Profile Icon */}
            <div 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="hidden md:block h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-semibold text-sm shadow-sm cursor-pointer border border-white ring-2 ring-transparent hover:ring-gray-200 transition-all overflow-hidden"
            >
              {userAvatar ? <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" /> : 'JD'}
            </div>
            
                      </div>
        </header>

        {activeView === 'profile' ? (
          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('profile')}</h1>
                <p className="text-sm text-gray-500 mt-1">{t('updateProfile')}</p>
              </div>
              
              {/* Profile Content */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-6">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-3xl shadow-sm overflow-hidden">
                      {userAvatar ? <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" /> : 'JD'}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Jamshid Nurillayev</h2>
                      <p className="text-gray-500">jamshid@example.com</p>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {t('changeAvatar')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeView === 'settings' ? (
          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('settings')}</h1>
                <p className="text-sm text-gray-500 mt-1">{t('manageTasks')}</p>
              </div>
              
              {/* Profile Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">{t('profile')}</h3>
                  <p className="text-sm text-gray-500">{t('updateProfile')}</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-2xl shadow-sm overflow-hidden">
                      {userAvatar ? <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" /> : 'JD'}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      {t('changeAvatar')}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('firstName')}</label>
                      <input type="text" defaultValue="John" className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('lastName')}</label>
                      <input type="text" defaultValue="Doe" className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                      <input type="email" defaultValue="john.doe@example.com" className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                      {t('saveChanges')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">{t('preferences')}</h3>
                  <p className="text-sm text-gray-500">{t('customizeWorkspace')}</p>
                </div>
                <div className="p-6 space-y-4">
                  {/* Language Selector */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-gray-500" />
                        {t('language')}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">{t('selectLanguage')}</p>
                    </div>
                    <select 
                      value={lang}
                      onChange={(e) => setLang(e.target.value as Language)}
                      className="block w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white cursor-pointer"
                    >
                      <option value="uz">O'zbekcha</option>
                      <option value="en">English</option>
                      <option value="ru">Русский</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{t('emailNotifs')}</h4>
                      <p className="text-sm text-gray-500">{t('receiveDaily')}</p>
                    </div>
                    <button className="bg-blue-600 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{t('darkMode')}</h4>
                      <p className="text-sm text-gray-500">{t('switchTheme')}</p>
                    </div>
                    <button 
                      onClick={toggleDarkMode}
                      className={`${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    >
                      <span className={`${isDarkMode ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Feedback Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Qo'llab-quvvatlar</h3>
                  <p className="text-sm text-gray-500">Loyihani yaxshilash uchun takliflaringizni yuboring</p>
                </div>
                <div className="p-6">
                  <button 
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Takliflar qoldirish
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeView === 'board' ? (
          <>
            {/* Board Header */}
        <div className="px-6 py-6 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('productRoadmap')}</h1>
              <p className="text-sm text-gray-500 mt-1">{t('manageTasks')}</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <div 
                className="flex -space-x-2 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setUserDropdownPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.bottom + 8
                  });
                  setIsUserDropdownOpen(true);
                }}
              >
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/100?img=1" alt=""/>
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/100?img=2" alt=""/>
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/100?img=3" alt=""/>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                  +2
                </div>
              </div>
              <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                {t('share')}
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6 custom-scrollbar">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full items-start space-x-6">
              
              {columns.map(col => (
                <Droppable droppableId={col.id} key={col.id}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-col w-80 shrink-0 max-h-full rounded-xl transition-colors duration-200 ${getColumnColor(col)} ${snapshot.isDraggingOver ? 'bg-gray-200/80' : 'bg-gray-100/80'}`}
                    >
                      {/* Column Header */}
                      <div className="p-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-sm text-gray-700">{t(col.id as keyof typeof translations['uz']) || col.title}</h3>
                          <span className="bg-gray-200 text-gray-600 py-0.5 px-2 rounded-full text-xs font-medium">
                            {col.tasks.length}
                          </span>
                        </div>
                        <button
                          onClick={() => openColumnOptions(col.id, t(col.id as keyof typeof translations['uz']) || col.title, col.isStandard)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Column Tasks */}
                      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3 custom-scrollbar min-h-[150px]">
                        {col.tasks.map((task, index) => {
                          const dueToday = task.dueDate ? isToday(new Date(task.dueDate)) : false;
                          return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={provided.draggableProps.style}
                                onClick={() => setSelectedTask(task)}
                                className={`group relative outline-none ${snapshot.isDragging ? 'z-50' : ''}`}
                              >
                                <div className={`${getCardBackgroundColor(col)} p-4 rounded-xl border cursor-pointer transition-shadow duration-200 ${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500/50' : 'shadow-sm hover:shadow-md'} ${dueToday && col.id !== 'done' && col.id !== 'failed' ? 'border-red-300 ring-1 ring-red-300 bg-red-50/40' : 'border-gray-200'}`}>
                                  <div className="flex flex-wrap gap-2 mb-3">
                                  {task.tags.map((tag, i) => (
                                    <span key={i} className={`text-[10px] font-semibold px-2 py-1 rounded-md ${tag.color}`}>
                                      {tag.text}
                                    </span>
                                  ))}
                                </div>
                                
                                <div className="flex items-start gap-3 mb-1">
                                  <button 
                                    onClick={(e) => handleToggleTaskCompletion(e, task.id, col.id)}
                                    className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${col.id === 'done' ? 'bg-green-500 border-green-500 text-white' : col.id === 'failed' ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 text-transparent hover:border-green-500'}`}
                                  >
                                    {col.id === 'failed' ? <X className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                  </button>
                                  <h4 className={`text-sm font-semibold leading-snug transition-colors ${col.id === 'done' || col.id === 'failed' ? 'text-gray-400 line-through' : 'text-gray-900 group-hover:text-blue-600'}`}>
                                    {task.title}
                                  </h4>
                                </div>
                                <p className={`text-xs line-clamp-2 mb-4 leading-relaxed ${col.id === 'done' || col.id === 'failed' ? 'text-gray-400 line-through' : 'text-gray-500'}`}>
                                  {task.description}
                                </p>
                                
                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                                  <div className="flex items-center text-gray-400 space-x-3">
                                    {task.assignee && (
                                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold" title={task.assignee}>
                                        {task.assignee.charAt(0)}
                                      </div>
                                    )}
                                    {task.comments.length > 0 && (
                                      <div className="flex items-center text-xs">
                                        <MessageSquare className="w-3.5 h-3.5 mr-1" />
                                        {task.comments.length}
                                      </div>
                                    )}
                                    {task.attachments > 0 && (
                                      <div className="flex items-center text-xs">
                                        <Paperclip className="w-3.5 h-3.5 mr-1" />
                                        {task.attachments}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    {task.startDate && (
                                      <div className="flex items-center text-[10px] font-medium text-gray-400">
                                        <span className="mr-1">Start:</span>
                                        {formatDateTime(task.startDate)}
                                      </div>
                                    )}
                                    <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-md ${dueToday && col.id !== 'done' && col.id !== 'failed' ? 'text-red-600 bg-red-100' : 'text-gray-500 bg-gray-50'}`}>
                                      <Calendar className={`w-3.5 h-3.5 mr-1.5 ${dueToday && col.id !== 'done' && col.id !== 'failed' ? 'text-red-500' : 'text-gray-400'}`} />
                                      {formatDateTime(task.dueDate)}
                                      {dueToday && col.id !== 'done' && col.id !== 'failed' && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                                    </div>
                                  </div>
                                </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>

                      {/* Add Card Button */}
                      <div className="p-3 shrink-0">
                        <button 
                          onClick={() => setAddingCardToCol(col.id)}
                          className="flex items-center justify-center w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {t('addCard')}
                        </button>
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}

              {/* Add Column Button */}
              <div className="w-80 shrink-0">
                <button className="flex items-center w-full p-4 text-sm font-medium text-gray-500 bg-gray-100/50 hover:bg-gray-200/50 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addList')}
                </button>
              </div>

            </div>
          </DragDropContext>
        </div>
        </>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('dashboard')}</h1>
                <p className="text-sm text-gray-500 mt-1">{t('overview')}</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <button 
                  onClick={() => setIsProjectModalOpen(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addProject')}
                </button>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">{t('totalTasks')}</h3>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <ListTodo className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{totalTasks} <span className="text-lg font-medium text-gray-500">ta</span></div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">{t('inProgress')}</h3>
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{inProgressTasks} <span className="text-lg font-medium text-gray-500">ta</span></div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">{t('completed')}</h3>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{doneTasks} <span className="text-lg font-medium text-gray-500">ta</span></div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">{t('completionRate')}</h3>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">{completionRate}%</div>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{t('allTasks')}</h3>
              </div>
              {/* Mobile: Card view */}
              <div className="md:hidden p-3 space-y-3">
                {allTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-100 active:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 leading-snug pr-2">{task.title}</h4>
                      <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        task.statusId === 'done' ? 'bg-green-100 text-green-800' :
                        task.statusId === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                        task.statusId === 'review' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t(task.statusId)}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${tag.color}`}>
                            {tag.text}
                          </span>
                        ))}
                        {task.tags.length > 2 && (
                          <span className="text-[10px] text-gray-400">+{task.tags.length - 2}</span>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {task.dueDate}
                      </div>
                    </div>
                  </div>
                ))}
                {allTasks.length === 0 && (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    {t('noTasks')}
                  </div>
                )}
              </div>
              {/* Desktop: Table view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium">{t('taskName')}</th>
                      <th className="px-6 py-4 font-medium">{t('status')}</th>
                      <th className="px-6 py-4 font-medium">{t('dueDate')}</th>
                      <th className="px-6 py-4 font-medium">{t('tags')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allTasks.map(task => (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{task.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.statusId === 'done' ? 'bg-green-100 text-green-800' :
                            task.statusId === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                            task.statusId === 'review' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {t(task.statusId)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {task.dueDate}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {task.tags.map((tag, i) => (
                              <span key={i} className={`text-[10px] font-semibold px-2 py-1 rounded-md ${tag.color}`}>
                                {tag.text}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {allTasks.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                          {t('noTasks')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{t('addProject')}</h3>
            </div>
            <form onSubmit={handleAddProject}>
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('projectName')}
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="E.g. Website Redesign"
                />
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center flex-1 mr-4">
                <input 
                  type="text" 
                  value={selectedTask.title} 
                  onChange={(e) => handleUpdateTask({ ...selectedTask, title: e.target.value })}
                  className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full -ml-2"
                />
                {selectedTask.dueDate && isToday(new Date(selectedTask.dueDate)) && (
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 shrink-0">
                    <span className="w-1.5 h-1.5 mr-1.5 bg-red-500 rounded-full animate-pulse"></span>
                    {t('dueToday')}
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors shrink-0">
                 <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t('description')}</h4>
                <textarea
                  value={selectedTask.description}
                  onChange={(e) => handleUpdateTask({ ...selectedTask, description: e.target.value })}
                  placeholder={t('noDescription')}
                  className="w-full text-gray-900 text-sm bg-gray-50 p-4 rounded-lg leading-relaxed border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[100px]"
                />
              </div>
              <div className="flex flex-wrap gap-6 mb-6">
                <div>
                  <label htmlFor="editAssignee" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{t('assignee')}</label>
                  <select
                    id="editAssignee"
                    value={selectedTask.assignee || ''}
                    onChange={(e) => handleUpdateTask({ ...selectedTask, assignee: e.target.value })}
                    className="text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full outline-none"
                  >
                    <option value="">{t('selectAssignee')}</option>
                    {mockUsers.map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="editStartDate" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{t('startDate')}</label>
                  <div className="flex items-center text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 relative">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500 shrink-0 absolute left-3 z-10" />
                    <DatePicker
                      id="editStartDate"
                      selected={selectedTask.startDate ? new Date(selectedTask.startDate) : null}
                      onChange={(date) => handleUpdateTask({ ...selectedTask, startDate: date ? format(date, "yyyy-MM-dd'T'HH:mm") : '' })}
                      showTimeInput
                      timeInputLabel="Vaqt:"
                      dateFormat="dd.MM.yyyy HH:mm"
                      placeholderText="dd.mm.yyyy --:--"
                      className="bg-transparent border-none focus:ring-0 p-0 pl-7 rounded text-sm text-gray-700 w-full outline-none"
                      portalId="root"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="editEndDate" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{t('endDate')}</label>
                  <div className="flex items-center text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 relative">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500 shrink-0 absolute left-3 z-10" />
                    <DatePicker
                      id="editEndDate"
                      selected={selectedTask.dueDate ? new Date(selectedTask.dueDate) : null}
                      onChange={(date) => handleUpdateTask({ ...selectedTask, dueDate: date ? format(date, "yyyy-MM-dd'T'HH:mm") : '' })}
                      showTimeInput
                      timeInputLabel="Vaqt:"
                      dateFormat="dd.MM.yyyy HH:mm"
                      placeholderText="dd.mm.yyyy --:--"
                      className="bg-transparent border-none focus:ring-0 p-0 pl-7 rounded text-sm text-gray-700 w-full outline-none"
                      portalId="root"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{t('tags')}</h4>
                  <div className="flex flex-wrap gap-2 items-center">
                    {selectedTask.tags.length > 0 ? selectedTask.tags.map((tag, i) => (
                      <span key={i} className={`group flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-md ${tag.color}`}>
                        {tag.text}
                        <button 
                          onClick={() => handleRemoveTag(i)}
                          className="ml-1.5 opacity-0 group-hover:opacity-100 hover:text-gray-900 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )) : <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md">{t('noTags')}</span>}
                    
                    <div className="relative">
                      <button 
                        onClick={() => setIsAddingTag(!isAddingTag)}
                        className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      
                      {isAddingTag && (
                        <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-10">
                          <form onSubmit={handleAddTag}>
                            <div className="mb-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">{t('tagName')}</label>
                              <input 
                                type="text"
                                autoFocus
                                value={newTagText}
                                onChange={(e) => setNewTagText(e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="E.g. Frontend"
                              />
                            </div>
                            <div className="mb-4">
                              <label className="block text-xs font-medium text-gray-700 mb-2">{t('color')}</label>
                              <div className="flex flex-wrap gap-2">
                                {tagColors.map((color) => (
                                  <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setNewTagColor(color.value)}
                                    className={`w-6 h-6 rounded-full ${color.bg} border-2 transition-all ${newTagColor === color.value ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-110'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => setIsAddingTag(false)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                              >
                                {t('cancel')}
                              </button>
                              <button
                                type="submit"
                                disabled={!newTagText.trim()}
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                              >
                                {t('add')}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <Paperclip className="w-4 h-4 mr-2 text-gray-400" />
                    {t('attachments')}
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {selectedTask.attachments}
                    </span>
                  </h4>
                  <button 
                    onClick={() => alert('File upload functionality will be implemented here.')}
                    className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    {t('addAttachment')}
                  </button>
                </div>
                
                {selectedTask.attachments > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* Placeholder for actual attachments */}
                    {Array.from({ length: selectedTask.attachments }).map((_, idx) => (
                      <div key={idx} className="flex items-center p-2 border border-gray-200 rounded-lg bg-gray-50 group cursor-pointer hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mr-3">
                          <Paperclip className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">Document_{idx + 1}.pdf</p>
                          <p className="text-xs text-gray-500">2.4 MB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                    <Paperclip className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">{t('noAttachments')}</p>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="mb-2">
                <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                  {t('comments')}
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {selectedTask.comments.length}
                  </span>
                </h4>
                
                <div className="space-y-4 mb-4">
                  {selectedTask.comments.map(comment => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {comment.author.charAt(0)}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-900">{comment.author}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="flex items-start space-x-3 mt-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    Y
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder={t('writeComment')}
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[80px]"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={!newCommentText.trim()}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {t('post')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setSelectedTask(null)} 
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {addingCardToCol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">{t('addCard')}</h3>
              <button 
                onClick={() => {
                  setAddingCardToCol(null);
                  setNewCardText('');
                  setNewCardDescription('');
                  setNewCardStartDate('');
                  setNewCardDate('');
                  setNewCardAssignee('');
                  setNewCardAttachments(0);
                }} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => handleAddCardSubmit(e, addingCardToCol)}>
              <div className="p-6 space-y-5">
                <div>
                  <label htmlFor="newTaskTitle" className="block text-sm font-medium text-gray-700 mb-1.5">{t('taskName')}</label>
                  <input
                    id="newTaskTitle"
                    type="text"
                    autoFocus
                    value={newCardText}
                    onChange={(e) => setNewCardText(e.target.value)}
                    placeholder="E.g. Design new landing page"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 shadow-sm transition-colors hover:border-gray-400 outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="newTaskDescription" className="block text-sm font-medium text-gray-700 mb-1.5">{t('description')}</label>
                  <textarea
                    id="newTaskDescription"
                    value={newCardDescription}
                    onChange={(e) => setNewCardDescription(e.target.value)}
                    placeholder="Vazifa haqida batafsil ma'lumot kiriting..."
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 shadow-sm transition-colors hover:border-gray-400 outline-none resize-y min-h-[80px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="modalStartDate" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('startDate')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <DatePicker
                        id="modalStartDate"
                        selected={newCardStartDate ? new Date(newCardStartDate) : null}
                        onChange={(date) => setNewCardStartDate(date ? format(date, "yyyy-MM-dd'T'HH:mm") : '')}
                        showTimeInput
                        timeInputLabel="Vaqt:"
                        dateFormat="dd.MM.yyyy HH:mm"
                        placeholderText="dd.mm.yyyy --:--"
                        className="pl-10 w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-gray-50 hover:bg-white shadow-sm transition-colors outline-none"
                        portalId="root"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="modalEndDate" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('endDate')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <DatePicker
                        id="modalEndDate"
                        selected={newCardDate ? new Date(newCardDate) : null}
                        onChange={(date) => setNewCardDate(date ? format(date, "yyyy-MM-dd'T'HH:mm") : '')}
                        showTimeInput
                        timeInputLabel="Vaqt:"
                        dateFormat="dd.MM.yyyy HH:mm"
                        placeholderText="dd.mm.yyyy --:--"
                        className="pl-10 w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-gray-50 hover:bg-white shadow-sm transition-colors outline-none"
                        portalId="root"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="modalAssignee" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('assignee')}</label>
                  <select
                    id="modalAssignee"
                    value={newCardAssignee}
                    onChange={(e) => setNewCardAssignee(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-gray-50 hover:bg-white shadow-sm transition-colors outline-none cursor-pointer"
                  >
                    <option value="">{t('selectAssignee')}</option>
                    {mockUsers.map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('attachments')}</label>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="modalFileUpload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Paperclip className="w-6 h-6 mb-2 text-gray-400" />
                        <p className="text-xs text-gray-500"><span className="font-semibold">Fayl yuklash uchun bosing</span> yoki shu yerga tashlang</p>
                      </div>
                      <input 
                        id="modalFileUpload" 
                        type="file" 
                        className="hidden" 
                        multiple 
                        onChange={(e) => {
                          if (e.target.files) {
                            setNewCardAttachments(prev => prev + e.target.files!.length);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {newCardAttachments > 0 && (
                    <p className="mt-2 text-xs text-green-600 font-medium">{newCardAttachments} ta fayl tanlandi</p>
                  )}
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setAddingCardToCol(null);
                    setNewCardText('');
                    setNewCardDescription('');
                    setNewCardStartDate('');
                    setNewCardDate('');
                    setNewCardAssignee('');
                    setNewCardAttachments(0);
                  }}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!newCardText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Avatar Crop Modal */}
      {isCropModalOpen && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Avatarni sozlash</h3>
              <button 
                onClick={() => setIsCropModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative w-full h-64 bg-gray-100">
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-4 flex items-center space-x-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-600">Zoom:</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                {t('saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global styles for custom scrollbar and datepicker */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.5);
        }
        
        /* Custom DatePicker Styles */
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker-popper {
          z-index: 9999 !important;
        }
        .react-datepicker {
          font-family: inherit !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 0.75rem !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
          background-color: #ffffff !important;
          color: #111827 !important;
          display: flex !important;
          flex-direction: column;
        }
        .react-datepicker__month-container {
          background-color: #ffffff;
          border-radius: 0.75rem;
        }
        .react-datepicker__header {
          background-color: #ffffff !important;
          border-bottom: 1px solid #f3f4f6 !important;
          padding-top: 16px !important;
          border-top-left-radius: 0.75rem !important;
          border-top-right-radius: 0.75rem !important;
        }
        .react-datepicker__current-month {
          font-size: 0.875rem !important;
          font-weight: 600 !important;
          color: #111827 !important;
          margin-bottom: 8px;
        }
        .react-datepicker__day-names {
          display: flex;
          justify-content: space-between;
          padding: 0 8px;
        }
        .react-datepicker__day-name {
          color: #6b7280 !important;
          font-size: 0.75rem !important;
          font-weight: 500 !important;
          width: 2rem !important;
          line-height: 2rem !important;
          margin: 0.166rem !important;
        }
        .react-datepicker__month {
          padding: 0 8px 8px 8px;
        }
        .react-datepicker__week {
          display: flex;
          justify-content: space-between;
        }
        .react-datepicker__day {
          color: #374151 !important;
          font-size: 0.875rem !important;
          width: 2rem !important;
          line-height: 2rem !important;
          margin: 0.166rem !important;
          border-radius: 0.375rem !important;
          transition: all 0.2s;
        }
        .react-datepicker__day:hover {
          background-color: #f3f4f6 !important;
          color: #111827 !important;
        }
        .react-datepicker__day--selected, 
        .react-datepicker__day--keyboard-selected {
          background-color: #2563eb !important;
          color: #ffffff !important;
          font-weight: 600;
        }
        .react-datepicker__day--outside-month {
          color: #d1d5db !important;
        }
        .react-datepicker__input-time-container {
          padding: 12px 16px !important;
          border-top: 1px solid #f3f4f6 !important;
          background-color: #f9fafb !important;
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 0 !important;
        }
        .react-datepicker__input-time-container .react-datepicker-time__caption {
          font-size: 0.875rem;
          font-weight: 500;
          color: #4b5563;
        }
        .react-datepicker__input-time-container input {
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 4px 8px;
          font-size: 0.875rem;
          color: #111827;
          outline: none;
          transition: border-color 0.2s;
        }
        .react-datepicker__input-time-container input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }
        .react-datepicker__navigation {
          top: 12px !important;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #6b7280 !important;
          border-width: 2px 2px 0 0 !important;
        }
        .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
          border-color: #111827 !important;
        }
      `}} />
      
      {/* Profile Dropdown */}
      <ProfileDropdown
        isOpen={isProfileDropdownOpen}
        onClose={() => setIsProfileDropdownOpen(false)}
        userAvatar={userAvatar}
        userName="Jamshid Nurillayev"
        userEmail="jamshid@example.com"
      />
      
      {/* Notification Dropdown */}
      <NotificationDropdown
        isOpen={isNotificationDropdownOpen}
        onClose={() => setIsNotificationDropdownOpen(false)}
      />
      
      {/* Column Options Modal */}
      <ColumnOptionsModal
        isOpen={columnOptionsModal.isOpen}
        onClose={closeColumnOptions}
        columnId={columnOptionsModal.columnId}
        columnTitle={columnOptionsModal.columnTitle}
        isStandard={columnOptionsModal.isStandard}
        onEditColumn={handleEditColumn}
        onDeleteColumn={handleDeleteColumn}
        onArchiveColumn={handleArchiveColumn}
        onDuplicateColumn={handleDuplicateColumn}
        onChangeColumnColor={handleChangeColumnColor}
      />
      
      {/* User Dropdown */}
      <UserDropdown
        isOpen={isUserDropdownOpen}
        onClose={() => setIsUserDropdownOpen(false)}
        position={userDropdownPosition}
      />
      
      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
}
