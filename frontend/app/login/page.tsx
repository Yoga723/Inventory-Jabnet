// login/page.tsx
"use client";
import Image from "next/image";
import React, { FormEvent, useEffect, useState } from "react";
import { loginAction } from "app/actions/authUser";
import useHeaderLogic from "app/hooks/useHeaderLogic";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "store/Hooks";
import { setUser } from "store/userSlice";

const page = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useHeaderLogic();
  const dispath = useAppDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("https://inventory.jabnet.id/api/user/me", {
          credentials: "include",
        });

        if (response.ok) router.replace("/products");
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Masih pake cara formData
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username").toString();
    const password = formData.get("password").toString();

    setIsLoading(true);
    setError(null);

    try {
      const result = await loginAction(username, password);

      if (result.success) {
        dispath(setUser(result.user));
        router.refresh();
        router.replace("/products");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="w-screen h-screen flex flex-col justify-center items-center font-sans">
      <form
        className="container relative w-64 p-6 md:min-w-md rounded-lg flex flex-col justify-center items-center border-orange-300 border-[1px] shadow-xl/40 shadow-orange-300"
        onSubmit={handleSubmit}>
        <Image
          src={theme == "light" ? "/images/jabnet-logo.webp" : "/images/jabnet-logo-dark.png"}
          alt="Logo Jabnet"
          priority
          width={128}
          height={48}
          sizes="(max-width:768px) 100vw, (max-width: 1200px) 50vw, 30vw"
        />
        <label
          htmlFor="username"
          className={` my-5 ${error && "input-error"}`}>
          Username
        </label>

        <input
          type="text"
          name="username"
          id="username"
          placeholder="username"
          className="border-2 border-gray-500 rounded-md p-2"
        />

        {/* Input PASSWORD */}
        <label
          htmlFor="password"
          className={` my-5 ${error && "input-error"}`}>
          Password
        </label>
        <input
          type="Password"
          name="password"
          id="password"
          placeholder="password"
          className="border-2 border-gray-500 rounded-md p-2"
        />
        <button
          type="submit"
          data-cypess="submit-login"
          className="mt-8 rounded-full bg-gradient-to-b from-orange-300 to-orange-500 hover:cursor-pointer hover:from-orange-500 hover:to-orange-300 text-white font-bold py-2 px-8 transition-all duration-300 hover:shadow-md shadow-amber-300">
          LOGIN
        </button>
      </form>
    </main>
  );
};

export default page;
