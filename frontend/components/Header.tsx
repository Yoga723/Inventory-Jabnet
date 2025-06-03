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

  const { full_name, role } = useAppSelector((state) => state.user);

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
        <div className="navbar-end">
          <ul className="menu menu-horizontal flex justify-center items-center">
            <li>
              <button
                aria-label="Toggle Theme"
                className="btn btn-ghost btn-circle"
                onClick={() => toggleTheme()}>
                {theme === "light" ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
              </button>
            </li>
            <li>
              <details>
                <summary>Akun</summary>
                <ul className="bg-base-300 rounded-t-none">
                  <li className="my-4 text-center">{full_name}</li>
                  <li className="my-4 text-center">{role}</li>
                  <li className="my-4">
                    <button
                      type="button"
                      className="cursor-pointer text-center font-extrabold"
                      onClick={() => logoutHandler()}>
                      LOGOUT
                    </button>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
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
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
            />
          </svg>

          <span className="dock-label">Records</span>
        </Link>

        <div className="drawer drawer-end">
          <input
            id="my-drawer-4"
            type="checkbox"
            className="drawer-toggle"
          />
          <div className="drawer-content">
            {/* Page content here */}
            <label
              htmlFor="my-drawer-4"
              className="flex flex-col items-center dock-label">
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
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
              Show More
            </label>
          </div>
          <div className="drawer-side">
            <label
              htmlFor="my-drawer-4"
              aria-label="close sidebar"
              className="drawer-overlay"></label>
            <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4 pt-20">
              {/* Sidebar content here */}
              <li>
                <a>Sidebar Item 1</a>
              </li>
              <li>
                <a>Sidebar Item 2</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
