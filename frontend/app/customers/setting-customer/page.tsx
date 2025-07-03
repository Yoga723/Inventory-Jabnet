"use client";
import React, { useEffect } from "react";
import Header from "components/Header";
import { PlusIcon } from "@heroicons/react/24/solid";
import Loading from "components/Loading";
import AlertModal from "components/modals/AlertModal";
import usePaketLogic from "app/hooks/customers/usePaketLogic";
import PaketTable from "components/customers/paketInternet/PaketTable";
import PaketForm from "components/customers/paketInternet/PaketFormModal";

const PaketPage = () => {
  const {
    paket,
    status,
    error,
    showFormModal,
    showAlert,
    pendingAction,
    formData,
    handleInputChange,
    handleSubmit,
    handleDelete,
    setShowFormModal,
    handleConfirmation,
    handleCancel,
    openFormModal,
  } = usePaketLogic();

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
      <main className="flex flex-col container mx-auto px-4 gap-4 py-8">
        {error && (
          <div className="alert alert-error shadow-lg my-4">
            <div>
              <span>Error: {error}</span>
            </div>
          </div>
        )}

        <section className="collapse collapse-arrow bg-base-100 border border-base-300">
          <input
            type="radio"
            name="paket-customer-accordion"
            defaultChecked
          />
          <div className="collapse collapse-title">
            <h1 className="text-3xl font-bold">List Paket</h1>
          </div>
          <div className="collapse-content">
            <button
              onClick={() => openFormModal(null)}
              className="btn btn-primary my-5">
              <PlusIcon className="h-5 w-5 mr-1.5" />
              Tambah Paket Baru
            </button>
 
            <PaketTable
              pakets={paket}
              onEdit={(paket) => openFormModal(paket)}
              onDelete={(id) => handleDelete(id)}
            />

            <PaketForm
              isOpen={showFormModal}
              formData={formData}
              onClose={() => setShowFormModal(false)}
              onSubmit={handleSubmit}
              onChange={handleInputChange}
            />
          </div>
        </section>

        <section className="collapse collapse-arrow bg-base-100 border border-base-300">
          <input
            type="radio"
            name="mitra-customer-accordion"
            defaultChecked
          />
          <div className="collapse collapse-title">
            <h1 className="text-3xl font-bold">List Mitra</h1>
          </div>
          <div className="collapse-content">
            <button
              onClick={() => openFormModal(null)}
              className="btn btn-primary my-5">
              <PlusIcon className="h-5 w-5 mr-1.5" />
              Tambah Paket Baru
            </button>

            <PaketTable
              pakets={paket}
              onEdit={(paket) => openFormModal(paket)}
              onDelete={(id) => handleDelete(id)}
            />

            <PaketForm
              isOpen={showFormModal}
              formData={formData}
              onClose={() => setShowFormModal(false)}
              onSubmit={handleSubmit}
              onChange={handleInputChange}
            />
          </div>
        </section>

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

export default PaketPage;
