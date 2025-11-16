
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { AppUser } from '../types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: async () => {}, loginAsGuest: () => {} });

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Firebase user is present, this takes precedence.
        localStorage.removeItem('guest-uid');
        setUser({
          uid: currentUser.uid,
          isAnonymous: currentUser.isAnonymous,
          displayName: currentUser.displayName,
          email: currentUser.email,
        });
      } else {
        // No Firebase user, and we no longer persist guest users.
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAsGuest = () => {
    const guestUid = 'guest-' + Date.now() + Math.random().toString(36).substring(2);
    setUser({
      uid: guestUid,
      isAnonymous: true,
      displayName: 'Guest',
      email: null,
    });
  };

  const logout = async () => {
    localStorage.removeItem('guest-uid');
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
