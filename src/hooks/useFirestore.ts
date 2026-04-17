import { useState, useEffect } from 'react';
import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

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

type Project = {
  id: string;
  name: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
};

// Firestore ga saqlash uchun data konvertatsiya qilish
const convertToFirestoreData = (data: any) => {
  const result = { ...data };
  // Date stringlarni Timestamp ga konvertatsiya qilish
  if (result.startDate) result.startDate = Timestamp.fromDate(new Date(result.startDate));
  if (result.dueDate) result.dueDate = Timestamp.fromDate(new Date(result.dueDate));
  if (result.createdAt) result.createdAt = Timestamp.fromDate(new Date(result.createdAt));
  if (result.updatedAt) result.updatedAt = Timestamp.fromDate(new Date(result.updatedAt));
  return result;
};

// Firestore dan olingan datani qayta konvertatsiya qilish
const convertFromFirestoreData = (data: any) => {
  const result = { ...data };
  // Timestamp larni string ga konvertatsiya qilish
  if (result.startDate) result.startDate = result.startDate.toDate().toISOString();
  if (result.dueDate) result.dueDate = result.dueDate.toDate().toISOString();
  if (result.createdAt) result.createdAt = result.createdAt.toDate().toISOString();
  if (result.updatedAt) result.updatedAt = result.updatedAt.toDate().toISOString();
  return result;
};

export const useFirestoreColumns = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'columns'), orderBy('order'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const columnsData = snapshot.docs.map(doc => 
          convertFromFirestoreData(doc.data()) as Column
        );
        setColumns(columnsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError('Ustunlarni yuklashda xatolik: ' + err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const createColumn = async (title: string, color?: string, order?: number) => {
    try {
      const newColumn = {
        title,
        color: color || '#3b82f6',
        order: order || columns.length,
        isStandard: false,
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'columns'), convertToFirestoreData(newColumn));
      return { id: docRef.id, ...newColumn };
    } catch (err: any) {
      setError('Ustun yaratishda xatolik: ' + err.message);
      throw err;
    }
  };

  const updateColumn = async (id: string, data: { title?: string; color?: string; order?: number }) => {
    try {
      const docRef = doc(db, 'columns', id);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(docRef, convertToFirestoreData(updateData));
    } catch (err: any) {
      setError('Ustunni yangilashda xatolik: ' + err.message);
      throw err;
    }
  };

  const deleteColumn = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'columns', id));
    } catch (err: any) {
      setError('Ustunni o\'chirishda xatolik: ' + err.message);
      throw err;
    }
  };

  return { columns, setColumns, loading, error, createColumn, updateColumn, deleteColumn };
};

export const useFirestoreTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasksData = snapshot.docs.map(doc => 
          convertFromFirestoreData(doc.data()) as Task
        );
        setTasks(tasksData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError('Vazifalarni yuklashda xatolik: ' + err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

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
      const newTask = {
        title: taskData.title,
        description: taskData.description || null,
        startDate: taskData.startDate || null,
        dueDate: taskData.dueDate || null,
        assignee: taskData.assignee || null,
        attachments: taskData.attachments || 0,
        columnId: taskData.columnId,
        order: taskData.order || 0,
        tags: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'tasks'), convertToFirestoreData(newTask));
      return { id: docRef.id, ...newTask };
    } catch (err: any) {
      setError('Vazifa yaratishda xatolik: ' + err.message);
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
    tags?: Tag[];
    comments?: Comment[];
  }) => {
    try {
      const docRef = doc(db, 'tasks', id);
      const updateData = {
        ...taskData,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(docRef, convertToFirestoreData(updateData));
    } catch (err: any) {
      setError('Vazifani yangilashda xatolik: ' + err.message);
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (err: any) {
      setError('Vazifani o\'chirishda xatolik: ' + err.message);
      throw err;
    }
  };

  return { tasks, loading, error, createTask, updateTask, deleteTask };
};

export const useFirestoreProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const projectsData = snapshot.docs.map(doc => 
          convertFromFirestoreData(doc.data()) as Project
        );
        setProjects(projectsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError('Loyihalarni yuklashda xatolik: ' + err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const createProject = async (name: string, userId?: string) => {
    try {
      const newProject = {
        name,
        userId: userId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'projects'), convertToFirestoreData(newProject));
      return { id: docRef.id, ...newProject };
    } catch (err: any) {
      setError('Loyiha yaratishda xatolik: ' + err.message);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err: any) {
      setError('Loyihani o\'chirishda xatolik: ' + err.message);
      throw err;
    }
  };

  return { projects, setProjects, loading, error, createProject, deleteProject };
};

export const useFirestoreComments = () => {
  const createComment = async (taskId: string, text: string, author: string) => {
    try {
      const newComment = {
        text,
        author,
        createdAt: new Date().toISOString()
      };

      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (taskDoc.exists()) {
        const taskData = convertFromFirestoreData(taskDoc.data()) as Task;
        const updatedComments = [...(taskData.comments || []), { id: Date.now().toString(), ...newComment }];
        
        await updateDoc(taskRef, {
          comments: updatedComments,
          updatedAt: new Date().toISOString()
        });
        
        return { id: Date.now().toString(), ...newComment };
      }
    } catch (err: any) {
      throw new Error('Izoh qo\'shishda xatolik: ' + err.message);
    }
  };

  const deleteComment = async (commentId: string, taskId: string) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (taskDoc.exists()) {
        const taskData = convertFromFirestoreData(taskDoc.data()) as Task;
        const updatedComments = taskData.comments.filter(comment => comment.id !== commentId);
        
        await updateDoc(taskRef, {
          comments: updatedComments,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      throw new Error('Izohni o\'chirishda xatolik: ' + err.message);
    }
  };

  return { createComment, deleteComment };
};
