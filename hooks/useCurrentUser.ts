export function useCurrentUser() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");
  if (!token || !userId) return null;
  return { token, userId, role, username };
} 