import React from "react";
import Header from "../../components/Header";
import RecordTable from "../../components/records/RecordTable";
import UtilityBar from "../../components/records/UtilityBar";
// import "./style.css";

const RecordsPage = () => {
  return (
    <>
      <Header />
      <main className="md:px-12 mt-16 overflow-auto bg-base-200 h-screen">
        {/* Utility (Search, Filter, and Tambah button) */}
        <UtilityBar />
        <RecordTable />
      </main>
    </>
  );
};

export default RecordsPage;
