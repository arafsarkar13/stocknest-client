import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
});

const publicPaths = ["/", "/login", "/register"];

// attach the saved token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("stocknest_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// a rejected token (expired, revoked after a password change) logs the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginCall =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !isLoginCall
    ) {
      localStorage.removeItem("stocknest_token");
      if (!publicPaths.includes(window.location.pathname))
        window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const getErrorMessage = (error) =>
  error.response?.data?.message || "Something went wrong. Please try again.";

export default api;
