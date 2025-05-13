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
} from "../../store/recordSlice";

const useRecordsLogic = () => {
  const dispatch = useAppDispatch();
  const {
    items: recordsData,
    currentItem,
    status: recordsStatus, // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: recordsError,
  } = useAppSelector((state) => state.records);
  const initialPayload: recordsProp = {
    nama: "",
    status: "Masuk",
    lokasi: "",
    list_barang: [{ nama_barang: "", qty: 1 }],
    nilai: 0,
    tanggal: new Date().toISOString(),
    keterangan: "",
  };
  const [payload, setPayload] = useState<recordsProp>(initialPayload);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null); // Jang row table

  // Untuk populate input-input form saat tombol edit di click
  useEffect(() => {
    if (currentItem && recordsStatus === "succeeded" && !recordsError) {
      setPayload({
        record_id: currentItem.record_id,
        nama: currentItem.nama || "",
        status: currentItem.status || "Masuk", // Ensure 'status' has a valid default from your type
        lokasi: currentItem.lokasi || "",
        list_barang:
          Array.isArray(currentItem.list_barang) && currentItem.list_barang.length > 0
            ? currentItem.list_barang // Use as is if it's a valid array
            : [{ nama_barang: "", qty: 1 }], // Fallback for empty or invalid list_barang
        nilai: parseFloat(String(currentItem.nilai)) || 0, // Convert string "0.00" to number 0
        tanggal: currentItem.tanggal ? new Date(currentItem.tanggal).toISOString() : new Date().toISOString(),
        keterangan: currentItem.keterangan || "", // Convert null to empty string
      });
    }
  }, [currentItem, recordsStatus, recordsError]);

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

  const createRecord = useCallback(
    async (event) => {
      if (!validatePayload) return;
      if (!confirm("Yakin ingin tambah data 👉👈 ?")) return;
      event.preventDefault();
      const dataToSend = { ...payload, list_barang: JSON.stringify(payload.list_barang) } satisfies Omit<
        recordsProp,
        "record_id" | "tanggal" | "list_barang"
      > & {
        list_barang: string;
      };
      const res = await dispatch(createRecordsThunk(dataToSend));

      if (res.meta.requestStatus == "fulfilled") {
        const dismissModal = document.getElementById("dismiss-record-modal");
        if (dismissModal) (dismissModal as HTMLElement).click();
      }
    },
    [dispatch, payload]
  );

  const putRecord = useCallback(
    async (event: React.FormEvent, recordId: number) => {
      if (!validatePayload) return;
      if (!confirm("Yakin ingin update data ?")) return;
      event.preventDefault();
      // Remove hela record_id, tanggal, & set list_barang jadi string
      const dataToSend = {
        ...payload,
        list_barang: JSON.stringify(payload.list_barang),
      } satisfies Omit<recordsProp, "record_id" | "tanggal" | "list_barang"> & { list_barang: string };

      const res = await dispatch(putRecordsThunk({ recordId: recordId, updatedRecordPayload: dataToSend }));
      if (res.meta.requestStatus == "fulfilled") {
        const dismissModal = document.getElementById("dismiss-record-modal");
        if (dismissModal) (dismissModal as HTMLElement).click();
      }
    },
    [dispatch, payload]
  );

  const deleteRecord = useCallback(
    async (event: React.FormEvent, recordId: number) => {
      if (!confirm("Yakin hapus data ini ?")) return;
      event.preventDefault();
      const res = await dispatch(deleteRecordsThunk(recordId));
      console.log("ini delete:", res);
      if (res.meta.requestStatus == "fulfilled") {
      }
    },
    [dispatch]
  );

  // Update useState saat user isi input
  const handleInputChange = useCallback(
    (field: keyof recordsProp, value: any) => {
      setPayload((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [setPayload]
  );

  // Handler khusus list barang
  const handleItemsChange = useCallback(
    (items: list_barang_props[]) => {
      handleInputChange("list_barang", items);
    },
    [setPayload] // **IMPORTANT: Add `setPayload` dependency**
  );

  const validatePayload = () => {
    if (!payload.nama.trim() || payload.nama.length < 2) return alert("Nami di isian hela a 😅");

    if (!payload.lokasi.trim() || payload.lokasi.length < 2) return alert("Lokasina di isi oga a 🤪");

    if (payload.list_barang.some((item) => !item.nama_barang.trim() || item.nama_barang.length < 2 || item.qty < 1))
      return alert("CEK HELA ATUH EYYY LIST BARANGNA 😇");

    return true;
  };

  // Toggle table row
  const toggleRow = (idx: number) => {
    setExpandedIndex((expandedIndex) => (expandedIndex == idx ? null : idx));
  };

  return {
    payload,
    recordsData,
    recordsStatus,
    expandedIndex,
    toggleRow,
    populateForm,
    putRecord,
    deleteRecord,
    setPayload,
    getRecords,
    createRecord,
    handleInputChange,
    handleItemsChange,
  };
};

export default useRecordsLogic;
