// frontend/app/actions/authUser.ts
"use server";
import { cookies } from "next/headers";

const cookieOptions = {
  httpOnly: true,
  path: "/",
  secure: true,
  sameSite: "none" as const,
  partitioned: true,
};

export async function loginAction(username: string, password: string) {
  try {
    const response = await fetch("http://inventory.jabnet.id/backend/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
      console.log("THIS IS TOKEN :", response);
    if (!response.ok) {
      const error = await response.json();
      console.log("THIS IS TOKEN :", error);
      return { error: error.error || "Login failed" };
    }

    // Set HTTP-only cookie
    const json = await response.json();
    const token = json.data.token;
    (await cookies()).set("auth_token", token, {
      ...cookieOptions,
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
    (await cookies()).delete("auth_token");
    // (await cookies()).set("auth_token", "", {
    //   ...cookieOptions,
    //   maxAge: 0,
    // });

    return { success: true };
  } catch (error) {
    console.log("Logout error", error);
    return { error: "Logout failed" };
  }
};
