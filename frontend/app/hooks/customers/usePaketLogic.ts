"use client";

import { ModalAction } from "components/modals/AlertModal";
import { useEffect, useState } from "react";
import { createPaket, deletePaket, fetchPakets, updatePaket } from "store/customers/paketSlice";
import { useAppDispatch, useAppSelector } from "store/Hooks";
import { Paket } from "types";

const usePaketLogic = () => {
  const dispatch = useAppDispatch();
  const { paket, status, error } = useAppSelector((state) => state.customerPaket);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: ModalAction;
    handler: () => Promise<void>;
  } | null>(null);
  const [formData, setFormData] = useState<Partial<Paket>>({});

  useEffect(() => {
    if (status === "idle") dispatch(fetchPakets());
  }, [dispatch, status]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.nama_paket?.trim()) return alert("Nama paket harus diisi");
    try {
      if (formData.id_paket) {
        await dispatch(
          updatePaket({
            id: formData.id_paket,
            paket: {
              nama_paket: formData.nama_paket,
              kecepatan_paket: formData.kecepatan_paket,
              harga_paket: formData.harga_paket,
              comment_paket: formData.comment_paket,
            },
          })
        );
      } else {
        await dispatch(
          createPaket({
            nama_paket: formData.nama_paket,
            kecepatan_paket: formData.kecepatan_paket,
            harga_paket: formData.harga_paket,
            comment_paket: formData.comment_paket,
          })
        );
      }
      setShowFormModal(false);
    } catch (error) {
      console.error("Error saving paket:", error);
    }
  };

  const handleDelete = (id: number) => {
    setPendingAction({
      type: "delete",
      handler: async () => {
        await dispatch(deletePaket(id));
        setShowAlert(false);
      },
    });
    setShowAlert(true);
  };

  const handleConfirmation = async () => {
    if (!pendingAction) return;
    await pendingAction.handler();
    setPendingAction(null);
  };

  const handleCancel = () => {
    setPendingAction(null);
    setShowAlert(false);
  };

  const openFormModal = (data: Paket | null = null) => {
    if (data) {
      setFormData({
        id_paket: data.id_paket,
        nama_paket: data.nama_paket,
        kecepatan_paket: data.kecepatan_paket,
        harga_paket: data.harga_paket,
        comment_paket: data.comment_paket,
      });
    } else {
      setFormData({
        nama_paket: "",
        kecepatan_paket: "",
        harga_paket: 0,
        comment_paket: "",
      });
    }
    setShowFormModal(true);
  };

  return {
    paket,
    status,
    error,
    showFormModal,
    setShowFormModal,
    showAlert,
    setShowAlert,
    pendingAction,
    formData,
    handleInputChange,
    handleSubmit,
    handleDelete,
    handleConfirmation,
    handleCancel,
    openFormModal,
  };
};

export default usePaketLogic;
