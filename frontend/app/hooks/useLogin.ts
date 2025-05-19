// hooks/useLogin.ts
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppDispatch } from "store/Hooks";
import { loginUser, logout } from "store/userSlice";

export function useLogin() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setError(null);
    const result = await dispatch(loginUser({ username, password }));
    if (loginUser.fulfilled.match(result)) {
      const { token } = result.payload as { token: string };
      // Set cookie agar bisa dibaca oleh middleware
      document.cookie = [
        `auth_token=${token}`, // value JWT
        `Path=/`, // range cookie ka kabeh file
        `Max-Age=${7 * 24 * 60 * 60}`, // 7 hari
        `SameSite=Lax`,
        `Secure`, 
      ].join("; ");
      router.replace("/records");
    } else {
      alert("Username atau password salah!");
    }
  };

  const logoutHandler = () => {
    dispatch(logout());
    router.push("/login");
  };

  return { login, error, logoutHandler };
}
