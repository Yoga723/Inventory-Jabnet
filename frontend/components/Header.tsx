"use client";
import Link from "next/link";
import React from "react";
import useHeaderLogic from "../app/hooks/useHeaderLogic";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "store/Hooks";
import { ArchiveBoxIcon, MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { logoutAction } from "app/actions/authUser";
import HomeIcon from "@mui/icons-material/Home";
import StorageIcon from "@mui/icons-material/Storage";
import GroupIcon from "@mui/icons-material/Group";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";

const Header = () => {
  const router = useRouter();
  const navButton = [
    { title: "Dashboard", icon: <DashboardIcon className="text-accent" />, destination: "/", allowedRoles: [] },
    { title: "Log Products", icon: <StorageIcon className="text-accent" />, destination: "/log-products", allowedRoles: [] },
    {
      title: "Products",
      icon: <InventoryIcon className="text-accent" />,
      destination: "/products",
      allowedRoles: [],
    },
    { title: "Customers", icon: <GroupIcon className="text-accent" />, destination: "/customers", allowedRoles: [] },
  ];

  const { full_name, role } = useAppSelector((state) => state.user);

  const { theme, toggleTheme, mobileSideBar, mobileSidebarRef, usePath } = useHeaderLogic();

  const logoutHandler = () => {
    logoutAction();
    router.push("/login");
  };

  const filteredNav = navButton.filter((btn) => btn.allowedRoles.length === 0 || btn.allowedRoles.includes(role!));
  return (
    <>
      <nav className="sticky z-50 top-0 navbar bg-base-100 shadow-sm md:px-8 ">
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
          {filteredNav.map((btn) => (
            <Link
              key={btn.title}
              href={btn.destination}
              className={`
              flex items-center p-3 gap-1 h-full hover:bg-base-300 rounded-lg shadow-lg drop-shadow-lg 
              ${usePath === btn.destination && "border-b-2 border-amber-300"}
            `}>
              {btn.icon}
              {/* <Image
                src={btn.icon}
                alt={btn.title}
                width={25}
                height={25}
              /> */}
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
          <HomeIcon />

          <span className="dock-label">Home</span>
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
            <ul className="menu bg-base-200 text-base-content min-h-full w-80 gap-4 p-4 pt-20">
              {/* Sidebar content here */}
              <li className={`text-lg ${usePath.includes("/products") && "border-b-2 bg-base-300 rounded-md"}`}>
                <Link href={"/products"}>
                  <InventoryIcon />
                  Products
                </Link>
              </li>
              <li className={`text-lg ${usePath.includes("/log-products") && "border-b-2 bg-base-300 rounded-md"}`}>
                <Link href={"/log-products"}>
                  <StorageIcon />
                  Log Products
                </Link>
              </li>
              <li className={`text-lg ${usePath.includes("/customers") && "border-b-2 bg-base-300 rounded-md"}`}>
                <Link href={"/customers"}>
                  <GroupIcon />
                  Customers
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
