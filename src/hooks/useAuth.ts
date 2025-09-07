import { useState } from "react";
import { toast } from "react-hot-toast";

export const useAuth = () => {
  const [adminApiKey, setAdminApiKey] = useState("");
  // In development mode, start as authenticated
  const isDevelopment = process.env.NODE_ENV === "development";
  const [isAuthenticated, setIsAuthenticated] = useState(isDevelopment);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = async () => {
    // Skip authentication in development mode
    if (isDevelopment) {
      setIsAuthenticated(true);
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

      setIsAuthenticated(true);
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
      setIsAuthenticated(false);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return {
    adminApiKey,
    setAdminApiKey,
    isAuthenticated,
    isAuthenticating,
    error,
    authenticate,
  };
};
