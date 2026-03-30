import { User } from "@workspace/api-client-react";

export const getToken = () => localStorage.getItem("umkm_token");
export const setToken = (token: string) => localStorage.setItem("umkm_token", token);
export const removeToken = () => localStorage.removeItem("umkm_token");

export const getUser = (): User | null => {
  const userStr = localStorage.getItem("umkm_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setUser = (user: User) => localStorage.setItem("umkm_user", JSON.stringify(user));
export const removeUser = () => localStorage.removeItem("umkm_user");

export const logoutUser = () => {
  removeToken();
  removeUser();
  window.location.href = "/login";
};
