import { useEffect, useState } from "react";
export function useCurrentUser() {
  const [user, setUser] = useState<any>(undefined);
  useEffect(() => {
    const updateUser = () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const role = localStorage.getItem("role");
      const username = localStorage.getItem("username");
      if (!token || !userId) setUser(null);
      else setUser({ token, userId, role, username });
    };
    updateUser();
    window.addEventListener("user-updated", updateUser);
    return () => window.removeEventListener("user-updated", updateUser);
  }, []);
  return user;
} 