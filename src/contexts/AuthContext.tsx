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
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
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
    // Check for persisted auth state in development for optimistic UI
    if (process.env.NODE_ENV === 'development') {
      const persistedUser = localStorage.getItem('firebase-auth-user');
      if (persistedUser) {
        try {
          const userData = JSON.parse(persistedUser);
          setUser(userData); // Set optimistic user state
        } catch (error) {
          console.warn('Failed to parse persisted auth user:', error);
          localStorage.removeItem('firebase-auth-user');
        }
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // Persist auth state in development
      if (process.env.NODE_ENV === 'development') {
        if (firebaseUser) {
          localStorage.setItem('firebase-auth-user', JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified
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
        createdAt: new Date()
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

      // Store/update user profile in Firestore with Google photo
      const userDocRef = doc(db, 'users', user.uid);
      console.log('Google sign-in: storing user data for', user.uid);
      console.log('Google photoURL:', user.photoURL);

      await setDoc(userDocRef, {
        username: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email,
        photoURL: user.photoURL || null, // Always store/update Google profile photo
        createdAt: new Date()
      }, { merge: true }); // Merge with existing data

      console.log('Google sign-in: Firestore updated successfully');
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
