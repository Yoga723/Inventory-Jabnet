"use client";

import { useState } from "react";
import { list_barang_props, recordsProp } from "../../types";

const useRecordsLogic = () => {
  const [recordsData, setRecordsData] = useState<recordsProp[]>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<recordsProp>({
    nama: "",
    status: "Masuk",
    lokasi: "",
    list_barang: [{ nama_barang: "", qty: 1 }],
    nilai: 0,
    tanggal: new Date().toISOString(),
    keterangan: "",
  });

  const getRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://inventory.jabnet.id/api/records", {
        method: "GET",
        headers: { "Content-type": "application/json" },
      });
      const response = await res.json();
      setRecordsData(response.data);
    } catch (error) {
      console.error("Error fetching records:", error);
      setError(error.message);
      return { data: [] };
    } finally {
      setLoading(false);
    }
  };

  // Functions untuk isi input form saat user click tombol edit
  const populateForm = async (recordId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`http://inventory.jabnet.id/api/records/${recordId}`, {
        method: "GET",
        headers: { "Content-type": "application/json" },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const response = await res.json();
      if (response.data) {
        setPayload({
          nama: response.data.nama || "",
          status: response.data.status || "Masuk",
          lokasi: response.data.lokasi || "",
          list_barang: response.data.list_barang || [{ nama_barang: "", qty: 1 }],
          nilai: response.data.nilai || 0,
          tanggal: response.data.tanggal || new Date().toISOString(),
          keterangan: response.data.keterangan || "",
        });
      }
    } catch (err) {
      console.error("Error populating form:", err);
      setError("Failed to load record data");
    } finally {
      setLoading(false);
    }
  };

  // Functions untuk handle input dan forms POST, UPDATE/PUT, DELETE

  const putRecord = async (event: React.FormEvent, recordId: number) => {
    event.preventDefault();
    if (!confirm("Yakin ingin update data ini ?")) return;

    setLoading(true);
    try {
      if (!validatePayload()) return;

      const dataToSend = {
        ...payload,
        list_barang: JSON.stringify(payload.list_barang),
      };
      console.log(dataToSend);

      const res = await fetch(`http://inventory.jabnet.id/api/records/${recordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) throw new Error("Gagal update data !!");
      await getRecords(); // Ke diganti
      return await res.json();
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      const dismissForm = document.getElementById("dismiss-record-modal");
      if (dismissForm) (dismissForm as HTMLElement).click();
      setLoading(false);
    }
  };

  const removeRecord = async (recordId: number) => {
    if (!confirm(`Yakin ingin hapus data ini ?`)) return;
    try {
      setLoading(true);
      const res = await fetch(`http://inventory.jabnet.id/api/records/${recordId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal Hapus data, Coba lagi nanti !");
      await getRecords();
      return await res.json();
    } catch (error) {
      console.error("Error populating form:", error);
      setError("Failed to load record data");
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (confirm("Yakin ? 👉👈") !== true) return;

    setLoading(true);
    try {
      if (!validatePayload()) return;

      const dataToSend = {
        ...payload,
        list_barang: JSON.stringify(payload.list_barang),
      };

      const res = await fetch("http://inventory.jabnet.id/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) throw new Error("Gagal tambah data !!");
      await getRecords(); // Ke diganti
      return await res.json();
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      const dismissForm = document.getElementById("dismiss-record-modal");
      if (dismissForm) (dismissForm as HTMLElement).click();
      setLoading(false);
    }
  };

  // Update useState saat user isi input
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
    recordsData,
    setRecordsData,
    populateForm,
    putRecord,
    removeRecord,
    setPayload,
    getRecords,
    createRecord,
    handleInputChange,
    handleItemsChange,
  };
};

export default useRecordsLogic;
