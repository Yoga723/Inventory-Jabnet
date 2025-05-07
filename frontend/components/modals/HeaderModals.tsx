"use client";
import Image from "next/image";
import React from "react";
import { useLogin } from "../../app/hooks/useLogin";

const HeaderModals = () => {
  const { logout } = useLogin();
  return (
    <>
      {/* Modal untuk Desktop */}
      <ul className="border-2 border-amber-200 bg-white rounded-lg align-baseline absolute right-18 top-12 z-20">
        <li className="flex items-center gap-2 text-start px-8 py-2 w-full cursor-pointer hover:bg-gray-100">Role</li>
        <li>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 text-start px-8 py-2 w-full cursor-pointer hover:bg-gray-100">
            <Image
              alt="X"
              width={20}
              height={20}
              src={"/images/icons/exit-icon.gif"}
              // className="w-[20px] h-[20px]"
            />
            Logout
          </button>
        </li>
      </ul>
    </>
  );
};

export default HeaderModals;
