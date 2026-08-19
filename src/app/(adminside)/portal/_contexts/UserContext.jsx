"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";

const UserContext = createContext();

function inferPortalPersona(user) {
  const roles = user?.roles || [];
  if (roles.some((r) => String(r).includes("OWNER"))) return "OWNER";
  if (roles.some((r) => String(r).includes("BROKER"))) return "BROKER";
  return user?.userType || "BROKER";
}

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
          userType: response.data.userType || inferPortalPersona(response.data),
          role: response.data.userType || inferPortalPersona(response.data) || "Broker",
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

  const logout = async (redirectTo = "/") => {
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
      const cookieOpts = { path: "/" };
      Cookies.remove("userData", cookieOpts);
      Cookies.remove("token", cookieOpts);
      Cookies.remove("refreshToken", cookieOpts);
      // Always land on the public homepage — never /portal.
      const homeUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/`
          : "/";
      const target = redirectTo && redirectTo !== "/portal" && !String(redirectTo).startsWith("/portal")
        ? redirectTo
        : "/";
      if (typeof window !== "undefined") {
        window.location.replace(target === "/" ? homeUrl : target);
      } else {
        router.replace(target === "/" ? "/" : target);
      }
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
