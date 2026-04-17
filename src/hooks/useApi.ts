import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3001/api';

type User = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
};

type AuthResponse = {
  token: string;
  user: User;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (email: string, password: string, name?: string) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    const data: AuthResponse = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data: AuthResponse = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return { user, token, loading, register, login, logout };
};

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
  startDate: string | null;
  dueDate: string | null;
  assignee: string | null;
  attachments: number;
  columnId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  comments: Comment[];
};

type Column = {
  id: string;
  title: string;
  color: string | null;
  order: number;
  isStandard: boolean;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
};

export const useColumns = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchColumns = async () => {
    try {
      setLoading(true);
      console.log('Fetching columns from API...');
      const response = await fetch(`${API_BASE}/columns`);
      const data = await response.json();
      console.log('Columns data received:', data);
      
      // If no columns exist, create standard columns
      if (data.length === 0) {
        const standardColumns = [
          { title: 'Vazifalar', color: '#3b82f6', order: 0, isStandard: true },
          { title: 'Jarayonda', color: '#f59e0b', order: 1, isStandard: true },
          { title: "Ko'rib chiqilmoqda", color: '#8b5cf6', order: 2, isStandard: true },
          { title: 'Bajarildi', color: '#10b981', order: 3, isStandard: true },
          { title: 'Bajarilmadi', color: '#ef4444', order: 4, isStandard: true }
        ];
        
        const createdColumns = [];
        for (const col of standardColumns) {
          const createResponse = await fetch(`${API_BASE}/columns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(col)
          });
          const newCol = await createResponse.json();
          createdColumns.push(newCol);
        }
        setColumns(createdColumns);
        console.log('Created standard columns:', createdColumns);
      } else {
        setColumns(data);
        console.log('Loaded columns from API:', data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch columns');
      console.error('Error fetching columns:', err);
    } finally {
      setLoading(false);
    }
  };

  const createColumn = async (title: string, color?: string, order?: number) => {
    try {
      const response = await fetch(`${API_BASE}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, color, order })
      });
      const newColumn = await response.json();
      setColumns([...columns, newColumn]);
      return newColumn;
    } catch (err) {
      setError('Failed to create column');
      throw err;
    }
  };

  const updateColumn = async (id: string, data: { title?: string; color?: string; order?: number }) => {
    try {
      const response = await fetch(`${API_BASE}/columns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const updatedColumn = await response.json();
      setColumns(columns.map(col => col.id === id ? updatedColumn : col));
      return updatedColumn;
    } catch (err) {
      setError('Failed to update column');
      throw err;
    }
  };

  const deleteColumn = async (id: string) => {
    try {
      await fetch(`${API_BASE}/columns/${id}`, { method: 'DELETE' });
      setColumns(columns.filter(col => col.id !== id));
    } catch (err) {
      setError('Failed to delete column');
      throw err;
    }
  };

  useEffect(() => {
    fetchColumns();
  }, []);

  return { columns, setColumns, loading, error, fetchColumns, createColumn, updateColumn, deleteColumn };
};

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/tasks`);
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: {
    title: string;
    description?: string;
    startDate?: string;
    dueDate?: string;
    assignee?: string;
    attachments?: number;
    columnId: string;
    order?: number;
  }) => {
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      const newTask = await response.json();
      setTasks([...tasks, newTask]);
      return newTask;
    } catch (err) {
      setError('Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id: string, taskData: {
    title?: string;
    description?: string;
    startDate?: string;
    dueDate?: string;
    assignee?: string;
    attachments?: number;
    columnId?: string;
    order?: number;
  }) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === id ? updatedTask : task));
      return updatedTask;
    } catch (err) {
      setError('Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      setError('Failed to delete task');
      throw err;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask };
};

type Project = {
  id: string;
  name: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/projects`);
      const data = await response.json();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name: string, userId?: string) => {
    try {
      const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, userId })
      });
      const newProject = await response.json();
      setProjects([...projects, newProject]);
      return newProject;
    } catch (err) {
      setError('Failed to create project');
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
      setProjects(projects.filter(project => project.id !== id));
    } catch (err) {
      setError('Failed to delete project');
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, setProjects, loading, error, fetchProjects, createProject, deleteProject };
};

export const useComments = () => {
  const createComment = async (taskId: string, text: string, author: string) => {
    const response = await fetch(`${API_BASE}/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, author })
    });
    return response.json();
  };

  const deleteComment = async (commentId: string) => {
    const response = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'DELETE'
    });
    return response.json();
  };

  return { createComment, deleteComment };
};

type ColumnNames = {
  name1: string;
  name2: string;
  name3: string;
  name4: string;
  name5: string;
};

export const useColumnNames = (projectId?: string) => {
  const [columnNames, setColumnNames] = useState<ColumnNames>({
    name1: 'Vazifalar',
    name2: 'Jarayonda',
    name3: "Ko'rib chiqilmoqda",
    name4: 'Bajarildi',
    name5: 'Bajarilmadi'
  });
  const [loading, setLoading] = useState(true);

  const fetchColumnNames = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/projects/${projectId}/column-names`);
      const data = await response.json();
      setColumnNames({
        name1: data.name1 || 'Vazifalar',
        name2: data.name2 || 'Jarayonda',
        name3: data.name3 || "Ko'rib chiqilmoqda",
        name4: data.name4 || 'Bajarildi',
        name5: data.name5 || 'Bajarilmadi'
      });
    } catch (err) {
      console.error('Failed to fetch column names');
    } finally {
      setLoading(false);
    }
  };

  const updateColumnNames = async (names: Partial<ColumnNames>) => {
    if (!projectId) return;
    try {
      const response = await fetch(`${API_BASE}/projects/${projectId}/column-names`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(names)
      });
      const data = await response.json();
      setColumnNames({
        name1: data.name1 || columnNames.name1,
        name2: data.name2 || columnNames.name2,
        name3: data.name3 || columnNames.name3,
        name4: data.name4 || columnNames.name4,
        name5: data.name5 || columnNames.name5
      });
      return data;
    } catch (err) {
      console.error('Failed to update column names');
      throw err;
    }
  };

  useEffect(() => {
    fetchColumnNames();
  }, [projectId]);

  return { columnNames, loading, updateColumnNames, refetch: fetchColumnNames };
};
