'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  type User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  isTokenMissing: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  isTokenMissing: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTokenMissing, setIsTokenMissing] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
    provider.addScope('https://www.googleapis.com/auth/calendar.events');

    try {
      const currentUser = auth.currentUser;
      let result;
      
      // If user is already logged in (e.g., with email/password), link the Google account
      if (currentUser && currentUser.providerData.every(p => p.providerId !== 'google.com')) {
        result = await linkWithPopup(currentUser, provider);
      } else {
        // Otherwise, perform a standard sign-in
        result = await signInWithPopup(auth, provider);
      }
      
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        const userDocRef = doc(db, 'users', result.user.uid);
        await setDoc(userDocRef, { accessToken: credential.accessToken }, { merge: true });
        setIsTokenMissing(false); // Token is now present
        toast({
          title: 'Calendar Connected!',
          description: 'Your Google Calendar has been successfully linked.',
        });
      }
    } catch (error: any) {
      console.error("Error during Google authentication:", error);
      let description = 'Could not authenticate with Google. Please try again.';
      if (error.code === 'auth/credential-already-in-use') {
        description = 'This Google account is already associated with another user.';
      }
      toast({
        title: 'Authentication Failed',
        description,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userRole = userData.role;
            const updatedUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: userRole || null,
            };
            setUser(updatedUser);

            // Check for access token if user is a seller
            if (userRole === 'seller') {
              setIsTokenMissing(!userData.accessToken);
            } else {
              setIsTokenMissing(true); // Not relevant for buyers
            }
            
            // Redirect if role is determined
            if (userRole) {
                const currentPath = window.location.pathname;
                if (currentPath === '/' || currentPath === '/signup' || currentPath === '/select-role') {
                    router.push(`/dashboard/${userRole}`);
                }
            } else if (window.location.pathname !== '/select-role') {
                 router.push('/select-role');
            }


          } else {
              // New user, create the doc
              await setDoc(userDocRef, { email: firebaseUser.email }, { merge: true });

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
            console.error("Error fetching user data:", error);
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                role: null,
            });
        }
      } else {
        setUser(null);
        setIsTokenMissing(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast]);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle: handleGoogleAuth, isTokenMissing }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);