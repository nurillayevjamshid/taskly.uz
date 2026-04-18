import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, Settings, Plus } from 'lucide-react';

interface Project {
  id: string;
  name: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onAddProject: () => void;
  translations: {
    menu: string;
    dashboard: string;
    boards: string;
    settings: string;
    yourBoards: string;
    newBoard: string;
  };
}

export default function Sidebar({ isOpen, onClose, projects, onAddProject, translations }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveView = () => {
    if (location.pathname.startsWith('/projects')) return 'board';
    if (location.pathname.startsWith('/settings')) return 'settings';
    if (location.pathname.startsWith('/profile')) return 'profile';
    return 'dashboard';
  };

  const activeView = getActiveView();

  const handleNavigation = (view: 'dashboard' | 'board' | 'settings') => {
    if (view === 'dashboard') navigate('/');
    else if (view === 'board') navigate('/projects/current/tasks');
    else navigate(`/${view}`);
    onClose();
  };

  return (
    <aside 
      className={`${isOpen ? 'w-64 translate-x-0 opacity-100' : 'w-0 -translate-x-full opacity-0'} transition-all duration-300 ease-in-out shrink-0 bg-white border-r border-gray-200 flex flex-col h-full z-20 fixed md:relative md:translate-x-0 md:opacity-100 md:w-64 overflow-hidden`}
    >
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span className="text-lg font-bold text-gray-900 tracking-tight">Taskly</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-1">
          <button 
            onClick={() => handleNavigation('dashboard')}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeView === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            {translations.dashboard}
          </button>
          
          <button 
            onClick={() => handleNavigation('board')}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeView === 'board' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <KanbanSquare className="w-5 h-5 mr-3" />
            {translations.boards}
          </button>
          
          <button 
            onClick={() => handleNavigation('settings')}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeView === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <Settings className="w-5 h-5 mr-3" />
            {translations.settings}
          </button>
        </div>

        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {translations.yourBoards}
          </h3>
          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  navigate(`/projects/${project.id}/tasks`);
                  onClose();
                }}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors truncate"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
                {project.name}
              </button>
            ))}
          </div>
          
          <button 
            onClick={onAddProject}
            className="mt-3 w-full flex items-center px-3 py-2 text-sm font-medium text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-5 h-5 mr-3" />
            {translations.newBoard}
          </button>
        </div>
      </nav>
    </aside>
  );
}
