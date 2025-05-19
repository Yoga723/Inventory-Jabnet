import React from "react";
import Header from "../../components/Header";
import RecordTable from "../../components/records/RecordTable";
import UtilityBar from "../../components/records/UtilityBar";
import "./style.css";

const RecordsPage = () => {
  return (
    <>
      <Header />
      <main className="md:px-8 px-2 pb-28 overflow-hidden bg-base-200 h-full max-w-screen">
        {/* Utility (Search, Filter, and Tambah button) */}
        <UtilityBar />
        <RecordTable />
      </main>
    </>
  );
};

export default RecordsPage;
