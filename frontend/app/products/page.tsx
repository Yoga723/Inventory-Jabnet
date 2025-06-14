"use client";
import React, { useEffect } from "react";
import Header from "components/Header";
import { PlusIcon } from "@heroicons/react/24/solid";
import Loading from "components/Loading";
import AlertModal from "components/modals/AlertModal";
import useProductsLogic from "app/hooks/useProductsLogic";
import ProductsForm from "components/products/ProductsFormModal";
import ProductsTable from "components/products/ItemTable";
import CategoryTable from "components/products/CategoryTable";

const ProductsPage = () => {
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
  } = useProductsLogic();

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
        <h1 className="text-3xl font-bold">List Barang</h1>
        <button
          onClick={() => openFormModal()}
          className="btn btn-primary my-5">
          <PlusIcon className="h-5 w-5 mr-1.5" />
          Tambah Barang Baru
        </button>

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

        <ProductsTable
          items={items}
          categories={categories}
          onEdit={openFormModal}
          onDelete={handleDelete}
        />

        <ProductsForm
          isOpen={showFormModal}
          item={null}
          categories={categories}
          formData={formData}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleSubmit}
          onChange={handleInputChange}
        />

        <h1 className="text-3xl font-bold mt-16">List Kategori</h1>
        <button
          onClick={() => openFormModal()}
          className="btn btn-primary my-5">
          <PlusIcon className="h-5 w-5 mr-1.5" />
          Tambah Kategori Baru
        </button>

        <CategoryTable
          categories={categories}
          onEdit={openFormModal}
          onDelete={handleDelete}
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

export default ProductsPage;
