import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

type User = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
};

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Firestore'dan foydalanuvchi ma'lumotlarini olish
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // Agar foydalanuvchi ma'lumotlari bo'lmasa, yaratish
          const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || null,
            avatar: firebaseUser.photoURL || null
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string, name?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      
      // Foydalanuvchi ma'lumotlarini Firestore ga saqlash
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || null,
        avatar: firebaseUser.photoURL || null
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      setUser(newUser);
      
      return { user: newUser };
    } catch (error: any) {
      throw new Error(error.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      
      // Firestore'dan foydalanuvchi ma'lumotlarini olish
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser(userData);
        return { user: userData };
      } else {
        throw new Error('Foydalanuvchi ma\'lumotlari topilmadi');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login qilishda xatolik yuz berdi');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error: any) {
      throw new Error(error.message || 'Chiqishda xatolik yuz berdi');
    }
  };

  const updateUserProfile = async (data: { name?: string; avatar?: string }) => {
    if (!firebaseUser) throw new Error('Foydalanuvchi tizimga kirmagan');
    
    try {
      // Firestore da foydalanuvchi ma'lumotlarini yangilash
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const updatedData = { ...userDoc.data(), ...data };
        await setDoc(userRef, updatedData);
        setUser(updatedData as User);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Profilni yangilashda xatolik yuz berdi');
    }
  };

  return { 
    user, 
    firebaseUser, 
    loading, 
    register, 
    login, 
    logout, 
    updateUserProfile 
  };
};
