"use client";

import { useState } from "react";
import { list_barang_props, recordsProp } from "../../types";

const useRecordsLogic = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<recordsProp>({
    nama: "",
    status: "Masuk",
    lokasi: "",
    list_barang: [{ nama_barang: "", qty: 1 }],
    nilai: "",
    tanggal: new Date().toISOString(),
    keterangan: "",
  });

  const getRecords = async (record_id?) => {
    try {
      const res = await fetch("http://inventory.jabnet.id/api/records", {
        method: "GET",
        headers: { "Content-type": "application/json" },
      });
      return await res.json();
    } catch (error) {
      console.error("Error fetching records:", error);
      setError(error.message);
      return { data: [] };
    }
  };

  const createRecord = async (event: any) => {
    event.preventDefault();
    if (confirm("Yakin ? 👉👈") != true) return;
    setLoading(true);
    try {
      if (!validatePayload()) return;

      const normalized = payload.nilai.replace(/[^0-9]/g, "");
      const numberedNilai = Number(normalized);
      const roundedNilai = Math.round(numberedNilai * 100) / 100;

      const dataToSend = {
        ...payload,
        nilai: roundedNilai.toString().trim(),
        list_barang: JSON.stringify(payload.list_barang),
      };

      console.log("Ini dataToSend : ", dataToSend);

      const res = await fetch("http://inventory.jabnet.id/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) throw new Error(`POST failed: ${res.status}`);
      setLoading(false);
      // Close modal
      const dismissButton = document.getElementById("dismiss-record-modal");
      if (dismissButton) (dismissButton as HTMLElement).click();
      return await res.json();
    } catch (e: any) {
      setLoading(false);
      console.error("Error creating record:", e);
      setError(e.message);
      throw e;
    }
  };

  const handleInputChange = (field: keyof recordsProp, value: any) => {
    setPayload((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handler khusus list barang
  const handleItemsChange = (items: list_barang_props[]) => {
    handleInputChange("list_barang", items);
  };

  const validatePayload = () => {
    if (!payload.nama.trim()) return alert("Nami di isian hela a 😅");

    if (!payload.lokasi.trim()) return alert("Lokasina di isi oga a 🤪");

    if (payload.list_barang.some((item) => !item.nama_barang.trim() || item.qty < 1))
      return alert("CEK HELA ATUH EYYY LIST BARANGNA 😇");

    return true;
  };

  return {
    payload,
    error,
    loading,
    setPayload,
    getRecords,
    createRecord,
    handleInputChange,
    handleItemsChange,
  };
};

export default useRecordsLogic;
