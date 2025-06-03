"use client";
import React from "react";

export type ModalAction = "submit" | "delete" | "info";
type ButtonStyle = "success" | "error" | "info";
interface AlertModalProps {
  isOpen: boolean;
  content: string;
  action?: ModalAction;
  primaryBtnStyle?: ButtonStyle;
  onConfirm: () => void;
  onCancel: () => void;
}

const AlertModal = ({
  isOpen,
  content,
  action = "info",
  primaryBtnStyle = "success",
  onConfirm,
  onCancel,
}: AlertModalProps) => {
  if (!isOpen) return null;
  return (
    <dialog
      open={isOpen}
      className="modal modal-bottom sm:modal-middle z-[1000]">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{content}</h3>
        <div className="modal-action">
          <form
            method="dialog"
            className="flex gap-4">
            {action !== "info" && (
              <button
                className={`btn btn-${primaryBtnStyle}`}
                onClick={onConfirm}>
                {action === "submit" ? "Submit" : "Delete"}
              </button>
            )}
            <button
              className={`btn ${action === "info" ? "btn-primary" : "btn-ghost"}`}
              onClick={action === "info" ? onConfirm : onCancel}>
              {action === "info" ? "OK" : "Cancel"}
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default AlertModal;
