"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface RecordsContextType {
  isModalOpen: boolean;
  currentRecordId: number | null;
  openModal: (id: number | null) => void;
  closeModal: () => void;
}

const RecordsContext = createContext<RecordsContextType>(null!);

export const RecordsProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState<number | null>(null);

  const openModal = (id: number | null) => {
    setCurrentRecordId(id);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  return (
    <RecordsContext.Provider value={{ isModalOpen, currentRecordId, openModal, closeModal }}>
      {children}
    </RecordsContext.Provider>
  );
};

export const useRecordsContext = () => useContext(RecordsContext);
