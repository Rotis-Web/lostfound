"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  lostfoundID: string;
  profileImage: string;
  bio: string;
  badges: string[];
  favoritePosts: string[];
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthProviderProps {
  children: ReactNode;
}
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>;
  deleteAccount: (
    password: string,
    confirmationText: string,
    dataSecurityConfirmed: boolean
  ) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (
    token: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const accessToken = useRef<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setLoading(true);
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      const errorObj = {
        message: data.message || "Login failed",
        code: data.code || "UNKNOWN_ERROR",
        errors: data.errors || null,
        field: data.errors?.[0]?.field || null,
      };
      throw errorObj;
    }

    accessToken.current = data.accessToken;
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
      credentials: "include",
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      const errorObj = {
        message: data.message || "Registration failed",
        code: data.code || "UNKNOWN_ERROR",
        errors: data.errors || null,
        field: data.errors?.[0]?.field || null,
      };
      throw errorObj;
    }

    return data.message;
  };

  const verifyEmail = useCallback(async (token: string) => {
    setLoading(true);
    const res = await fetch(`${API_URL}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      credentials: "include",
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      const errorObj = {
        message: data.message || "Email verification failed",
        code: data.code || "UNKNOWN_ERROR",
      };
      throw errorObj;
    }

    accessToken.current = data.accessToken;
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    accessToken.current = null;
    setUser(null);
    router.push("/");
  }, [router]);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) return null;

      const data = await res.json();
      accessToken.current = data.accessToken;
      return data.accessToken;
    } catch (error) {
      console.error("Failed to refresh token", error);
      await logout();
      return null;
    }
  }, [logout]);

  const fetchProfile = useCallback(
    async (token: string, retry = true): Promise<void> => {
      if (!token) return;

      const res = await fetch(`${API_URL}/user/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401 && retry) {
        const newToken = await refreshToken();
        if (newToken) {
          return fetchProfile(newToken, false);
        } else {
          accessToken.current = null;
          setUser(null);
          return;
        }
      }

      if (res.status === 404) {
        accessToken.current = null;
        setUser(null);
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      } else {
        accessToken.current = null;
        setUser(null);
        throw new Error(data.message || "Failed to fetch profile");
      }
    },
    [refreshToken]
  );

  const changePassword = async (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    if (!accessToken.current) {
      throw new Error("Not authenticated");
    }

    const res = await fetch(`${API_URL}/user/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.current}`,
      },
      body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorObj = {
        message: data.message || "Password change failed",
        code: data.code || "UNKNOWN_ERROR",
        errors: data.errors || null,
        field: data.errors?.[0]?.field || null,
      };
      throw errorObj;
    }

    return data;
  };

  const deleteAccount = async (
    password: string,
    confirmationText: string,
    dataSecurityConfirmed: boolean
  ) => {
    if (!accessToken.current) {
      throw new Error("Not authenticated");
    }

    const res = await fetch(`${API_URL}/user/delete-account`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken.current}`,
      },
      body: JSON.stringify({
        password,
        confirmationText,
        dataSecurityConfirmed,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorObj = {
        message: data.message || "Account deletion failed",
        code: data.code || "UNKNOWN_ERROR",
        errors: data.errors || null,
        field: data.errors?.[0]?.field || null,
      };
      throw errorObj;
    }

    accessToken.current = null;
    setUser(null);

    return data;
  };

  const forgotPassword = useCallback(async (email: string) => {
    setLoading(true);
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: "include",
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      const errorObj = {
        message: data.message || "Resetarea parolei a eșuat",
        code: data.code || "UNKNOWN_ERROR",
        errors: data.errors || null,
        field: data.errors?.[0]?.field || null,
      };
      throw errorObj;
    }

    return data.message;
  }, []);

  const resetPassword = useCallback(
    async (token: string, password: string, confirmPassword: string) => {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
        credentials: "include",
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        const errorObj = {
          message: data.message || "Resetarea parolei a eșuat",
          code: data.code || "UNKNOWN_ERROR",
          errors: data.errors || null,
          field: data.errors?.[0]?.field || null,
        };
        throw errorObj;
      }

      return data.message;
    },
    []
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const initAuth = async () => {
      try {
        const token = await refreshToken();
        if (token) {
          await fetchProfile(token);
        }
      } catch (error) {
        console.error("Auth init failed:", error);
        setUser(null);
        accessToken.current = null;
      } finally {
        setLoading(false);
      }

      interval = setInterval(async () => {
        const token = await refreshToken();
        if (token) accessToken.current = token;
      }, 14 * 60 * 1000);
    };

    initAuth();

    return () => clearInterval(interval);
  }, [fetchProfile, refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: accessToken.current,
        login,
        register,
        logout,
        changePassword,
        deleteAccount,
        verifyEmail,
        forgotPassword,
        resetPassword,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
