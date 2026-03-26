import { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../api/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (err) {
          localStorage.removeItem("token");
          setError("Session expired. Please login again.");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      localStorage.setItem("token", response.access_token);
      setUser(response.user);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Remove token and user data locally
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  // Role-based helper functions
  const isAdmin = () => user?.role === 'ADMIN';
  const isManager = () => user?.role === 'MANAGER';
  const isStaff = () => user?.role === 'STAFF';
  const canEdit = () => isAdmin() || isManager();
  const canDelete = () => isAdmin();
  const canCreate = () => isAdmin() || isManager();
  const isProPlan = () => user?.organization_plan === 'PRO';

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    clearError,
    isAuthenticated: !!user,
    // Role helpers
    isAdmin,
    isManager,
    isStaff,
    canEdit,
    canDelete,
    canCreate,
    isProPlan,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};