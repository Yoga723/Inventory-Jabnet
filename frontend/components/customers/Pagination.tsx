"use client";
import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const pageNumbers = [];
  const maxPagesToShow = 5;

  let startPage: number, endPage: number;
  if (totalPages <= maxPagesToShow) {
    startPage = 1;
    endPage = totalPages;
  } else {
    if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) {
      startPage = totalPages - maxPagesToShow + 1;
      endPage = totalPages;
    } else {
      startPage = currentPage - Math.floor(maxPagesToShow / 2);
      endPage = currentPage + Math.floor(maxPagesToShow / 2);
    }
  }

  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  const handleGoToPage = () => {
    const pageString = window.prompt(`Enter page number between 1 and ${totalPages}:`);
    if (pageString) {
      const pageNumber = parseInt(pageString, 10);
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
        onPageChange(pageNumber);
      } else {
        window.alert("Invalid page number entered.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center space-x-2 my-8">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="btn btn-outline btn-secondary"
        aria-label="Go to first page">
        {"<<"}
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-outline btn-secondary">
        Prev
      </button>

      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`btn ${currentPage === number ? "btn-primary" : ""}`}>
          {number}
        </button>
      ))}
      {/* {totalPages > maxPagesToShow && (
        <button
          onClick={handleGoToPage}
          className="btn btn-ghost">
          ...
        </button>
      )} */}

      {/* Next Page Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        className="btn btn-outline btn-secondary">
        Next
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages || totalPages === 0}
        className="btn btn-outline btn-secondary"
        aria-label="Go to last page">
        {">>"}
      </button>
    </div>
  );
};

export default Pagination;
