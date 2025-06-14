"use client";

import { ModalAction } from "components/modals/AlertModal";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "store/Hooks";
import {
  createItem,
  fetchItem,
  fetchCategories,
  updateItem,
  deleteItem,
  updateCategory,
  createCategory,
  deleteCategory,
} from "store/inventorySlice";
import { Item, Kategori } from "types";

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
  const [formType, setFormType] = useState<"item" | "category">("item");
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

  const [formData, setFormData] = useState<{
    item_id?: number;
    item_name?: string;
    kategori_id?: number;
    nama_kategori?: string;
  }>({});

  // Update form data when categories load
  useEffect(() => {
    if (categories.length > 0 && !formData.kategori_id) {
      setFormData((prev) => ({
        ...prev,
        kategori_id: categories[0].kategori_id,
      }));
    }
  }, [categories]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: name === "kategori_id" ? parseInt(value) : value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (formType === "item") {
      if (!formData.item_name?.trim()) return alert("Nama barang harus diisi");
      try {
        if (formData.item_id)
          await dispatch(
            updateItem({
              id: formData.item_id,
              item: { item_name: formData.item_name, kategori_id: formData.kategori_id! },
            })
          );
        else
          await dispatch(
            createItem({
              item_name: formData.item_name,
              kategori_id: formData.kategori_id || categories[0]?.kategori_id || 0,
            })
          );
        setShowFormModal(false);
      } catch (error) {
        console.error("Error saving item:", error);
      }
    } else {
      // category
      if (!formData.nama_kategori?.trim()) return alert("Nama kategori harus diisi");
      try {
        if (formData.kategori_id)
          await dispatch(
            updateCategory({ id: formData.kategori_id, category: { nama_kategori: formData.nama_kategori } })
          );
        else await dispatch(createCategory({ nama_kategori: formData.nama_kategori }));
        setShowFormModal(false);
      } catch (error) {
        console.error("Error saving category:", error);
      }
    }
  };

  const handleDelete = (id: number, type: "item" | "category") => {
    setPendingAction({
      type: "delete",
      handler: async () => {
        if (type === "item") {
          await dispatch(deleteItem(id));
        } else {
          await dispatch(deleteCategory(id));
        }
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

  const openFormModal = (type: "item" | "category", data: Item | Kategori | null = null) => {
    setFormType(type);
    if (data) {
      if (type === "item") {
        const itemData = data as Item;
        setFormData({
          item_id: itemData.item_id,
          item_name: itemData.item_name,
          kategori_id: itemData.kategori_id,
        });
      } else {
        const categoryData = data as Kategori;
        setFormData({
          kategori_id: categoryData.kategori_id,
          nama_kategori: categoryData.nama_kategori,
        });
      }
    } else {
      if (type === "item") {
        setFormData({
          item_name: "",
          kategori_id: categories[0]?.kategori_id || 0,
        });
      } else {
        setFormData({
          nama_kategori: "",
        });
      }
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
    formType,
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
