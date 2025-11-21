import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { store } from "@/store/index";
import { clearUser } from "@/store/slices/authSlice";

// Create axios instance with base configuration
const authInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",

  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token to requests
authInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from cookie
    const token = getTokenFromCookie();

    // List of endpoints that don't require authentication
    const publicEndpoints = ["/login"];
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    // If no token and not a public endpoint, redirect to login
    if (!token && !isPublicEndpoint) {
      // Redirect to login and cancel the request
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(
        new Error("No authentication token found. Redirecting to login.")
      );
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Get token from cookie by name
 */
function getTokenFromCookie(cookieName: string = "authToken"): string | null {
  const name = `${cookieName}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");

  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }

  return null;
}

/**
 * Set token in cookie
 */
function setTokenCookie(token: string, expiresInDays: number = 7): void {
  const date = new Date();
  date.setTime(date.getTime() + expiresInDays * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;

  document.cookie = `authToken=${token}; ${expires}; path=/; SameSite=Strict`;
}

/**
 * Clear auth cookies
 */
function clearAuthCookies(): void {
  document.cookie =
    "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie =
    "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Response interceptor - Handle token refresh and errors
authInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = getTokenFromCookie("refreshToken");

        if (refreshToken) {
          const response = await axios.post(
            `${
              import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"
            }/auth/refresh`,
            { refreshToken }
          );

          const { token } = response.data;
          setTokenCookie(token, 7);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }

          return authInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear user data and redirect to login
        store.dispatch(clearUser());
        clearAuthCookies();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle other 401 errors (token invalid/expired without refresh)
    if (error.response?.status === 401) {
      store.dispatch(clearUser());
      clearAuthCookies();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default authInstance;
