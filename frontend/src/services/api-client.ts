import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request Interceptor: Gắn JWT Token vào Header
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("careza_access_token") ||
        localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Tự động refresh token khi gặp 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // Tránh vòng lặp vô tận nếu endpoint refresh hoặc login chính bị 401
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      if (typeof window === "undefined") {
        return Promise.reject(error);
      }

      const refreshToken =
        localStorage.getItem("careza_refresh_token") ||
        localStorage.getItem("refresh_token");

      if (!refreshToken) {
        localStorage.removeItem("careza_access_token");
        localStorage.removeItem("access_token");
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          { refresh_token: refreshToken }
        );

        const newAccessToken =
          refreshResponse.data?.data?.access_token ||
          refreshResponse.data?.access_token;
        const newRefreshToken =
          refreshResponse.data?.data?.refresh_token ||
          refreshResponse.data?.refresh_token;

        if (newAccessToken) {
          localStorage.setItem("careza_access_token", newAccessToken);
          localStorage.setItem("access_token", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("careza_refresh_token", newRefreshToken);
            localStorage.setItem("refresh_token", newRefreshToken);
          }

          axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } else {
          throw new Error("Không nhận được access_token mới");
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("careza_access_token");
        localStorage.removeItem("careza_refresh_token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("careza-auth-storage");
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Wrapper chuẩn hóa tương thích ngược với các components
export const apiClient = {
  get: async <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<{ data: T; status: number }> => {
    const res = await axiosInstance.get<T>(url, config);
    return { data: res.data, status: res.status };
  },

  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<{ data: T; status: number }> => {
    const res = await axiosInstance.post<T>(url, data, config);
    return { data: res.data, status: res.status };
  },

  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<{ data: T; status: number }> => {
    const res = await axiosInstance.patch<T>(url, data, config);
    return { data: res.data, status: res.status };
  },

  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<{ data: T; status: number }> => {
    const res = await axiosInstance.put<T>(url, data, config);
    return { data: res.data, status: res.status };
  },

  delete: async <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<{ data: T; status: number }> => {
    const res = await axiosInstance.delete<T>(url, config);
    return { data: res.data, status: res.status };
  },

  interceptors: axiosInstance.interceptors,
  defaults: axiosInstance.defaults,
};

