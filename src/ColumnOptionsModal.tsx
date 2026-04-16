import React, { useRef, useEffect } from 'react';
import { 
  Edit, 
  Trash2, 
  Archive, 
  Copy, 
  Settings,
  X
} from 'lucide-react';

interface ColumnOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnId: string;
  columnTitle: string;
  onEditColumn: () => void;
  onDeleteColumn: () => void;
  onArchiveColumn: () => void;
  onDuplicateColumn: () => void;
}

export default function ColumnOptionsModal({
  isOpen,
  onClose,
  columnId,
  columnTitle,
  onEditColumn,
  onDeleteColumn,
  onArchiveColumn,
  onDuplicateColumn
}: ColumnOptionsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {columnTitle} ustunini sozlash
          </h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Options */}
        <div className="p-2">
          <div className="space-y-1">
            <button
              onClick={() => {
                onEditColumn();
                onClose();
              }}
              className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <Edit className="w-4 h-4 mr-3 text-gray-400 group-hover:text-gray-600" />
              <span>Ustun nomini o'zgartirish</span>
            </button>
            
            <button
              onClick={() => {
                onDuplicateColumn();
                onClose();
              }}
              className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <Copy className="w-4 h-4 mr-3 text-gray-400 group-hover:text-gray-600" />
              <span>Ustunni nusxalash</span>
            </button>
            
            <button
              onClick={() => {
                onArchiveColumn();
                onClose();
              }}
              className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <Archive className="w-4 h-4 mr-3 text-gray-400 group-hover:text-gray-600" />
              <span>Ustunni arxivlash</span>
            </button>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              onClick={() => {
                onDeleteColumn();
                onClose();
              }}
              className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
            >
              <Trash2 className="w-4 h-4 mr-3 text-red-500 group-hover:text-red-600" />
              <span>Ustunni o'chirish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
