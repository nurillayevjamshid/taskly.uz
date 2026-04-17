// Standart column ranglari
export const DEFAULT_COLUMN_COLORS = {
  vazifalar: '#3b82f6',      // Blue
  jarayonda: '#f59e0b', // Yellow/Orange
  korib_chiqilmoqda: '#8b5cf6',     // Purple
  bajarildi: '#10b981',       // Green
  bajarilmadi: '#ef4444'      // Red
};

// Border color classes
export const BORDER_COLOR_CLASSES = {
  '#3b82f6': 'border-blue-500',
  '#f59e0b': 'border-yellow-500',
  '#8b5cf6': 'border-purple-500',
  '#10b981': 'border-green-500',
  '#ef4444': 'border-red-500',
  '#6366f1': 'border-indigo-500',
  '#ec4899': 'border-pink-500',
  '#f97316': 'border-orange-500',
  '#14b8a6': 'border-teal-500',
  '#64748b': 'border-gray-500'
};

// Background color classes
export const BG_COLOR_CLASSES = {
  '#3b82f6': 'bg-blue-50',
  '#f59e0b': 'bg-yellow-50',
  '#8b5cf6': 'bg-purple-50',
  '#10b981': 'bg-green-50',
  '#ef4444': 'bg-red-50',
  '#6366f1': 'bg-indigo-50',
  '#ec4899': 'bg-pink-50',
  '#f97316': 'bg-orange-50',
  '#14b8a6': 'bg-teal-50',
  '#64748b': 'bg-gray-50'
};

// Tanlanishi mumkin bo'lgan ranglar
export const AVAILABLE_COLORS = [
  { value: '#3b82f6', label: 'Ko\'k', bgClass: 'bg-blue-500' },
  { value: '#f59e0b', label: 'Sariq', bgClass: 'bg-yellow-500' },
  { value: '#8b5cf6', label: 'Binafsha', bgClass: 'bg-purple-500' },
  { value: '#10b981', label: 'Yashil', bgClass: 'bg-green-500' },
  { value: '#ef4444', label: 'Qizil', bgClass: 'bg-red-500' },
  { value: '#6366f1', label: 'Indigo', bgClass: 'bg-indigo-500' },
  { value: '#ec4899', label: 'Pink', bgClass: 'bg-pink-500' },
  { value: '#f97316', label: 'Apelsin', bgClass: 'bg-orange-500' },
  { value: '#14b8a6', label: 'Teal', bgClass: 'bg-teal-500' },
  { value: '#64748b', label: 'Kul', bgClass: 'bg-gray-500' }
];

// Column ID larini nomlari bilan
export const COLUMN_NAMES = {
  vazifalar: 'Vazifalar',
  jarayonda: 'Jarayonda',
  korib_chiqilmoqda: 'Ko\'rib chiqilmoqda',
  bajarildi: 'Bajarildi',
  bajarilmadi: 'Bajarilmadi'
};

// Standart columnlarni yaratish uchun funksiya
export const createDefaultColumns = () => {
  return Object.entries(DEFAULT_COLUMN_COLORS).map(([id, color], index) => ({
    id,
    title: COLUMN_NAMES[id as keyof typeof COLUMN_NAMES],
    color,
    order: index,
    isStandard: true,
    tasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
};
