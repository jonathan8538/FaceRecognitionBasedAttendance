import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load session at app start
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;

      setUser(sessionUser);
      setIsAuthenticated(!!sessionUser);
      setIsLoading(false);
    };

    loadUser();

    // Listen to auth events
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setUser(user);
      setIsAuthenticated(!!user);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // SIGN UP
  const signup = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    setIsLoading(false);

    if (error) throw error;

    const newUser = data.user;
    setUser(newUser);
    setIsAuthenticated(true);
    return newUser;
  }, []);

  // LOGIN
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    setIsLoading(false);

    if (error) throw error;

    const loggedUser = data.user;
    setUser(loggedUser);
    setIsAuthenticated(true);
    return loggedUser;
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // SAVE FACE EMBEDDING
  const updateUserFace = useCallback(async (embedding256: number[]) => {
    if (!user) throw new Error("No authenticated user");

    const { error } = await supabase
      .from("user_face_embeddings")
      .upsert({
        user_id: user.id,
        embedding: embedding256,
        version: "MiniFaceNet-256D-v1",
      });

    if (error) throw error;
  }, [user]);

  // SAVE BLINK SIGNATURE
  const updateUserBlink = useCallback(async (blinkSignature: any) => {
    if (!user) throw new Error("No authenticated user");

    const { error } = await supabase
      .from("user_blink_patterns")
      .upsert({
        user_id: user.id,
        blink_signature: blinkSignature,
      });

    if (error) throw error;
  }, [user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateUserFace,
    updateUserBlink,
  };
}
