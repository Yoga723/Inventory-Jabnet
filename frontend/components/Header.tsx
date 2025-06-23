"use client";
import Link from "next/link";
import React from "react";
import useHeaderLogic from "../app/hooks/useHeaderLogic";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "store/Hooks";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { logoutAction } from "app/actions/authUser";
import HomeIcon from "@mui/icons-material/Home";
import StorageIcon from "@mui/icons-material/Storage";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupIcon from "@mui/icons-material/Group";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import { logout } from "store/userSlice";

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
        allowedRoles: ["super_admin", "admin", "operator"],
      },
    ],
  },
  {
    title: "Customers",
    icon: <GroupIcon className="text-accent" />,
    allowedRoles: [],
    childLink: [
      {
        title: "Log Customers",
        icon: <GroupIcon className="text-accent" />,
        destination: "/customers/log-customer",
        allowedRoles: [],
      },
      {
        title: "Setting Customers",
        icon: <SettingsIcon className="text-accent" />,
        destination: "/customers/setting-customer",
        allowedRoles: ["super_admin", "admin", "operator"],
      },
    ],
  },
];

const Header = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { full_name, role } = useAppSelector((state) => state.user);
  const { theme, toggleTheme, usePath } = useHeaderLogic();

  const logoutHandler = async () => {
    await logoutAction();
    dispatch(logout());
    router.push("/login");
  };

  // This filter now correctly hides the "Products" button for the 'field' role
  const filteredNav = navButton.filter((btn) => btn.allowedRoles.length === 0 || btn.allowedRoles.includes(role!));

  return (
    <>
      <nav className="sticky top-0 z-50 navbar bg-base-100 shadow-sm md:px-8">
        <div className="navbar-start">
          <Link
            href="/"
            className="relative w-24 h-8">
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
              <li
                key={btn.title}
                className="flex items-center justify-center gap-1">
                {btn.childLink ? (
                  <details>
                    <summary>
                      {btn.icon} {btn.title}
                    </summary>
                    <ul className="bg-base-300 rounded-t-none">
                      {btn.childLink
                        .filter((child) => child.allowedRoles.length === 0 || child.allowedRoles.includes(role!))
                        .map((child) => (
                          <li key={child.destination}>
                            <Link href={child.destination}>
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
                    className={`flex items-center p-3 gap-1 h-full rounded-lg ${
                      usePath === btn.destination ? "border-b-2 border-amber-300" : ""
                    }`}>
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
              <button
                aria-label="Toggle Theme"
                className="btn btn-ghost btn-circle"
                onClick={toggleTheme}>
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
                      onClick={logoutHandler}>
                      LOGOUT
                    </button>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
      </nav>

      {/* BOTTOM NAV JANG DI MOBILE DAN TABLET */}
      <div className="dock lg:hidden z-[52]">
        <Link
          href="/"
          className={`text-xs ${usePath === "/" ? "active" : ""}`}>
          <HomeIcon />
          <span className="btm-nav-label">Home</span>
        </Link>
        <label
          htmlFor="mobile-drawer"
          className="text-xs cursor-pointer">
          <MenuIcon />
          <span className="btm-nav-label">More</span>
        </label>
      </div>

      {/* SIDEBAR SAAT TOMBOL SHOW MORE DI CLICK DI TABLET DAN MOBILE */}
      <div className="drawer drawer-end lg:hidden">
        <input
          id="mobile-drawer"
          type="checkbox"
          className="drawer-toggle"
        />
        <div className="drawer-content" />
        <div className="drawer-side z-[51]">
          <label
            htmlFor="mobile-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"></label>
          <ul className="menu p-4 w-64 min-h-full bg-base-200 gap-4 pt-10">
            <h2 className="text-xl font-bold text-center mb-4">Menu</h2>
            {filteredNav.map((nav) =>
              !nav.childLink ? (
                <li
                  key={`mobile-${nav.title}`}
                  className={`text-lg ${usePath.includes(nav.destination) && "bordered"}`}>
                  <Link href={nav.destination}>
                    {nav.icon}
                    {nav.title}
                  </Link>
                </li>
              ) : (
                <li
                  key={`mobile-${nav.title}`}
                  className="text-lg">
                  <details>
                    <summary>
                      {nav.icon}
                      {nav.title}
                    </summary>
                    <ul className="p-0">
                      {nav.childLink
                        .filter((child) => child.allowedRoles.length === 0 || child.allowedRoles.includes(role!))
                        .map((child) => (
                          <li
                            key={`mobile-${child.title}`}
                            className={usePath.includes(child.destination) ? "bordered" : ""}>
                            <Link href={child.destination}>
                              {child.icon}
                              {child.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </details>
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Header;
