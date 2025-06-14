"use client";

import { ModalAction } from "components/modals/AlertModal";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "store/Hooks";
import { createItem, fetchItem, fetchCategories, updateItem, deleteItem } from "store/inventorySlice";

const useProductsLogic = () => {
  const dispatch = useAppDispatch();
  const { categories, items, status, error } = useAppSelector((state) => state.inventory);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: ModalAction;
    handler: () => Promise<void>;
    itemId?: number;
  } | null>(null);
  const [editItem, setEditItem] = useState<{
    item_id?: number;
    item_name: string;
    kategori_id: number;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCategories());
      dispatch(fetchItem());
    }
  }, [dispatch, status]);

  // Safely handle filtered items
  const filteredItems = (items || []).filter((item) => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.kategori_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Form state
  const [formData, setFormData] = useState<{ item_id?: number; item_name: string; kategori_id: number }>({
    item_name: "",
    kategori_id: categories[0]?.kategori_id || 0,
  });

  // Update form data when categories load
  useEffect(() => {
    if (categories.length > 0 && !formData.kategori_id) {
      setFormData((prev) => ({
        ...prev,
        kategori_id: categories[0].kategori_id,
      }));
    }
    console.log("THIS IS CATEGORY :", categories);
  }, [categories]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: name === "kategori_id" ? parseInt(value) : value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.item_name.trim()) return alert("Nama barang harus diisi");

    try {
      if (formData.item_id) await dispatch(updateItem({ id: formData.item_id!, item: formData }));
      else await dispatch(createItem(formData));

      setShowFormModal(false);
      setEditItem(null);
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleDelete = (itemId: number) => {
    setPendingAction({
      type: "delete",
      handler: async () => {
        await dispatch(deleteItem(itemId));
        setShowAlert(false);
      },
      itemId,
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

  const openFormModal = (item: any = null) => {
    setEditItem(item);
    if (item) {
      setFormData({
        item_id: item.item_id,
        item_name: item.item_name,
        kategori_id: item.kategori_id,
      });
    } else {
      setFormData({
        item_name: "",
        kategori_id: categories[0]?.kategori_id || 0,
      });
    }
    setShowFormModal(true);
  };

  return {
    categories,
    items: filteredItems,
    status,
    error,
    showFormModal,
    setShowFormModal,
    showAlert,
    setShowAlert,
    pendingAction,
    formData,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    handleInputChange,
    handleSubmit,
    handleDelete,
    handleConfirmation,
    handleCancel,
    openFormModal,
  };
};

export default useProductsLogic;
