"use server";

import { cookies } from "next/headers";

export async function loginAction(username: string, password: string) {
  try {
    const response = await fetch("https://inventory.jabnet.id/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Login failed" };
    }

    const json = await response.json();
    const token = json.data.token;

    // Set HTTP-only cookie
    (await cookies()).set("auth_token", token, {
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "none",
      partitioned: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return { success: true, user: json.data.user };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Server error" };
  }
}

export const logoutAction = async () => {
  try {
    (await cookies()).set("auth_token", "", {
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "none",
      partitioned: true,
      maxAge: 0,
    });
  } catch (error) {
    console.log("Terjadi kesalahan saat mencoba logout", error)
    return {error : "Gagal Logout"}
  }
};
