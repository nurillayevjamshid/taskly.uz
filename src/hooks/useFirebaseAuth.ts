import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
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

  const loginWithGoogle = async (options?: { switchAccount?: boolean }) => {
    try {
      const provider = new GoogleAuthProvider();
      // Google hisobini tanlash oynasini majburan ko'rsatish (hisoblarni almashtirish uchun)
      provider.setCustomParameters({
        prompt: options?.switchAccount ? 'select_account' : 'consent'
      });

      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Foydalanuvchi ma'lumotlarini Firestore dan olish yoki yaratish
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || null,
        avatar: firebaseUser.photoURL || null
      };

      if (userDoc.exists()) {
        // Mavjud foydalanuvchini yangilash (avatar/ism yangilangan bo'lishi mumkin)
        const existing = userDoc.data() as User;
        const merged: User = {
          id: userData.id,
          email: userData.email,
          name: existing.name || userData.name,
          avatar: existing.avatar || userData.avatar
        };
        await setDoc(userRef, merged, { merge: true });
        setUser(merged);
        return { user: merged };
      }

      await setDoc(userRef, userData);
      setUser(userData);
      return { user: userData };
    } catch (error: any) {
      // Foydalanuvchi oynani yopganda xato qaytarmaymiz
      if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
        return { user: null };
      }
      throw new Error(error.message || 'Google orqali kirishda xatolik yuz berdi');
    }
  };

  const switchAccount = async () => {
    // Avval joriy sessiyani tozalab, keyin Google hisob tanlash oynasini ochamiz
    try {
      await signOut(auth);
    } catch {
      // signOut xatoligini e'tiborsiz qoldiramiz
    }
    return loginWithGoogle({ switchAccount: true });
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
    loginWithGoogle,
    switchAccount,
    logout, 
    updateUserProfile 
  };
};
