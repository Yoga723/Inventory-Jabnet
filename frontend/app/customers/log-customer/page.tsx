// customers/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Header from "components/Header";
import Loading from "components/Loading";
import AlertModal from "components/modals/AlertModal";
import CustomerTable from "components/customers/customer/CustomerTable";
import { useAppDispatch, useAppSelector } from "store/Hooks";
import { createCustomer, deleteCustomer, fetchCustomers, updateCustomer } from "store/customers/customersSlice";
import UtilBar from "components/customers/UtilBar";
import { Customers } from "types";
import CustomerFormModal from "components/customers/customer/CustomerFormModal";
import Pagination from "components/Pagination";
import { fetchMitra, fetchPaket } from "store/customers/filterCustomerSlice";
import FilterModal from "components/customers/customer/CustomerFilterModal";

const LogCustomerPage = () => {
  const dispatch = useAppDispatch();
  const { status, totalCustomers, currentPage } = useAppSelector((state) => state.customers);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerData, setCustomerData] = useState<Partial<Customers> | null>(null);
  const limit = 20;
  const totalPages = Math.ceil(totalCustomers / limit);
  const [originalIdForEdit, setOriginalIdForEdit] = useState<string | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const filtersStatus = useAppSelector((state) => state.filterCustomers.status);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    sortBy: "last_edited",
    sortOrder: "DESC",
    olt: "",
    odp: "",
    id_paket: "",
    id_mitra: "",
  });

  useEffect(() => {
    if (status === "idle") dispatch(fetchCustomers({ page: 1, limit }));
  }, [dispatch, status, limit]);

  const handleFetch = (page: number, currentSearch = searchTerm, currentFilters = activeFilters) => {
    dispatch(fetchCustomers({ page, limit, search: currentSearch, filterCustomers: currentFilters }));
  };

  const handlePageChange = (page: number) => {
    handleFetch(page);
  };

  const handleSearch = () => {
    handleFetch(1);
  };

  const handleApplyFilters = () => {
    handleFetch(1);
    setIsFilterModalOpen(false);
  };

  const handleOpenFilters = () => {
    if (filtersStatus === "idle") {
      dispatch(fetchPaket());
      dispatch(fetchMitra());
    }
    setIsFilterModalOpen(true);
  };

  const handleOpenModal = (customer: Customers | null) => {
    setCustomerData(customer);
    setOriginalIdForEdit(customer ? customer.id : null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCustomerData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customerData) {
      try {
        if (originalIdForEdit) {
          // EXECUTE KODE EDIT CUSTOMER
          await dispatch(
            updateCustomer({ originalId: originalIdForEdit, customerData: customerData as Customers })
          ).unwrap();
        } else {
          // EXECUTE KODE TAMBAH CUSTOMER
          await dispatch(createCustomer(customerData as Customers)).unwrap();
        }
        // RE-FETCH UNTUK AMBIL DATA TERBARU
        dispatch(fetchCustomers({ page: currentPage, limit }));
      } catch (err) {
        console.error("Failed to save the customer: ", err);
      }
    }
    handleCloseModal();
  };

  const handleDeleteRequest = (id: string) => {
    setCustomerToDelete(id);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (customerToDelete) {
      dispatch(deleteCustomer(customerToDelete));
    }
    setIsAlertOpen(false);
    setCustomerToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsAlertOpen(false);
    setCustomerToDelete(null);
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-2 py-8">
        <div className="max-sm:w-full w-fit h-fit mb-4 p-6 rounded-lg bg-base-300">
          <p className="w-fit">Total Pelanggan : {totalCustomers}</p>
        </div>
        <h1 className="text-3xl font-bold mb-8">List Pelanggan</h1>
        <UtilBar
          onAdd={() => handleOpenModal(null)}
          onOpenFilters={handleOpenFilters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearch}
          searchPlaceholder="Search ID, Nama, Alamat, SN, No.HP"
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        {status === "loading" && (
          <div className="flex justify-center">
            <Loading />
          </div>
        )}
        {status !== "loading" && (
          <CustomerTable
            onEdit={handleOpenModal}
            onDelete={handleDeleteRequest}
          />
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        <br />

        <CustomerFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          customerData={customerData}
          setCustomerData={setCustomerData}
        />
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filterCustomer={activeFilters}
          setFilters={setActiveFilters}
          onApply={handleApplyFilters}
        />
        <AlertModal
          isOpen={isAlertOpen}
          content="Yakin ingin menghapus pelanggan ini?"
          action="delete"
          primaryBtnStyle="error"
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsAlertOpen(false)}
        />
      </main>
    </>
  );
};

export default LogCustomerPage;
