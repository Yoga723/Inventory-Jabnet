// hooks/useLogin.ts
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function useLogin() {
  const router = useRouter();
  // const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setError(null);
    try {
      const res = await fetch("https://inventory.jabnet.id/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const response = await res.json();

      if (res.ok) {
        document.cookie = `auth_token = ${response.data};path=/; sameSite=Lax`;
        // const redirectTo = searchParams.get("redirect") || "/dashboard";
        router.push("/records");
      } else {
        setError(response.error || "Login failed");
        alert("username atau password salah !!!");
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setError("Server unreachable");
      alert("Gagal terhubung ke server!");
    }
  };

  const logout = (event: any) => {
    document.cookie = `auth_token=null;path=;sameSite=Lax;expires=Thu,01 Jan 1970 00:00:00 GMT`;
    router.push("/login");
  };

  return { login, error, logout };
}
