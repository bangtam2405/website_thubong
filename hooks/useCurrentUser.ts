import { useEffect, useState } from "react";
export function useCurrentUser() {
  const [user, setUser] = useState<any>(undefined);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");
    if (!token || !userId) setUser(null);
    else setUser({ token, userId, role, username });
  }, []);
  return user;
} 