import { useState, useEffect } from "react";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate a successful login for local development
    setUser({ id: 'local-user-id', email: 'test@example.com', firstName: 'Local', lastName: 'User' });
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}
