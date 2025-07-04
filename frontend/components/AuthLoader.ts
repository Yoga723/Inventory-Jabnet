"use client";

import { API_BASE_URL } from "app/utils/apiConfig";
import { useEffect } from "react";
import { useAppDispatch } from "store/Hooks";
import { setUser } from "store/userSlice";

export default function AuthLoader() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/me`, {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          dispatch(setUser(data.data));
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, [dispatch]);

  return null;
}