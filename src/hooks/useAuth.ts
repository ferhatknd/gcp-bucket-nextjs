import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export const useAuth = () => {
  // Initialize from sessionStorage if available
  const [adminApiKey, setAdminApiKey] = useState("");
  const isDevelopment = process.env.NODE_ENV === "development";
  const [isAuthenticated, setIsAuthenticated] = useState(isDevelopment);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedApiKey = sessionStorage.getItem('adminApiKey');
      const savedAuthState = sessionStorage.getItem('isAuthenticated');
      
      if (savedApiKey && savedAuthState === 'true') {
        setAdminApiKey(savedApiKey);
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Save to sessionStorage when auth state changes
  const setAuthenticatedWithStorage = (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
    if (typeof window !== 'undefined') {
      if (authenticated) {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('adminApiKey', adminApiKey);
      } else {
        sessionStorage.removeItem('isAuthenticated');
        sessionStorage.removeItem('adminApiKey');
      }
    }
  };

  const setAdminApiKeyWithStorage = (key: string) => {
    setAdminApiKey(key);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('adminApiKey', key);
    }
  };

  const authenticate = async () => {
    // Skip authentication in development mode
    if (isDevelopment) {
      setAuthenticatedWithStorage(true);
      toast.success("Development mode - Authentication bypassed");
      return;
    }

    if (!adminApiKey.trim()) {
      setError("Please enter an API key");
      toast.error("Please enter an API key");
      return;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      // Check against env variable
      if (adminApiKey !== process.env.NEXT_PUBLIC_ADMIN_API_KEY) {
        throw new Error("Invalid API key");
      }

      setAuthenticatedWithStorage(true);
      toast.success("Authentication successful");
    } catch (err) {
      console.error("Authentication error:", err);
      if ((err as Error).name === "AbortError") {
        setError("Request timed out. Please try again.");
        toast.error("Request timed out");
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Authentication failed. Please check your API key.",
        );
        toast.error("Authentication failed");
      }
      setAuthenticatedWithStorage(false);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    setAuthenticatedWithStorage(false);
    setAdminApiKey("");
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
    toast.success("Logged out successfully");
  };

  return {
    adminApiKey,
    setAdminApiKey: setAdminApiKeyWithStorage,
    isAuthenticated,
    isAuthenticating,
    error,
    authenticate,
    logout,
  };
};
