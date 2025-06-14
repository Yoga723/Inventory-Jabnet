// customers/page.tsx
"use client";
import React, { useEffect } from "react";
import Header from "components/Header";
import { PlusIcon } from "@heroicons/react/24/solid";
import Loading from "components/Loading";
import AlertModal from "components/modals/AlertModal";
import CustomerTable from "components/customers/CustomerTable";
import { useAppDispatch, useAppSelector } from "store/Hooks";
import { fetchCustomers } from "store/customersSlice";
import UtilBar from "components/customers/UtilBar";

const CustomerPage = () => {
  const dispatch = useAppDispatch();
  const selector = useAppSelector((state) => state.customers); // PILIH STATE CUSTOMERS

  const { currentPage, customers, status, hasMore, error, totalCustomers } = selector;

  // if (status === "loading") {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <Loading />
  //     </div>
  //   );
  // }

  useEffect(() => {
    if (customers.length == 0) dispatch(fetchCustomers({ page: 1 }));
  }, [dispatch, customers.length]);

  const handleLoadMore = () => {
    if (status != "loading" && hasMore) {
      dispatch(fetchCustomers({ page: currentPage + 1 }));
    }
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
          {/* <button
            onClick={() => openFormModal()}
            className="btn btn-primary">
            <PlusIcon className="h-5 w-5 mr-1.5" />
            Tambah Customer Baru
          </button> */}
        </div>
        <UtilBar/>
        <CustomerTable />
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
