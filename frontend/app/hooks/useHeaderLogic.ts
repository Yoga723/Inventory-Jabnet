"use client";

import { getLocalStorageItem, setLocalStorageItem, StorageKeys } from "app/utils/localStorage";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "store/Hooks";
import { RootState } from "store/index";
import { setThemeMode, ThemeMode } from "store/themeSlice"; // valuena light atau dark

const useHeaderLogic = () => {
  const [modalHeader, setModalHeader] = useState(false);
  const [mobileSideBar, setMobileSideBar] = useState(false);
  const mobileSidebarRef = useRef(null);
  const usePath = usePathname();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state: RootState) => state.theme.mode);

  // Load saved theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsidebar);
    return () => document.removeEventListener("mousedown", handleClickOutsidebar);
  }, []);

  const toggleTheme = () => {
    const newMode: ThemeMode = theme === "light" ? "dark" : "light";
    dispatch(setThemeMode(newMode));
  };

  //   Fungsi untuk hide sidebarnya mobile saat user click diluar isinya
  const handleClickOutsidebar = (event) => {
    const currentRef = mobileSidebarRef.current;
    if (currentRef && !currentRef.contains(event.target as Node)) {
      setMobileSideBar(false);
    }
  };

  return { theme, toggleTheme, modalHeader, setModalHeader, mobileSideBar, setMobileSideBar, mobileSidebarRef, usePath };
};

export default useHeaderLogic;
