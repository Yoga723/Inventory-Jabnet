<<<<<<< HEAD
"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const useHeaderLogic = () => {
  const [modalHeader, setModalHeader] = useState(false);
  const [mobileSideBar, setMobileSideBar] = useState(false);
  const mobileSidebarRef = useRef(null);
  const usePath = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Cek apakah user sudah login, apabila tidak login -> redirect ke login page
    // const token = document.cookie.match(/auth_token=([^;]+)/)?.[1];

    // if (!token) router.replace("/login");
  }, [router]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsidebar);
    return () => document.removeEventListener("mousedown", handleClickOutsidebar);
  }, []);

  //   Fungsi untuk hide sidebarnya mobile saat user click diluar isinya
  const handleClickOutsidebar = (event) => {
    const currentRef = mobileSidebarRef.current;
    if (currentRef && !currentRef.contains(event.target as Node)) {
      setMobileSideBar(false);
    }
  };

  return { modalHeader, setModalHeader, mobileSideBar, setMobileSideBar, mobileSidebarRef, usePath };
};

export default useHeaderLogic;
=======
"use client";

import { getLocalStorageItem, StorageKeys } from "app/utils/localStorage";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const useHeaderLogic = () => {
  const [theme, settheme] = useState<"light"|"dark">(null!)
  const [modalHeader, setModalHeader] = useState(false);
  const [mobileSideBar, setMobileSideBar] = useState(false);
  const mobileSidebarRef = useRef(null);
  const usePath = usePathname();
  const router = useRouter();

  useEffect(() => {
    const theme = getLocalStorageItem(StorageKeys.THEME)
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsidebar);
    return () => document.removeEventListener("mousedown", handleClickOutsidebar);
  }, []);

  //   Fungsi untuk hide sidebarnya mobile saat user click diluar isinya
  const handleClickOutsidebar = (event) => {
    const currentRef = mobileSidebarRef.current;
    if (currentRef && !currentRef.contains(event.target as Node)) {
      setMobileSideBar(false);
    }
  };

  return { modalHeader, setModalHeader, mobileSideBar, setMobileSideBar, mobileSidebarRef, usePath };
};

export default useHeaderLogic;
>>>>>>> 4289c65a (change name placeholder)
