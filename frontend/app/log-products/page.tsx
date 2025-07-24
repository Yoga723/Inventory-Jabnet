"use client"
import React, { useEffect } from "react";
import Header from "../../components/Header";
import ProductTable from "../../components/log-products/ProductTable";
import UtilityBar from "../../components/log-products/UtilityBar";
import "./style.css";
import { fetchLogProductsThunk } from "store/inventory/logProductsSlice";
import { useAppDispatch, useAppSelector } from "store/Hooks";
import Pagination from "components/Pagination";

const RecordsPage = () => {
  const dispatch = useAppDispatch();
  const { currentPage, totalPages } = useAppSelector((state) => state.productsLog);

  useEffect(() => {
    dispatch(fetchLogProductsThunk({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handlePageChange = (page: number) => {
    dispatch(fetchLogProductsThunk({ page, limit: 20 }));
  };

  return (
    <>
      <Header />
      <main className="md:px-8 px-2 pb-28 overflow-hidden bg-base-200 h-full max-w-screen">
        {/* Utility (Search, Filter, and Tambah button) */}
        <h1 className="text-3xl font-bold">Database Inventory</h1>
        <UtilityBar />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        <ProductTable />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </main>
    </>
  );
};

export default RecordsPage;
