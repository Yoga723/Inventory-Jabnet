"use client";
import Link from "next/link";
import React, { Fragment } from "react";
import useHeaderLogic from "../app/hooks/useHeaderLogic";
import Image from "next/image";
import { useAppSelector } from "store/Hooks";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { logoutAction } from "app/actions/authUser";
import HomeIcon from "@mui/icons-material/Home";
import StorageIcon from "@mui/icons-material/Storage";
import GroupIcon from "@mui/icons-material/Group";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";

const navButton = [
  {
    title: "Dashboard",
    icon: <DashboardIcon className="text-accent" />,
    destination: "/",
    allowedRoles: [],
    childLink: null,
  },
  {
    title: "Products",
    icon: <InventoryIcon className="text-accent" />,
    destination: "/products",
    allowedRoles: [],
    childLink: [
      {
        title: "Log Products",
        icon: <StorageIcon className="text-accent" />,
        destination: "/log-products",
        allowedRoles: [],
      },
      {
        title: "Products",
        icon: <InventoryIcon className="text-accent" />,
        destination: "/products",
        allowedRoles: [],
      },
    ],
  },
  {
    title: "Customers",
    icon: <GroupIcon className="text-accent" />,
    destination: "/customers",
    allowedRoles: [],
    childLink: null,
  },
];

const Header = () => {
  const router = useRouter();
  const { full_name, role } = useAppSelector((state) => state.user);
  const { theme, toggleTheme, mobileSideBar, mobileSidebarRef, usePath } = useHeaderLogic();

  const logoutHandler = async () => {
    // Assuming logoutAction can be awaited
    await logoutAction();
    router.push("/login");
  };

  const filteredNav = navButton.filter((btn) => btn.allowedRoles.length === 0 || btn.allowedRoles.includes(role!));

  return (
    <>
      <nav className="sticky top-0 z-50 navbar bg-base-100 shadow-sm md:px-8">
        <div className="navbar-start">
          <Link href="/" className="relative w-24 h-8">
            <Image
              src={theme === "light" ? "/images/jabnet-logo.webp" : "/images/jabnet-logo-dark.png"}
              alt="Logo Jabnet"
              priority
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw"
            />
          </Link>
        </div>
        
        <div className="hidden navbar-center lg:flex gap-4">
          <ul className="menu menu-horizontal">
            {filteredNav.map((btn) => (
              <li key={btn.title} className="flex items-center justify-center p-3 gap-1 h-full hover:bg-base-200">
                {btn.childLink ? (
                  <details className="h-full">
                    <summary>
                      {btn.icon} {btn.title}
                    </summary>
                    <ul className="bg-base-300 rounded-t-none">
                      {btn.childLink.map((child) => (
                        <li key={child.destination}>
                          <Link
                            href={child.destination}
                            // className={`flex items-center p-3 gap-1 h-full hover:bg-base-200 ${
                            //   usePath === child.destination ? "border-b-2 border-amber-300" : ""
                            // }`}
                          >
                            {child.icon}
                            <span>{child.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link
                    href={btn.destination}
                    className={`flex items-center p-3 gap-1 h-full hover:bg-base-200 rounded-lg ${
                      usePath === btn.destination ? "border-b-2 border-amber-300" : ""
                    }`}
                  >
                    {btn.icon}
                    <span>{btn.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="navbar-end">
          <ul className="menu menu-horizontal items-center">
            <li>
              <button aria-label="Toggle Theme" className="btn btn-ghost btn-circle" onClick={toggleTheme}>
                {theme === "light" ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
              </button>
            </li>
            <li>
              <details>
                <summary>Akun</summary>
                <ul className="p-2 bg-base-300 rounded-t-none">
                  <li className="px-4 py-2 text-center">{full_name}</li>
                  <li className="px-4 py-2 text-center">{role}</li>
                  <li className="px-4 py-2">
                    <button
                      type="button"
                      className="w-full text-center font-bold text-error"
                      onClick={logoutHandler}
                    >
                      LOGOUT
                    </button>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
      </nav>

      {/* MOBILE SIDEBAR (Drawer from DaisyUI is generally preferred) */}
      <div className={`fixed top-0 right-0 h-full z-50 transition-transform duration-300 ease-in-out ${mobileSideBar ? "translate-x-0" : "translate-x-full"}`}>
         <div className="absolute inset-0 bg-black opacity-40" onClick={() => { /* function to close sidebar */ }}></div>
        <div ref={mobileSidebarRef} className="w-64 h-full bg-base-200 p-4">
           <Image src={"/images/icons/sticker.webp"} alt="icon" width={200} height={200} className="mx-auto" />
           {/* Add mobile navigation links here */}
         </div>
      </div>


      {/* Bottom Navigation for Mobile & Tablet */}
      <div className="btm-nav lg:hidden">
        <Link href="/" className={usePath === "/" ? "active" : ""}>
          <HomeIcon />
          <span className="btm-nav-label">Home</span>
        </Link>

        <div className="drawer drawer-end">
          <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex justify-center">
             <label htmlFor="my-drawer-4" className="flex flex-col items-center justify-center pt-2">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
               </svg>
               <span className="btm-nav-label">More</span>
             </label>
           </div>
          <div className="drawer-side">
            <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
            <ul className="menu p-4 w-80 min-h-full bg-base-200 gap-4 pt-10">
              {/* Sidebar content here */}
              <li className={`text-lg ${usePath.includes("/products") && "bordered"}`}>
                <Link href={"/products"}>
                  <InventoryIcon />
                  Products
                </Link>
              </li>
              <li className={`text-lg ${usePath.includes("/log-products") && "bordered"}`}>
                <Link href={"/log-products"}>
                  <StorageIcon />
                  Log Products
                </Link>
              </li>
              <li className={`text-lg ${usePath.includes("/customers") && "bordered"}`}>
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