import React, { useState, useEffect, createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'sonner@2.0.3';
import { AuthPage } from './components/AuthPage';
import { HomePage } from './components/HomePage';
import { QuizPage } from './components/QuizPage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { ContactPage } from './components/ContactPage';
import { Navbar } from './components/Navbar';
import { projectId, publicAnonKey } from './utils/supabase/info';

// Create Supabase client
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Auth Context
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  xp: number;
  score: number;
  badges: string[];
}

interface AuthContextType {
  user: User | null;
  session: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          setSession(session);
          // Fetch user data from backend
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7f978717/auth/user`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7f978717/auth/login`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      setSession(data.session);
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7f978717/auth/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      toast.success('Account created successfully! Please login.');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error('Logout failed');
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Main App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Toaster position="top-right" richColors theme="dark" />
        <AppContent currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    </AuthProvider>
  );
}

const AppContent: React.FC<{ currentPage: string; setCurrentPage: (page: string) => void }> = ({ 
  currentPage, 
  setCurrentPage 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <>
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
          {currentPage === 'quiz' && <QuizPage setCurrentPage={setCurrentPage} />}
          {currentPage === 'leaderboard' && <LeaderboardPage />}
          {currentPage === 'contact' && <ContactPage />}
        </motion.div>
      </AnimatePresence>
    </>
  );
};