// frontend/app/actions/authUser.ts
"use server";
import { API_BASE_URL } from "app/utils/apiConfig";
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
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const responseText = await response.text();
    let responseData;

    try {
      // This is where the error happens if the response is HTML
      responseData = JSON.parse(responseText);
    } catch (e) {
      return { error: "Server returned an unexpected response. Check the browser console and server logs." };
    }

    if (!response.ok) {
      // Now we use the data we already read
      console.error("Login failed on server:", responseData);
      return { error: responseData.error || `Login failed with status: ${response.status}` };
    }

    const token = responseData.data?.token;
    if (!token) {
      console.error("No token found in successful response:", responseData);
      return { error: "Login successful, but no token was provided." };
    }

    (await cookies()).set("auth_token", token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return { success: true, user: responseData.data.user };
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
