// app/records/[id]/history/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "components/Header";
// import HistoryItem from "@/app/components/records/HistoryItem";

export default function RecordHistoryPage() {
  const { id } = useParams();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`https://inventory.jabnet.id/api/records/${id}/history`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (data.status === "success") setHistory(data.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  useEffect(() => {
    console.log("this is history", history);
  }, [history]);

  return (
    <>
      <Header />
      <main className="md:px-8 px-2 pb-28 pt-5 overflow-hidden bg-base-200 h-full max-w-screen">
        <h1 className="text-2xl font-bold">History {id}</h1>

        {/* {history && (<p>{history.nama}</p>)} */}

        {loading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : history.length === 0 ? (
          <div className="alert alert-info">No history found for this record</div>
        ) : (
          <div className="space-y-4">
            {/* {history.map((item) => (
              <HistoryItem
                key={item.history_id}
                item={item}
              />
            ))} */}
          </div>
        )}
      </main>
    </>
  );
}
