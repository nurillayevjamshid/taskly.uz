import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { format, isToday } from 'date-fns';
import { X, Calendar, Tag, Paperclip, MessageSquare, Plus } from 'lucide-react';

interface Tag {
  id: string;
  text: string;
  color: string;
  createdAt: string;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

interface Attachment {
  id: string;
  name: string;
  size: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee?: string;
  dueDate?: string;
  startDate?: string;
  tags: Tag[];
  comments: Comment[];
  attachments: Attachment[];
  status: string;
}

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onAddTag: (taskId: string, tag: Omit<Tag, 'id' | 'createdAt'>) => void;
  onRemoveTag: (taskId: string, tagIndex: number) => void;
  onAddComment: (taskId: string, text: string) => void;
  translations: {
    description: string;
    noDescription: string;
    assignee: string;
    selectAssignee: string;
    dueToday: string;
    tags: string;
    attachments: string;
    noAttachments: string;
    comments: string;
    writeComment: string;
    post: string;
    close: string;
  };
}

const AVAILABLE_COLORS = [
  'bg-red-100 text-red-800',
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-yellow-100 text-yellow-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-gray-100 text-gray-800'
];

const ASSIGNEES = [
  { id: '1', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/100?img=1' },
  { id: '2', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/100?img=2' },
  { id: '3', name: 'John Doe', avatar: 'https://i.pravatar.cc/100?img=3' },
  { id: '4', name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/100?img=4' },
  { id: '5', name: 'Alex Brown', avatar: 'https://i.pravatar.cc/100?img=5' }
];

export default function TaskModal({ 
  task, 
  onClose, 
  onUpdate,
  onAddTag,
  onRemoveTag,
  onAddComment,
  translations 
}: TaskModalProps) {
  const [newTagText, setNewTagText] = useState('');
  const [newTagColor, setNewTagColor] = useState(AVAILABLE_COLORS[0]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagText.trim()) return;
    onAddTag(task.id, { text: newTagText.trim(), color: newTagColor });
    setNewTagText('');
    setIsAddingTag(false);
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(task.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleUpdateField = (field: keyof Task, value: any) => {
    onUpdate({ ...task, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center flex-1 mr-4">
            <input 
              type="text" 
              value={task.title} 
              onChange={(e) => handleUpdateField('title', e.target.value)}
              className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full -ml-2"
            />
            {task.dueDate && isToday(new Date(task.dueDate)) && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 shrink-0">
                <span className="w-1.5 h-1.5 mr-1.5 bg-red-500 rounded-full animate-pulse"></span>
                {translations.dueToday}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors shrink-0">
             <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Description */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{translations.description}</h4>
            <textarea
              value={task.description}
              onChange={(e) => handleUpdateField('description', e.target.value)}
              placeholder={translations.noDescription}
              className="w-full text-gray-900 text-sm bg-gray-50 p-4 rounded-lg leading-relaxed border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[100px]"
            />
          </div>

          {/* Assignee and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="editAssignee" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{translations.assignee}</label>
              <select
                id="editAssignee"
                value={task.assignee || ''}
                onChange={(e) => handleUpdateField('assignee', e.target.value)}
                className="text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full outline-none"
              >
                <option value="">{translations.selectAssignee}</option>
                {ASSIGNEES.map(assignee => (
                  <option key={assignee.id} value={assignee.name}>{assignee.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="editStartDate" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Boshlanish sanasi</label>
              <div className="relative">
                <Calendar className="w-4 h-4 mr-2 text-gray-500 shrink-0 absolute left-3 z-10 top-1/2 -translate-y-1/2" />
                <DatePicker
                  id="editStartDate"
                  selected={task.startDate ? new Date(task.startDate) : null}
                  onChange={(date) => handleUpdateField('startDate', date ? format(date, "yyyy-MM-dd'T'HH:mm") : '')}
                  showTimeInput
                  timeInputLabel="Vaqt:"
                  dateFormat="dd.MM.yyyy HH:mm"
                  className="text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full outline-none pl-10"
                  placeholderText="Sanani tanlang"
                />
              </div>
            </div>

            <div>
              <label htmlFor="editEndDate" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Tugash sanasi</label>
              <div className="relative">
                <Calendar className="w-4 h-4 mr-2 text-gray-500 shrink-0 absolute left-3 z-10 top-1/2 -translate-y-1/2" />
                <DatePicker
                  id="editEndDate"
                  selected={task.dueDate ? new Date(task.dueDate) : null}
                  onChange={(date) => handleUpdateField('dueDate', date ? format(date, "yyyy-MM-dd'T'HH:mm") : '')}
                  showTimeInput
                  timeInputLabel="Vaqt:"
                  dateFormat="dd.MM.yyyy HH:mm"
                  className="text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full outline-none pl-10"
                  placeholderText="Sanani tanlang"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex-1 min-w-[200px] mb-6">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{translations.tags}</h4>
            <div className="flex flex-wrap gap-2 items-center">
              {task.tags.length > 0 ? task.tags.map((tag, i) => (
                <span key={i} className={`group flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-md ${tag.color}`}>
                  {tag.text}
                  <button 
                    onClick={() => onRemoveTag(task.id, i)}
                    className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )) : null}
              
              {isAddingTag ? (
                <form onSubmit={handleAddTagSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTagText}
                    onChange={(e) => setNewTagText(e.target.value)}
                    placeholder="Yangi teg"
                    className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-24"
                    autoFocus
                  />
                  <select
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {AVAILABLE_COLORS.map((color, i) => (
                      <option key={i} value={color}>{i + 1}</option>
                    ))}
                  </select>
                  <button type="submit" className="text-blue-600 hover:text-blue-700">
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button 
                  onClick={() => setIsAddingTag(true)}
                  className="flex items-center text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Teg qo'shish
                </button>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Paperclip className="w-4 h-4 mr-2 text-gray-400" />
              {translations.attachments}
            </h4>
            {task.attachments.length > 0 ? (
              <div className="space-y-2">
                {task.attachments.map((attachment, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <Paperclip className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-sm text-gray-700">{attachment.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({attachment.size})</span>
                    </div>
                    <a 
                      href={attachment.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Ko'rish
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                <Paperclip className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">{translations.noAttachments}</p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="mb-2">
            <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
              {translations.comments}
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {task.comments.length}
              </span>
            </h4>
            
            <div className="space-y-4 mb-4">
              {task.comments.map(comment => (
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

            <form onSubmit={handleAddCommentSubmit} className="flex items-start space-x-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                Y
              </div>
              <div className="flex-1">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={translations.writeComment}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[80px]"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {translations.post}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            {translations.close}
          </button>
        </div>
      </div>
    </div>
  );
}
