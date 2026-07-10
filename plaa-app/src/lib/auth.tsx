import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth, type AuthUser } from "@appdeploy/client";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    auth
      .getUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const signIn = async () => {
    setSignInError(null);
    try {
      const result = await auth.signIn({ scope: "openid email profile offline_access" });
      setUser(result.user);
    } catch (err) {
      const e = err as { code?: string };
      if (e?.code === "popup_blocked") {
        setSignInError("Please allow popups for this site and try again.");
      } else if (e?.code !== "popup_closed") {
        setSignInError("Sign in failed. Please try again.");
      }
    }
  };

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
  };

  if (signInError) {
    // surfaced via console; UI components read user/loading directly
    console.warn(signInError);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
