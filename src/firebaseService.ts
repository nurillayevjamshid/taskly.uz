import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Project, Task, Column, Tag, Comment, TaskColumnName } from './types';

// User operations
export const userService = {
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    const userWithDates = {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, 'users'), userWithDates);
    return { id: docRef.id, ...userWithDates };
  },

  async findById(id: string) {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  async findByEmail(email: string) {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  },

  async update(id: string, userData: Partial<User>) {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, {
      ...userData,
      updatedAt: Timestamp.now()
    });
  },

  async delete(id: string) {
    const docRef = doc(db, 'users', id);
    await deleteDoc(docRef);
  }
};

// Project operations
export const projectService = {
  async create(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
    const projectWithDates = {
      ...projectData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, 'projects'), projectWithDates);
    return { id: docRef.id, ...projectWithDates };
  },

  async findById(id: string) {
    const docRef = doc(db, 'projects', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  async findByUserId(userId: string) {
    const q = query(
      collection(db, 'projects'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async update(id: string, projectData: Partial<Project>) {
    const docRef = doc(db, 'projects', id);
    await updateDoc(docRef, {
      ...projectData,
      updatedAt: Timestamp.now()
    });
  },

  async delete(id: string) {
    const docRef = doc(db, 'projects', id);
    await deleteDoc(docRef);
  }
};

// Task operations
export const taskService = {
  async create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const taskWithDates = {
      ...taskData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, 'tasks'), taskWithDates);
    return { id: docRef.id, ...taskWithDates };
  },

  async findById(id: string) {
    const docRef = doc(db, 'tasks', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  async findByColumnId(columnId: string) {
    const q = query(
      collection(db, 'tasks'), 
      where('columnId', '==', columnId),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async update(id: string, taskData: Partial<Task>) {
    const docRef = doc(db, 'tasks', id);
    await updateDoc(docRef, {
      ...taskData,
      updatedAt: Timestamp.now()
    });
  },

  async delete(id: string) {
    const docRef = doc(db, 'tasks', id);
    await deleteDoc(docRef);
  }
};

// Column operations
export const columnService = {
  async create(columnData: Omit<Column, 'id' | 'createdAt' | 'updatedAt'>) {
    const columnWithDates = {
      ...columnData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, 'columns'), columnWithDates);
    return { id: docRef.id, ...columnWithDates };
  },

  async findById(id: string) {
    const docRef = doc(db, 'columns', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  async findByProjectId(projectId: string) {
    const q = query(
      collection(db, 'columns'), 
      where('projectId', '==', projectId),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async update(id: string, columnData: Partial<Column>) {
    const docRef = doc(db, 'columns', id);
    await updateDoc(docRef, {
      ...columnData,
      updatedAt: Timestamp.now()
    });
  },

  async delete(id: string) {
    const docRef = doc(db, 'columns', id);
    await deleteDoc(docRef);
  }
};

// Tag operations
export const tagService = {
  async create(tagData: Omit<Tag, 'id' | 'createdAt'>) {
    const tagWithDate = {
      ...tagData,
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, 'tags'), tagWithDate);
    return { id: docRef.id, ...tagWithDate };
  },

  async findByTaskId(taskId: string) {
    const q = query(collection(db, 'tags'), where('taskId', '==', taskId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async delete(id: string) {
    const docRef = doc(db, 'tags', id);
    await deleteDoc(docRef);
  }
};

// Comment operations
export const commentService = {
  async create(commentData: Omit<Comment, 'id' | 'createdAt'>) {
    const commentWithDate = {
      ...commentData,
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, 'comments'), commentWithDate);
    return { id: docRef.id, ...commentWithDate };
  },

  async findByTaskId(taskId: string) {
    const q = query(
      collection(db, 'comments'), 
      where('taskId', '==', taskId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async delete(id: string) {
    const docRef = doc(db, 'comments', id);
    await deleteDoc(docRef);
  }
};
