"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}users/me`,
        { withCredentials: true },
      );
      if (response.data) {
        const profile = {
          ...response.data,
          role: response.data.userType || "Broker",
        };
        setUserData(profile);
        Cookies.set("userData", JSON.stringify(profile), {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
          path: "/",
        });
        return profile;
      }
    } catch (err) {
      const cookieData = Cookies.get("userData");
      if (cookieData) {
        try {
          const parsed = JSON.parse(cookieData);
          setUserData(parsed);
          return parsed;
        } catch {
          // ignore parse error
        }
      }
      console.error("Error loading user profile:", err);
    }
    return null;
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      await fetchUserProfile();
      setLoading(false);
    };
    loadUserData();
  }, [fetchUserProfile]);

  const updateUserData = (newData) => {
    const updatedData = { ...userData, ...newData };
    setUserData(updatedData);
    try {
      Cookies.set("userData", JSON.stringify(updatedData), {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/",
      });
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  const logout = async () => {
    setUserData(null);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}app/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      Cookies.remove("userData");
      Cookies.remove("token");
      Cookies.remove("refreshToken");
      router.push("/portal");
    }
  };

  const refreshUser = async () => {
    return fetchUserProfile();
  };

  const value = {
    userData,
    loading,
    updateUserData,
    logout,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
