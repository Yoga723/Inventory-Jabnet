"use client";
import Image from "next/image";
import React, { FormEvent, Suspense } from "react";
import { useLogin } from "../hooks/useLogin";

const page = () => {
  const { login, error } = useLogin();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username").toString();
    const password = formData.get("password").toString();

    await login(username, password);
  };

  return (
    <main className="w-screen h-screen flex flex-col justify-center items-center font-sans">
      <Suspense fallback={<div>Loading.....</div>}>
        <form
          className="container relative w-64 p-6 rounded-lg flex flex-col justify-center items-center border-orange-300 border-[1px] shadow-xl/40 shadow-orange-300"
          onSubmit={handleSubmit}>
          <Image
            src={"/images/jabnet-logo.webp"}
            alt="Logo Jabnet"
            priority
            width={128}
            height={48}
            className="mb-6"
          />
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="username"
            className="border-2 border-gray-500  rounded-md p-2"
          />

          {/* Input PASSWORD */}
          <label
            htmlFor="password"
            className="mt-6">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="password"
            className="border-2 border-gray-500  rounded-md p-2"
          />
          <button
            type="submit"
            className="mt-8 rounded-full bg-gradient-to-b from-orange-300 to-orange-500 hover:cursor-pointer hover:from-orange-500 hover:to-orange-300 text-white font-bold py-2 px-8 transition-all duration-300 hover:shadow-md shadow-amber-300">
            LOGIN
          </button>
        </form>
      </Suspense>
    </main>
  );
};

export default page;
