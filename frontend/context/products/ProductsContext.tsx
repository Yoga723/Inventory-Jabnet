"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { useAppDispatch } from "store/Hooks";
import { clearCurrentItem } from "store/logProductsSlice";

interface ProductsContextType {
  currentRecordId: number | null;
  isModalOpen: boolean;
  openModal: (recordId: number | null) => void;
  closeModal: () => void;
  isAlertOpen: boolean;
  openAlert: () => void;
  closeAlert: () => void;
}

const ProductsContext = createContext<ProductsContextType>(null!);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState<number | null>(null);

  const openModal = (recordId: number | null) => {
    dispatch(clearCurrentItem());
    setCurrentRecordId(recordId);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);
  const closeAlert = () => setIsAlertOpen(false);
  const openAlert = () => setIsAlertOpen(true);

  return (
    <ProductsContext.Provider
      value={{ isModalOpen, currentRecordId, openModal, closeModal, isAlertOpen, closeAlert, openAlert }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProductsContext = () => useContext(ProductsContext);
