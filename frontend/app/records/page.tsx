import React from "react";
import Header from "../../components/Header";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import FormRecords from "../../components/records/FormRecords";
import Image from "next/image";
import RecordTable from "../../components/records/RecordTable";
import UtilityBar from "../../components/UtilityBar";
// import "./style.css";

const RecordsPage = () => {
  return (
    <>
      <Header />
      <main className="overflow-x-auto min-h-screen antialiased md:px-12 mt-20">
        {/* Utility (Search, Filter, and Tambah button) */}
        <UtilityBar />
        <RecordTable />
      </main>
    </>
  );
};

export default RecordsPage;
