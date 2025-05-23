"use client";

import { useCallback, useState } from "react";
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

const useRecordsLogic = () => {
  const { full_name } = useAppSelector((state) => state.user);
  const [formError, setFormError] = useState({
    inputError: { errorNama: false, errorLokasi: false, errorListBarang: false },
  });
  const dispatch = useAppDispatch();
  const {
    items: recordsData,
    currentItem: payload,
    status: recordsStatus, // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: recordsError,
  } = useAppSelector((state) => state.records);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null); // Jang row table

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
      event.preventDefault();
      if (!validatePayload) return;
      if (!confirm("Yakin ingin tambah data 👉👈 ?")) return;
      const dataToSend = {
        ...payload,
        nama: full_name,
        list_barang: JSON.stringify(payload.list_barang),
      } satisfies Omit<recordsProp, "record_id" | "tanggal" | "list_barang"> & {
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
      event.preventDefault();
      if (!validatePayload) return;
      if (!confirm("Yakin ingin update data ?")) return;
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
    [dispatch, payload]
  );

  const deleteRecord = useCallback(
    async (event: React.FormEvent, recordId: number) => {
      event.preventDefault();
      if (!confirm("Yakin hapus data ini ?")) return;
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
    const hasErrorNama = !payload.nama.trim() || payload.nama.length < 1;
    const hasErrorLokasi = !payload.lokasi.trim() || payload.lokasi.length < 1;
    const hasErrorListBarang = !payload.list_barang.some((item) => {
      !item.nama_barang.trim() || item.nama_barang.length < 1;
    });

    setFormError({
      inputError: { errorNama: hasErrorNama, errorLokasi: hasErrorLokasi, errorListBarang: hasErrorListBarang },
    });

    return false;
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
