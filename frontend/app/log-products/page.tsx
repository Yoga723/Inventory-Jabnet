import React from "react";
import Header from "../../components/Header";
import ProductTable from "../../components/records/ProductTable";
import UtilityBar from "../../components/records/UtilityBar";
import "./style.css";

const RecordsPage = () => {
  return (
    <>
      <Header />
      <main className="md:px-8 px-2 pb-28 overflow-hidden bg-base-200 h-full max-w-screen">
        {/* Utility (Search, Filter, and Tambah button) */}
        <h1 className="text-3xl font-bold">Database Inventory</h1>
        <UtilityBar />
        <ProductTable />
      </main>
    </>
  );
};

export default RecordsPage;
