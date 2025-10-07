"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for persisted auth state in development
    if (process.env.NODE_ENV === 'development') {
      const persistedUser = localStorage.getItem('firebase-auth-user');
      if (persistedUser) {
        try {
          const userData = JSON.parse(persistedUser);
          setUser(userData);
          setLoading(false);
        } catch (error) {
          console.warn('Failed to parse persisted auth user:', error);
        }
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      // Persist auth state in development
      if (process.env.NODE_ENV === 'development') {
        if (user) {
          localStorage.setItem('firebase-auth-user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified
          }));
        } else {
          localStorage.removeItem('firebase-auth-user');
        }
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update the user's display name in Firebase Auth
      await updateProfile(userCredential.user, {
        displayName: username
      });

      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        username,
        email,
        createdAt: new Date(),
        followers: [],
        following: []
      });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists in Firestore, if not create it
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Create user profile with Google display name as username
        await setDoc(userDocRef, {
          username: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email,
          createdAt: new Date(),
          followers: [],
          following: []
        });
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    // Clear persisted auth state
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem('firebase-auth-user');
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
