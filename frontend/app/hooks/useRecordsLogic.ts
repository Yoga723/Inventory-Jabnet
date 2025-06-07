"use client";

import { useCallback, useEffect, useState } from "react";
import { list_barang_props, recordsProp } from "../../types";
import { useAppDispatch, useAppSelector } from "../../store/Hooks";
import {
  createRecordsThunk,
  deleteRecordsThunk,
  fetchRecordByIdThunk,
  fetchRecordsThunk,
  putRecordsThunk,
  updateCurrentItemField,
} from "../../store/recordSlice";
import { ModalAction } from "components/modals/AlertModal";
import { useRecordsContext } from "context/records/RecordsContext";

const useRecordsLogic = () => {
  const { isModalOpen, closeModal, currentRecordId } = useRecordsContext();
  const { full_name } = useAppSelector((state) => state.user);
  const [formError, setFormError] = useState({
    inputError: { errorNama: false, errorLokasi: false, errorListBarang: false, errorKategori: false },
  });
  const [showAlert, setShowAlert] = useState(false);
  const dispatch = useAppDispatch();
  const {
    items: recordsData,
    currentItem: payload,
    status: recordsStatus, // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: recordsError,
  } = useAppSelector((state) => state.records);
  const [categories, setCategories] = useState<{ kategori_id: number; nama_kategori: string }[]>([]);
  const [list_barang_options, setList_barang_options] = useState<{ barang_id: number; nama_barang: string }[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null); // Jang row table
  // Hold Action sampe ada konfirmasi dari AlertModal
  const [pendingAction, setPendingAction] = useState<{ type: ModalAction; handler: () => Promise<void> } | null>(null);

  // GET data data kategori ti database
  useEffect(() => {
    if (!isModalOpen) return;
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://inventory.jabnet.id/api/records/kategori", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, [isModalOpen]);

  // UPDATE input listbarang men user ganti input value dina kategori
  useEffect(() => {
    if (payload.kategori_id) {
      const fetchItems = async () => {
        try {
          const response = await fetch(
            `https://inventory.jabnet.id/api/records/barang?kategori_id=${payload.kategori_id}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await response.json();
          setList_barang_options(data);
        } catch (error) {
          console.error("Failed to fetch items:", error);
        }
      };
      fetchItems();
    } else {
      setList_barang_options([]);
    }
  }, [payload.kategori_id]);

  const getRecords = useCallback(() => {
    dispatch(fetchRecordsThunk(""));
  }, [dispatch]);

  // Functions untuk isi input form saat user click tombol edit
  const populateForm = useCallback(
    async (recordId: number) => {
      await dispatch(fetchRecordByIdThunk(recordId));
    },
    [dispatch]
  );

  // Functions untuk handle input dan forms POST, UPDATE/PUT, DELETE

  const createRecord = useCallback(async () => {
    if (!validatePayload()) return;

    const dataToSend = {
      ...payload,
      nama: full_name,
      kategori: categories[payload.kategori_id].nama_kategori,
      list_barang: JSON.stringify(payload.list_barang),
    } satisfies Omit<recordsProp, "record_id" | "tanggal" | "list_barang"> & {
      list_barang: string;
    };

    console.log("this is data to send",dataToSend)

    const res = await dispatch(createRecordsThunk(dataToSend));

    if (res.meta.requestStatus == "fulfilled") {
      const dismissModal = document.getElementById("dismiss-record-modal");
      if (dismissModal) (dismissModal as HTMLElement).click();
    }
  }, [dispatch, payload, full_name]);

  const putRecord = useCallback(
    async (recordId: number) => {
      if (!validatePayload()) return;
      // Remove hela record_id, tanggal, & set list_barang jadi string
      const dataToSend = {
        ...payload,
        nama: full_name,
        list_barang: JSON.stringify(payload.list_barang),
      } satisfies Omit<recordsProp, "record_id" | "tanggal" | "list_barang"> & { list_barang: string };

      const res = await dispatch(putRecordsThunk({ recordId: recordId, updatedRecordPayload: dataToSend }));
      if (res.meta.requestStatus == "fulfilled") {
        const dismissModal = document.getElementById("dismiss-record-modal");
        if (dismissModal) (dismissModal as HTMLElement).click();
      }
    },
    [dispatch, payload, full_name]
  );

  const deleteRecord = useCallback(
    async (recordId: number) => {
      try {
        await dispatch(deleteRecordsThunk(recordId));
      } catch (error) {
        console.error("Delete failed:", error);
      }
    },
    [dispatch]
  );

  // Update useState saat user isi input
  const handleInputChange = useCallback(
    (field: keyof recordsProp, value: any) => {
      dispatch(updateCurrentItemField({ field, value }));
    },
    [dispatch]
  );

  // Handler khusus list barang
  const handleItemsChange = useCallback(
    (items: list_barang_props[]) => {
      dispatch(updateCurrentItemField({ field: "list_barang", value: items }));
    },
    [dispatch]
  );

  const validatePayload = () => {
    const hasErrorNama = !full_name.trim();
    const hasErrorLokasi = !payload.lokasi.trim();
    const hasErrorListBarang =
      !payload.list_barang.length || payload.list_barang.some((item) => !item.nama_barang.trim());
    const hasErrorKategori = payload.kategori_id == null;

    const newErrors = {
      errorNama: hasErrorNama,
      errorLokasi: hasErrorLokasi,
      errorListBarang: hasErrorListBarang,
      errorKategori: hasErrorKategori,
    };

    setFormError({ inputError: newErrors });

    return !Object.values(newErrors).some((error) => error);
  };

  const handleConfirmation = async () => {
    if (pendingAction) {
      await pendingAction.handler();
      setPendingAction(null);
      setShowAlert(false);
    }
  };

  const handleCancel = () => {
    setPendingAction(null);
    setShowAlert(false);
  };

  const showConfirmation = (action: ModalAction, handler: () => Promise<void>) => {
    setPendingAction({ type: action, handler });
    setShowAlert(true);
  };

  // Toggle table row
  const toggleRow = (idx: number) => {
    setExpandedIndex((expandedIndex) => (expandedIndex == idx ? null : idx));
  };

  const calculateTotalHarga = () => {
    const totalHarga = recordsData.reduce((acc, item) => {
      const nilaiNum = Number(item.nilai);
      if (item.status === "Masuk") return acc + nilaiNum;
      if (item.status === "Keluar") return acc - nilaiNum;
      return acc;
    }, 0);
    return totalHarga;
  };

  return {
    list_barang_options,
    isModalOpen,
    categories,
    closeModal,
    currentRecordId,
    handleConfirmation,
    handleCancel,
    showConfirmation,
    pendingAction,
    showAlert,
    payload,
    recordsData,
    recordsStatus,
    validatePayload,
    formError,
    expandedIndex,
    calculateTotalHarga,
    toggleRow,
    populateForm,
    putRecord,
    deleteRecord,
    getRecords,
    createRecord,
    handleInputChange,
    handleItemsChange,
  };
};

export default useRecordsLogic;
