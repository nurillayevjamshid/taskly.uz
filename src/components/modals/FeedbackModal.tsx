import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
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
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Feedback Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Qanday turdagi fikr-mulohaza?
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFeedbackType('suggestion')}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  feedbackType === 'suggestion' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">💡</div>
                <div className="text-sm font-medium">Taklif</div>
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('complaint')}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  feedbackType === 'complaint' 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">😞</div>
                <div className="text-sm font-medium">Shikoyat</div>
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('request')}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  feedbackType === 'request' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">🙏</div>
                <div className="text-sm font-medium">So'rov</div>
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div className="mb-4">
            <label htmlFor="feedback-title" className="block text-sm font-medium text-gray-700 mb-2">
              Sarlavha
            </label>
            <input
              type="text"
              id="feedback-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Qisqa va aniq sarlavha kiriting"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          {/* Description Input */}
          <div className="mb-4">
            <label htmlFor="feedback-description" className="block text-sm font-medium text-gray-700 mb-2">
              Tavsif
            </label>
            <textarea
              id="feedback-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Batafsil ma'lumot bering..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              required
            />
          </div>

          {/* Email Input */}
          <div className="mb-6">
            <label htmlFor="feedback-email" className="block text-sm font-medium text-gray-700 mb-2">
              Elektron pochta (ixtiyoriy)
            </label>
            <input
              type="email"
              id="feedback-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sizning@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              Javob olishni istasangiz, elektron pochtangizni kiriting
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all"
            >
              Yuborish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
