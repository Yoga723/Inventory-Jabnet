"use client";
import React from "react";
import Header from "components/Header";
import { PlusIcon } from "@heroicons/react/24/solid";
import Loading from "components/Loading";
import ItemTable from "components/item-managements/ItemTable";
import useInventoryManagement from "app/hooks/useInventoryManagement";
import ItemFormModal from "components/item-managements/ItemFormModal";
import AlertModal from "components/modals/AlertModal";

const ItemManagementPage = () => {
  const {
    categories,
    items,
    status,
    error,
    showFormModal,
    showAlert,
    pendingAction,
    formData,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    handleInputChange,
    handleSubmit,
    handleDelete,
    setShowFormModal,
    handleConfirmation,
    handleCancel,
    openFormModal,
  } = useInventoryManagement();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manajemen Barang</h1>
          <button
            onClick={() => openFormModal()}
            className="btn btn-primary">
            <PlusIcon className="h-5 w-5 mr-1.5" />
            Tambah Barang Baru
          </button>
        </div>

        {error && (
          <div className="alert alert-error shadow-lg my-4">
            <div>
              <span>Error: {error}</span>
            </div>
          </div>
        )}

        {/* <ItemFilter
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          categories={categories}
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
        /> */}

        <ItemTable
          items={items}
          categories={categories}
          onEdit={openFormModal}
          onDelete={handleDelete}
        />

        <ItemFormModal
          isOpen={showFormModal}
          item={null}
          categories={categories}
          formData={formData}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleSubmit}
          onChange={handleInputChange}
        />

        <AlertModal
          isOpen={showAlert}
          content="Yakin ingin menghapus barang ini?"
          action={pendingAction?.type}
          primaryBtnStyle="error"
          onConfirm={handleConfirmation}
          onCancel={handleCancel}
        />
      </main>
    </>
  );
};

export default ItemManagementPage;
