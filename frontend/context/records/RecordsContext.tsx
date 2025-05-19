"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { useAppDispatch } from "store/Hooks";
import { clearCurrentItem } from "store/recordSlice";

interface RecordsContextType {
  isModalOpen: boolean;
  currentRecordId: number | null;
  openModal: (recordId: number | null) => void;
  closeModal: () => void;
}

const RecordsContext = createContext<RecordsContextType>(null!);

export const RecordsProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState<number | null>(null);

  const openModal = (recordId: number | null) => {
    dispatch(clearCurrentItem());
    setCurrentRecordId(recordId);
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
