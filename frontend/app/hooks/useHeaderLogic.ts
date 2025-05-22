"use client";

import { getLocalStorageItem, setLocalStorageItem, StorageKeys } from "app/utils/localStorage";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Theme = "light" | "dark";

const useHeaderLogic = () => {
  const [theme, setTheme] = useState<"light"|"dark">(StorageKeys.THEME)
  const [modalHeader, setModalHeader] = useState(false);
  const [mobileSideBar, setMobileSideBar] = useState(false);
  const mobileSidebarRef = useRef(null);
  const usePath = usePathname();

  // Load saved theme 
  useEffect(() => {
    const savedTheme = getLocalStorageItem<Theme>(StorageKeys.THEME);
    const initial:Theme = savedTheme === "dark" ? "dark" : "light";
    setTheme(initial)
    document.documentElement.setAttribute("data-theme", initial)
  }, []);

  useEffect(()=>{
    setLocalStorageItem(StorageKeys.THEME, theme);
    document.documentElement.setAttribute("data-theme", theme);
  },[theme])

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

  return { theme, setTheme, modalHeader, setModalHeader, mobileSideBar, setMobileSideBar, mobileSidebarRef, usePath };
};

export default useHeaderLogic;
