import axios from "axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    token_type: string;
    user: User;
  };
}

/**
 * Set token in cookie
 * @param token - Auth token
 * @param expiresInDays - Cookie expiration in days (default: 7)
 */
const setTokenCookie = (token: string, expiresInDays: number = 7): void => {
  const date = new Date();
  date.setTime(date.getTime() + expiresInDays * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;

  // Set cookie with HttpOnly flag (if backend supports it, otherwise client-side only)
  document.cookie = `authToken=${token}; ${expires}; path=/; SameSite=Strict`;
};

/**
 * Get token from cookie
 */
export const getAuthToken = (): string | null => {
  const name = "authToken=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");

  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }

  return null;
};

/**
 * Login with email and password
 * @param email - User email
 * @param password - User password
 * @returns Login response with token and user data
 */
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const baseURL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  const response = await axios.post<LoginResponse>(`${baseURL}/login`, {
    email,
    password,
  });

  // Store token in cookie for subsequent requests
  if (response.data.data.token) {
    setTokenCookie(response.data.data.token, 7); // 7 days expiration
  }

  return response.data;
};

/**
 * Logout - clear stored token cookie
 */
export const logout = (): void => {
  // Clear cookie by setting expiration to past date
  document.cookie =
    "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};
