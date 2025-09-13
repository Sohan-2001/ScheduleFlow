'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userRole = userData.role;
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: userRole,
            });

            // Redirect if role is determined
            if (userRole && (window.location.pathname === '/' || window.location.pathname === '/signup' || window.location.pathname === '/select-role')) {
               router.push(`/dashboard/${userRole}`);
            }
          } else {
              // User exists in Auth, but not in Firestore (e.g., mid-signup)
              setUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  role: null,
              });
               if (window.location.pathname !== '/select-role') {
                  router.push('/select-role');
               }
          }
        } catch (error: any) {
            if (error.code === 'permission-denied') {
                console.error("Firestore permission denied. Please check your security rules.", error);
                toast({
                    title: 'Firestore Security Rules',
                    description: "Permission denied. Please update your Firestore rules to allow reads on the 'users' collection for authenticated users.",
                    variant: 'destructive',
                    duration: 10000,
                });
            } else {
                console.error("Error fetching user data:", error);
                toast({
                    title: 'Error',
                    description: 'Could not fetch user data.',
                    variant: 'destructive',
                });
            }
             // Keep user logged in, but with no role.
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                role: null,
            });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
