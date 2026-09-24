"use client";

import { useEffect, useId, useRef } from "react";

export function ConfirmDialog({
  title,
  description,
  confirmText,
  cancelText = "继续独立思考",
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={id}
      onCancel={onCancel}
    >
      <h2 id={id}>{title}</h2>
      <p>{description}</p>
      <div className="button-row">
        <button className="button secondary" autoFocus onClick={onCancel}>
          {cancelText}
        </button>
        <button className="button primary" onClick={onConfirm}>
          {confirmText}
        </button>
      </div>
    </dialog>
  );
}
