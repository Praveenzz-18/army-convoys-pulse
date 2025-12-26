import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { User } from '@/types/convoy';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/database/firebase/client';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { db } from '@/database/firebase/client';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthorized: (requiredRole: string[]) => boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Map Firebase User to App User
  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUser({
          id: firebaseUser.uid,
          name: data.name || firebaseUser.displayName || 'Soldier',
          email: firebaseUser.email || '',
          role: data.role || 'user',
          unit: data.unit || 'Standard Unit',
          rank: data.rank || 'Default',
          avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`
        });
      } else {
        // Fallback or Initial Profile
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Soldier',
          email: firebaseUser.email || '',
          role: 'admin',
          unit: 'Headquarters',
          rank: 'Captain',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`
        });
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Profile Sync Error",
        description: error.code === 'permission-denied' 
          ? "Firestore permissions denied. Please check your security rules." 
          : "Failed to load personnel profile.",
        variant: "destructive"
      });
      // Fallback user even on error to allow entry if needed for demo
      setUser({
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Soldier',
        email: firebaseUser.email || '',
        role: 'admin',
        unit: 'Headquarters',
        rank: 'Captain',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Login Error:", error);
      throw error; // Let the UI handle the error message
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, role: string): Promise<boolean> => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: name });

      // Save additional user info to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name,
        email,
        role,
        unit: role === 'commando' ? 'Special Forces' : 'Standard Unit',
        rank: role === 'commando' ? 'Operator' : 'Soldier',
        createdAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error("Registration Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  }, []);

  const isAuthorized = useCallback((requiredRoles: string[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAuthorized,
      login,
      register,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
