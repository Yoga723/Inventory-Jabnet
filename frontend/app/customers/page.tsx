// customers/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import Header from "components/Header";
import { PlusIcon } from "@heroicons/react/24/solid";
import Loading from "components/Loading";
import AlertModal from "components/modals/AlertModal";
import CustomerTable from "components/customers/CustomerTable";
import { useAppDispatch, useAppSelector } from "store/Hooks";
import { createCustomer, fetchCustomers, updateCustomer } from "store/customersSlice";
import UtilBar from "components/customers/UtilBar";
import { Customers } from "types";
import CustomerFormModal from "components/customers/CustomerFormModal";

const CustomerPage = () => {
  const dispatch = useAppDispatch();
  const { customers, status, hasMore, error, totalCustomers, currentPage } = useAppSelector((state) => state.customers);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerData, setCustomerData] = useState<Partial<Customers> | null>(null);

  useEffect(() => {
    if (status === "idle") dispatch(fetchCustomers({ page: 1 }));
  }, [dispatch, status]);

  const handleLoadMore = () => {
    if (status !== "loading" && hasMore) {
      dispatch(fetchCustomers({ page: currentPage + 1 }));
    }
  };

  const handleOpenModal = (customer: Customers | null) => {
    setCustomerData(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCustomerData(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerData) {
      if (customerData.id) {
        dispatch(updateCustomer(customerData as Customers));
      } else {
        dispatch(createCustomer(customerData as Omit<Customers, "id">));
      }
    }
    handleCloseModal();
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-2 py-8">
        <div className="max-sm:w-full w-fit h-fit mb-4 p-6 rounded-lg bg-base-300">
          <p className="w-fit">Total Pelanggan : {totalCustomers}</p>
        </div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">List Pelanggan</h1>
        </div>
        <UtilBar onAdd={() => handleOpenModal(null)} />
        <CustomerTable onEdit={handleOpenModal} />
        {/* {status === "loading" && (
          <div className="flex justify-center">
            <Loading />
          </div>
        )} */}
        {hasMore && status !== "loading" && (
          <div className="text-center mt-4 pb-10">
            <button
              onClick={handleLoadMore}
              className="btn btn-primary">
              Load More
            </button>
          </div>
        )}
        <CustomerFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          customerData={customerData}
          setCustomerData={setCustomerData}
        />
        {error && (
          <div className="alert alert-error shadow-lg my-4">
            <div>
              <span>Error: {error}</span>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default CustomerPage;
