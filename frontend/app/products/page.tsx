"use client";
import React, { useEffect } from "react";
import Header from "components/Header";
import { PlusIcon } from "@heroicons/react/24/solid";
import Loading from "components/Loading";
import AlertModal from "components/modals/AlertModal";
import useProductsLogic from "app/hooks/inventory/useProductsLogic";
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
    formType,
    handleInputChange,
    handleSubmit,
    handleDelete,
    setShowFormModal,
    handleConfirmation,
    handleCancel,
    openFormModal,
  } = useProductsLogic();

  if (status === "loading" || status === "idle") {
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
        {error && (
          <div className="alert alert-error shadow-lg my-4">
            <div>
              <span>Error: {error}</span>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold">List Kategori</h1>
        <button
          onClick={() => openFormModal("category")}
          className="btn btn-primary my-5">
          <PlusIcon className="h-5 w-5 mr-1.5" />
          Tambah Kategori Baru
        </button>

        <CategoryTable
          categories={categories}
          onEdit={(category) => openFormModal("category", category)}
          onDelete={(id) => handleDelete(id, "category")}
        />

        <h1 className="text-3xl font-bold">List Barang</h1>
        <button
          onClick={() => openFormModal("item")}
          className="btn btn-primary my-5">
          <PlusIcon className="h-5 w-5 mr-1.5" />
          Tambah Barang Baru
        </button>

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
          onEdit={(item) => openFormModal("item", item)}
          onDelete={(id) => handleDelete(id, "item")}
        />

        <ProductsForm
          isOpen={showFormModal}
          formType={formType}
          item={null}
          categories={categories}
          formData={formData}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleSubmit}
          onChange={handleInputChange}
        />

        <AlertModal
          isOpen={showAlert}
          content="Yakin ingin menghapus ini?"
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
