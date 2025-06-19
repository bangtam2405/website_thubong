import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const res = await axios.post('http://localhost:5000/api/auth/refresh-token', { refreshToken });
        const newAccessToken = res.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('token', newAccessToken);
        instance.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        processQueue(null, newAccessToken);
        return instance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default instance; 