"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const useHeaderLogic = () => {
  const [modalHeader, setModalHeader] = useState(false);
  const [mobileSideBar, setMobileSideBar] = useState(false);
  const mobileSidebarRef = useRef(null);
  const usePath = usePathname();

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
