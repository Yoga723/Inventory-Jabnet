"use client";
import Link from "next/link";
import React from "react";
import useHeaderLogic from "../app/hooks/useHeaderLogic";
import Image from "next/image";
import { useAppSelector } from "store/Hooks";
import { useLogin } from "app/hooks/useLogin";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

const Header = () => {
  const navButton = [
    { title: "Dashboard", icon: "/images/icons/dashboard-icon.png", destination: "/" },
    { title: "Records", icon: "/images/icons/reports-icon.png", destination: "/records" },
  ];

  const { full_name, role, username } = useAppSelector((state) => state.user);

  const {
    theme,
    toggleTheme,
    mobileSideBar,
    mobileSidebarRef,
    modalHeader,
    usePath,
    setMobileSideBar,
    setModalHeader,
  } = useHeaderLogic();
  const { logoutHandler } = useLogin();

  return (
    <>
      <nav className="sticky z-50 top-0 navbar bg-base-100 shadow-sm px-8 ">
        <div className="navbar-start">
          <Link
            href="/"
            className="w-24 h-8 relative">
            <Image
              src={theme == "light" ? "/images/jabnet-logo.webp" : "/images/jabnet-logo-dark.png"}
              alt="Logo Jabnet"
              priority
              fill
              sizes="(max-width:768px) 100vw, (max-width: 1200px) 50vw, 30vw"
            />
          </Link>
          <p>{full_name}</p>
          <p>{role}</p>
          <p>{username}</p>
        </div>
        <div className="navbar-center hidden lg:flex gap-4">
          {navButton.map((btn) => (
            <Link
              key={btn.destination}
              href={btn.destination}
              className={`
              flex items-center p-3 h-full hover:bg-base-300 rounded-lg shadow-lg drop-shadow-lg 
              ${usePath === btn.destination && "border-b-2 border-amber-300"}
            `}>
              <Image
                src={btn.icon}
                alt={btn.title}
                width={25}
                height={25}
              />
              <span>{btn.title}</span>
            </Link>
          ))}
        </div>
        <div className="navbar-end gap-4">
          <button
            aria-label="Toggle Theme"
            className="btn btn-ghost btn-circle"
            onClick={() => toggleTheme()}>
            {theme === "light" ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
          </button>

          <div className="dropdown flex justify-center items-center">
            <button
              type="button"
              className="cursor-pointer"
              onClick={() => logoutHandler()}>
              <Image
                width="20"
                height="20"
                src={"/images/icons/icon8-exit.png"}
                alt="emergency-exit"
              />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE SIDEBAR */}
      <div className={`${mobileSideBar ? "absolute flex top-0 right-0 w-full h-full z-50" : "hidden"}`}>
        <div className="flex-4/12 to-black opacity-40 w-full h-full"></div>
        <div
          ref={mobileSidebarRef}
          className={`flex-7/12 h-full z-10 bg-gray-200 opacity-100 px-4 py-8 relative`}>
          <Image
            src={"/images/icons/sticker.webp"}
            alt="icon"
            width={300}
            height={300}
          />
        </div>
      </div>

      {/* Bottom Navigasi Mobile & Tablet */}
      <div className="dock lg:hidden">
        <Link
          href={navButton[0].destination}
          type={`button`}
          className={` ${usePath === "/" && "dock-active"}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>

          <span className="dock-label">Home</span>
        </Link>

        <Link
          href={navButton[1].destination}
          type="button"
          className={` ${usePath === "/records" && "dock-active"}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"
            />
          </svg>

          <span className="dock-label">Records</span>
        </Link>

        <button
          type={`button`}
          onClick={() => setMobileSideBar(!mobileSideBar)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
            />
          </svg>

          <span className="dock-label">Settings</span>
        </button>
      </div>
    </>
  );
};

export default Header;
