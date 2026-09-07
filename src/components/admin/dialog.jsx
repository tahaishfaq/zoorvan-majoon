"use client";
import { useEffect, useRef } from "react";
export default function Dialog({ children, onClose, label }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="edit-dialog"
      aria-label={label}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === ref.current) {
          const box = ref.current.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            onClose();
        }
      }}
    >
      {children}
    </dialog>
  );
}
