"use client";

import { getLocalStorageItem, setLocalStorageItem, StorageKeys } from "app/utils/localStorage";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const useHeaderLogic = () => {
  const [theme, setTheme] = useState('corporate')
  const [modalHeader, setModalHeader] = useState(false);
  const [mobileSideBar, setMobileSideBar] = useState(false);
  const mobileSidebarRef = useRef(null);
  const usePath = usePathname();
  const router = useRouter();

  // Load saved theme 
  useLayoutEffect(() => {
    const savedTheme = getLocalStorageItem<"corporate"|"dracula">(StorageKeys.THEME);
    const initial = savedTheme === "dracula" ? "dracula" : "corporate";

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
