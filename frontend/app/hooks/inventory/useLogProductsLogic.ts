"use client";

import { useCallback, useEffect, useState } from "react";
import { item_list_props, productsProp } from "../../../types";
import { useAppDispatch, useAppSelector } from "../../../store/Hooks";
import { ModalAction } from "components/modals/AlertModal";
import { useProductsContext } from "context/products/ProductsContext";
import { createLogProductsThunk, deleteLogProductsThunk, fetchLogProductsByIdThunk, fetchLogProductsThunk, putLogProductsThunk, updateCurrentItemField } from "store/inventory/logProductsSlice";
import { API_BASE_URL } from "app/utils/apiConfig";

const useLogProductsLogic = () => {
  const { isModalOpen, closeModal, currentRecordId } = useProductsContext();
  const { full_name } = useAppSelector((state) => state.user);
  const [formError, setFormError] = useState({
    inputError: { errorNama: false, errorLokasi: false, errorListBarang: false, errorKategori: false },
  });
  const [showAlert, setShowAlert] = useState(false);
  const dispatch = useAppDispatch();
  const {
    items: productsData,
    currentItem: payload,
    status: productsStatus, // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: productsError,
  } = useAppSelector((state) => state.productsLog);
  const [categories, setCategories] = useState<{ kategori_id: number; nama_kategori: string }[]>([]);
  const [itemListOptions, setItemListOptions] = useState<{ item_id: number; item_name: string }[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null); // Jang row table
  // Hold Action sampe ada konfirmasi dari AlertModal
  const [pendingAction, setPendingAction] = useState<{ type: ModalAction; handler: () => Promise<void> } | null>(null);

  useEffect(() => {
    if (!isModalOpen) return;
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/kategori`, {
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
          const response = await fetch(`${API_BASE_URL}/products?kategori_id=${payload.kategori_id}`, {
            method: "GET",
            credentials: "include",
          });
          const data = await response.json();
          setItemListOptions(data);
        } catch (error) {
          console.error("Failed to fetch items:", error);
        }
      };
      fetchItems();
    } else {
      setItemListOptions([]);
    }
  }, [payload.kategori_id]);

  const getProductsLog = useCallback(() => {
    dispatch(fetchLogProductsThunk(""));
  }, [dispatch]);

  // Functions untuk isi input form saat user click tombol edit
  const populateForm = useCallback(
    async (recordId: number) => {
      await dispatch(fetchLogProductsByIdThunk(recordId));
    },
    [dispatch]
  );

  // Functions untuk handle input dan forms POST, UPDATE/PUT, DELETE

  const createProductLog = useCallback(async () => {
    if (!validatePayload()) return;

    const selectedCategory = categories.find((cat) => cat.kategori_id === payload.kategori_id);
    if (!selectedCategory) {
      console.error("Selected category not found for ID:", payload.kategori_id);
      return;
    }
    const dataToSend = {
      ...payload,
      nama: full_name,
      kategori: selectedCategory.nama_kategori,
      item_list: JSON.stringify(payload.item_list),
    } satisfies Omit<productsProp, "record_id" | "tanggal" | "item_list"> & {
      item_list: string;
    };

    const res = await dispatch(createLogProductsThunk(dataToSend));

    if (res.meta.requestStatus == "fulfilled") {
      const dismissModal = document.getElementById("dismiss-product-log-modal");
      if (dismissModal) (dismissModal as HTMLElement).click();
    }
  }, [dispatch, payload, full_name, categories]);

  const putProductLog = useCallback(
    async (recordId: number) => {
      if (!validatePayload()) return;
      // Remove hela record_id, tanggal, & set item_list jadi string
      const dataToSend = {
        ...payload,
        nama: full_name,
        item_list: JSON.stringify(payload.item_list),
      } satisfies Omit<productsProp, "record_id" | "tanggal" | "item_list"> & { item_list: string };

      const res = await dispatch(putLogProductsThunk({ recordId: recordId, updatedRecordPayload: dataToSend }));
      if (res.meta.requestStatus == "fulfilled") {
        const dismissModal = document.getElementById("dismiss-product-log-modal");
        if (dismissModal) (dismissModal as HTMLElement).click();
      }
    },
    [dispatch, payload, full_name]
  );

  const deleteProductLog = useCallback(
    async (recordId: number) => {
      try {
        await dispatch(deleteLogProductsThunk(recordId));
      } catch (error) {
        console.error("Delete failed:", error);
      }
    },
    [dispatch]
  );

  // Update useState saat user isi input
  const handleInputChange = useCallback(
    (field: keyof productsProp, value: any) => {
      dispatch(updateCurrentItemField({ field, value }));
    },
    [dispatch]
  );

  // Handler khusus list barang
  const handleItemsChange = useCallback(
    (items: item_list_props[]) => {
      dispatch(updateCurrentItemField({ field: "item_list", value: items }));
    },
    [dispatch]
  );

  const validatePayload = () => {
    const hasErrorNama = !full_name.trim();
    const hasErrorLokasi = !payload.lokasi.trim();
    const hasErrorListBarang = !payload.item_list.length || payload.item_list.some((item) => !item.item_name.trim());
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
    const totalHarga = productsData.reduce((acc, item) => {
      const nilaiNum = Number(item.nilai);
      if (item.status === "Masuk") return acc + nilaiNum;
      if (item.status === "Keluar") return acc - nilaiNum;
      return acc;
    }, 0);
    return totalHarga;
  };

  return {
    itemListOptions,
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
    productsData,
    productsStatus,
    validatePayload,
    formError,
    expandedIndex,
    calculateTotalHarga,
    toggleRow,
    populateForm,
    putProductLog,
    deleteProductLog,
    getProductsLog,
    createProductLog,
    handleInputChange,
    handleItemsChange,
  };
};

export default useLogProductsLogic;
