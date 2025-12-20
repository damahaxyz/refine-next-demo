import type { AuthProvider } from "@refinedev/core";
import { post } from "./http";

const API_URL = "";

export const TOKEN_KEY = "token";
export const USER_KEY = "user";

interface LoginResponse {
  code: number;
  data?: {
    token: string;
    [key: string]: any;
  };
  message?: string
}

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    let errorMessage: string = "";
    if (username && password) {

      const res: LoginResponse = await post(`${API_URL}/api/auth/login`, {
        username,
        password
      });


      if (res?.code === 0 && res.data) {
        if (typeof window !== "undefined") {
          localStorage.setItem(TOKEN_KEY, res.data?.token ?? "");
          localStorage.setItem(USER_KEY, JSON.stringify(res.data));
        }
        return {
          success: true,
          redirectTo: "/",
          successNotification: {
            message: "Wellcome back!",
            description: "You have successfully logged in.",
          },
        };
      } else {
        errorMessage = res?.message || "";
      }
    }

    return {
      success: false,
      error: {
        name: "LoginError",
        message: errorMessage || "Invalid username or password",
      },
    };
  },
  register: async ({ username, email, password }: any) => {
    try {
      const res = await post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password,
      });

      if (res?.code === 0) {
        return {
          success: true,
          redirectTo: "/login",
          successNotification: {
            message: "Registration Successful",
            description: "Please log in with your new account.",
          },
        };
      } else {
        return {
          success: false,
          error: {
            message: res?.message || "Registration failed",
            name: "RegisterError",
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: "Network error",
          name: "RegisterError",
        },
      };
    }
  },
  logout: async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      // Clear legacy/conflict cookie if it exists
      document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (token) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    // const token = localStorage.getItem(TOKEN_KEY);
    const user = typeof window !== "undefined" ? localStorage.getItem(USER_KEY) : null;
    if (user) {
      return JSON.parse(user);
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
  updatePassword: async ({ oldPassword, newPassword, token }) => {
    let res = await post(`${API_URL}/api/auth/change_password`, {
      oldPassword: oldPassword,
      newPassword: newPassword
    });
    return {
      success: true, //全返回true 自己处理错误
      res: res
    }
  }
};
