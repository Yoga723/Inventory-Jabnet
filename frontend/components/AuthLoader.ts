"use client";

import { useEffect } from "react";
import { useAppDispatch } from "store/Hooks";
import { setUser } from "store/userSlice";

export default function AuthLoader() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("https://inventory.jabnet.id/api/user/me", {
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