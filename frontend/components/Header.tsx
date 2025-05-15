"use client";
import Link from "next/link";
import React from "react";
import HeaderModals from "./modals/HeaderModals";
import useHeaderLogic from "../app/hooks/useHeaderLogic";
import Image from "next/image";

const Header = () => {
  const navButton = [
    { title: "Dashboard", icon: "/images/icons/dashboard-icon.png", destination: "/" },
    { title: "Records", icon: "/images/icons/reports-icon.png", destination: "/records" },
  ];

  const { mobileSideBar, mobileSidebarRef, modalHeader, usePath, setMobileSideBar, setModalHeader } = useHeaderLogic();

  return (
    <>
      <nav className="navbar w-auto bg-base-100">
        <Link
          href="/"
          className="w-24 h-8 relative">
          <Image
            src="/images/jabnet-logo.webp"
            alt="Logo Jabnet"
            priority
            fill
            sizes="(max-width:768px) 100vw, (max-width: 1200px) 50vw, 30vw"
          />
        </Link>
        {/* Navigasi tab desktop */}
        <div className="hidden md:flex items-center gap-4 h-full">
          {navButton.map((btn) => (
            <Link
              key={btn.destination}
              href={btn.destination}
              className={`
              flex items-center gap-1 px-3 h-full hover:bg-gray-100 dark:hover:bg-gray-700/40
              ${usePath === btn.destination && "border-b-2 border-amber-300"}
            `}>
              <Image
                src={btn.icon}
                alt=""
                width={25}
                height={25}
                className="w-[25px] h-[25px]"
              />
              <span>{btn.title}</span>
            </Link>
          ))}

          {/* Profile */}
          <button
            onClick={() => setModalHeader(!modalHeader)}
            className="flex items-center gap-2 px-4 border-l border-white/20 dark:border-gray-700/20 cursor-pointer">
            <Image
              src="/images/icons/profile-avatar-1.png"
              alt="Profile"
              width={40}
              height={40}
              className="w-[40px] h-[40px] rounded-full"
            />
            <Image
              src="/images/icons/arrow-down.png"
              alt="Toggle"
              width={4}
              height={4}
              className="w-4 h-4"
            />
          </button>
        </div>
        {/* Navigasi tab Mobile */}
        <button
          type="button"
          className="mr-6 md:hidden"
          onClick={() => setMobileSideBar(!mobileSideBar)}>
          <Image
            alt="Menu Icon"
            src={"/images/icons/horizontal-lines-icon.png"}
            width={40}
            height={40}
            // className="w-[40px] h-[40px]"
          />
        </button>

        {modalHeader && <HeaderModals />}
      </nav>
      <div className={`${mobileSideBar ? "absolute flex top-0 right-0 w-full h-full z-50" : "hidden"}`}>
        <div className="flex-4/12 to-black opacity-40 w-full h-full"></div>
        <div
          ref={mobileSidebarRef}
          className={`flex-7/12 h-full z-10 bg-gray-200 opacity-100 px-4 py-8`}>
          <p>Hello world</p>
        </div>
      </div>
    </>
  );
};

export default Header;
