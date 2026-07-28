import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { fetchFirmUser, FirmUser } from "./users";

interface AuthContextType {
  firebaseUser: User | null;
  firmUser: FirmUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  firmUser: null,
  loading: true,
  logout: async () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [firmUser, setFirmUser] = useState<FirmUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await fetchFirmUser(user.uid, user.email || undefined);
        if (userData) {
          setFirebaseUser(user);
          setFirmUser(userData);
        } else {
          await signOut(auth);
          setFirebaseUser(null);
          setFirmUser(null);
        }
      } else {
        setFirebaseUser(null);
        setFirmUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, firmUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

