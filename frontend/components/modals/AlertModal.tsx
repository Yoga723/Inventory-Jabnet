"use client";
import useRecordsLogic from "app/hooks/useRecordsLogic";
import { useRecordsContext } from "context/records/RecordsContext";
import React, { useState } from "react";

interface AlertModalProps {
  content?: string;
  action?: string;
}

const AlertModal = ({ content }: AlertModalProps) => {
  const { isAlertOpen, closeModal, closeAlert } = useRecordsContext();
  return (
    <dialog
      id="alert-dialog"
      className={`${isAlertOpen ? "flex" : "hidden"} flex-col w-full h-full justify-center items-center z-5 gap-10`}>
      <p className="text-2xl">{content}</p>
      <div className="flex gap-5">
        <button
          className="btn btn-success btn-soft"
          type="submit">
          Submit
        </button>
        <button
          className="btn btn-error btn-soft"
          type="button"
          onClick={closeAlert}>
          Cancel
        </button>
      </div>
    </dialog>
  );
};

export default AlertModal;
