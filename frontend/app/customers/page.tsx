// customers/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Header from "components/Header";
import { PlusIcon } from "@heroicons/react/24/solid";
import Loading from "components/Loading";
import AlertModal from "components/modals/AlertModal";
import CustomerTable from "components/customers/CustomerTable";
import { useAppDispatch, useAppSelector } from "store/Hooks";
import { createCustomer, deleteCustomer, fetchCustomers, updateCustomer } from "store/customersSlice";
import UtilBar from "components/customers/UtilBar";
import { Customers } from "types";
import CustomerFormModal from "components/customers/CustomerFormModal";
import Pagination from "components/customers/Pagination";
import { fetchMitra, fetchPaket } from "store/filterCustomerSlice";

const CustomerPage = () => {
  const dispatch = useAppDispatch();
  const { customers, status, hasMore, error, totalCustomers, currentPage } = useAppSelector((state) => state.customers);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerData, setCustomerData] = useState<Partial<Customers> | null>(null);
  const limit = 20;
  const totalPages = Math.ceil(totalCustomers / limit);
  const [originalIdForEdit, setOriginalIdForEdit] = useState<number | null>(null);
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

  // const handlePageChange = (page: number) => {
  //   if (page > 0 && page <= totalPages) {
  //     dispatch(fetchCustomers({ page, limit }));
  //   }
  // };

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
    // Fetch filter data if it hasn't been fetched yet
    if (filtersStatus === "idle") {
      dispatch(fetchPaket());
      dispatch(fetchMitra());
    }
    setIsFilterModalOpen(true);
  };

  const handleOpenModal = (customer: Customers | null) => {
    setCustomerData(customer);
    setOriginalIdForEdit(customer ? parseInt(customer.id) : null);
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
        {error && (
          <div className="alert alert-error shadow-lg my-4">
            <div>
              <span>Error: {error}</span>
            </div>
          </div>
        )}
        <CustomerTable
          onEdit={handleOpenModal}
          onDelete={handleDeleteRequest}
        />{" "}
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
        <AlertModal
          isOpen={isAlertOpen}
          content="Yakin ingin menghapus pelanggan ini?"
          action="delete"
          primaryBtnStyle="error"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </main>
    </>
  );
};

export default CustomerPage;
