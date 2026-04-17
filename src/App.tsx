import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, X, Calendar, MessageSquare, Paperclip, MoreHorizontal, LogOut } from 'lucide-react';
import { useColumns, useTasks, useAuth } from './hooks/useApi';

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

type Column = {
  id: string;
  title: string;
  tasks: Task[];
  color: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export default function App() {
  const { user, token, loading: authLoading, login, register, logout } = useAuth();
  const { columns, setColumns, loading: columnsLoading, createColumn, deleteColumn } = useColumns();
  const { createTask, updateTask, deleteTask } = useTasks();
  const [addingCardToCol, setAddingCardToCol] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  const handleAddCard = async (columnId: string) => {
    if (!newCardTitle.trim()) return;

    try {
      const newTask = await createTask({
        title: newCardTitle,
        columnId,
        order: 0
      });
      setNewCardTitle('');
      setAddingCardToCol(null);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (type === 'column') {
      const newColumns = [...columns];
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);
      setColumns(newColumns);
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const sourceTasks = [...sourceColumn.tasks];
    const destTasks = [...destColumn.tasks];
    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, movedTask);
      const newColumns = columns.map(col =>
        col.id === source.droppableId ? { ...col, tasks: sourceTasks } : col
      );
      setColumns(newColumns);
    } else {
      destTasks.splice(destination.index, 0, movedTask);
      const newColumns = columns.map(col => {
        if (col.id === source.droppableId) return { ...col, tasks: sourceTasks };
        if (col.id === destination.droppableId) return { ...col, tasks: destTasks };
        return col;
      });
      setColumns(newColumns);

      // Update task columnId in database
      try {
        await updateTask(movedTask.id, { columnId: destination.droppableId, order: destination.index });
      } catch (error) {
        console.error('Failed to update task column:', error);
      }
    }
  };

  const handleAddColumn = async () => {
    const title = prompt('Column nomini kiriting:');
    if (title) {
      try {
        await createColumn(title, '#3b82f6', columns.length);
      } catch (error) {
        console.error('Failed to create column:', error);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await login(authEmail, authPassword);
      setIsAuthModalOpen(false);
    } catch (error: any) {
      setAuthError(error.error || 'Login qilishda xatolik');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await register(authEmail, authPassword, authName);
      setIsAuthModalOpen(false);
    } catch (error: any) {
      setAuthError(error.error || 'Ro\'yxatdan o\'tishda xatolik');
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (confirm('Bu column va uning barcha tasklarini o\'chirmoqchimisiz?')) {
      try {
        await deleteColumn(columnId);
      } catch (error) {
        console.error('Failed to delete column:', error);
      }
    }
  };

  if (columnsLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Taskly - Task Management</h1>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600">{user.name || user.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </button>
            )}
            <button
              onClick={handleAddColumn}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Column qo'shish
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-6">
            {columns.map((column, colIndex) => (
              <div
                key={column.id}
                className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg p-4"
                style={{ borderTop: `4px solid ${column.color || '#3b82f6'}` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800">{column.title}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{column.tasks.length}</span>
                    <button
                      onClick={() => handleDeleteColumn(column.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <Droppable droppableId={column.id} type="task">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3 min-h-[200px]"
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                              onClick={() => setSelectedTask(task)}
                            >
                              <h3 className="font-medium text-gray-800 mb-2">{task.title}</h3>
                              {task.description && (
                                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                {task.dueDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </div>
                                )}
                                {task.comments.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    {task.comments.length}
                                  </div>
                                )}
                                {task.attachments > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Paperclip className="w-3 h-3" />
                                    {task.attachments}
                                  </div>
                                )}
                              </div>
                              {task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {task.tags.map((tag) => (
                                    <span
                                      key={tag.id}
                                      className="text-xs px-2 py-1 rounded-full"
                                      style={{ backgroundColor: tag.color }}
                                    >
                                      {tag.text}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {addingCardToCol === column.id ? (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      placeholder="Task nomini kiriting..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddCard(column.id);
                        if (e.key === 'Escape') {
                          setAddingCardToCol(null);
                          setNewCardTitle('');
                        }
                      }}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleAddCard(column.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Qo'shish
                      </button>
                      <button
                        onClick={() => {
                          setAddingCardToCol(null);
                          setNewCardTitle('');
                        }}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                      >
                        Bekor qilish
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingCardToCol(column.id)}
                    className="mt-3 w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Task qo'shish
                  </button>
                )}
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{selectedTask.title}</h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {selectedTask.description && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Tavsif</h3>
                  <p className="text-gray-600">{selectedTask.description}</p>
                </div>
              )}
              {selectedTask.dueDate && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Muddat</h3>
                  <p className="text-gray-600">{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                </div>
              )}
              {selectedTask.assignee && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Mas'ul</h3>
                  <p className="text-gray-600">{selectedTask.assignee}</p>
                </div>
              )}
              {selectedTask.tags.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Teglar</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-sm px-3 py-1 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedTask.comments.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Izohlar</h3>
                  <div className="space-y-2">
                    {selectedTask.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => handleDeleteTask(selectedTask.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Taskni o'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{isLoginMode ? 'Login' : 'Ro\'yxatdan o\'tish'}</h2>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="space-y-4">
                {!isLoginMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ism</label>
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ismingiz"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="********"
                    required
                  />
                </div>
                {authError && (
                  <div className="text-red-600 text-sm">{authError}</div>
                )}
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isLoginMode ? 'Login' : 'Ro\'yxatdan o\'tish'}
                </button>
              </form>
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setAuthError('');
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  {isLoginMode ? 'Hisobingiz yo\'qmi? Ro\'yxatdan o\'ting' : 'Hisobingiz bormi? Login qiling'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
