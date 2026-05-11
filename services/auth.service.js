import { decodeAuthToken } from "../utils/decode-access-token";
import { getFromLocalStorage, setToLocalStorage } from "../utils/local-storage";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

// Store user info in localStorage
export const storeUserInfo = (userData) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("userData", JSON.stringify(userData));
  }
};

// Retrieve user data from localStorage
export const getUserData = () => {
  const userData = getFromLocalStorage("userData");
  return userData ? JSON.parse(userData) : null;
};

// Store user token in localStorage
export const storeUserToken = ({ accessToken }) => {
  if (accessToken) {
    setToLocalStorage("accessToken", accessToken);
  }
};

export const storeSessionToken = ({ sessionToken }) => {
  if (sessionToken) {
    setToLocalStorage("sessionToken", sessionToken);
  }
};

// Retrieve user token from localStorage
export const getUserToken = () => {
  if (typeof window === "undefined") return "";
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.warn("Authorization token is missing or invalid.");
    return "";
  }
  return token;
};

export const storeResetToken = ({ resetToken }) => {
  if (resetToken) {
    setToLocalStorage("resetToken", resetToken);
  }
};

export const getResetToken = () => {
  if (typeof window === "undefined") return "";
  const token = localStorage.getItem("resetToken");
  if (!token) {
    console.error("Reset token is missing or invalid.");
    return "";
  }
  return token;
};

// Retrieve user info (decoded token) from localStorage
export const getUserInfo = () => {
  const authToken = getFromLocalStorage("accessToken");
  if (authToken) {
    try {
      const decodedData = decodeAuthToken(authToken);
      return decodedData;
    } catch (error) {
      console.error("Error decoding the token:", error);
      removeAccessToken(); // Cleanup invalid token
      return null; // Gracefully return null if decoding fails
    }
  }
  return null; // If no token is found, return null
};

// Check if the user is logged in
export const isLoggedIn = () => {
  const authToken = getFromLocalStorage("accessToken");
  return !!authToken; // Returns true if token exists
};

export const hasAdminAccess = () => {
  const authToken = getFromLocalStorage("accessToken");
  const userData = getUserData();

  if (!authToken || !userData?.is_admin) {
    return false;
  }

  const decodedData = decodeAuthToken(authToken);
  const expiry = decodedData?.exp;
  if (!expiry) {
    return false;
  }

  return expiry * 1000 > Date.now();
};

export const loginAdmin = async ({ email, password }) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.detail || "Login failed");
  }

  if (!data?.user?.is_admin) {
    throw new Error("This account does not have admin dashboard access");
  }

  storeUserToken({ accessToken: data.access_token });
  storeSessionToken({ sessionToken: data.session_token });
  storeUserInfo(data.user);
  return data.user;
};

// Remove the access token from localStorage
export const removeAccessToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
  }
};

// Remove all user info from localStorage
export const clearUserInfo = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
  }
};
