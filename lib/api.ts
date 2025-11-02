// Helper function để lấy API URL
export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

// Helper function để tạo fetch với API URL đúng
export const apiFetch = (path: string, options?: RequestInit) => {
  const apiUrl = getApiUrl();
  const url = path.startsWith('http') ? path : `${apiUrl}${path}`;
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};

