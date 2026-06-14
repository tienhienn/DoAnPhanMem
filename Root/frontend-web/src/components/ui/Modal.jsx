import { useEffect, useRef } from "react";

/**
 * Modal component - hộp thoại xác nhận tái sử dụng
 *
 * Props:
 * - isOpen: boolean
 * - title: string
 * - message: string
 * - confirmLabel: string
 * - cancelLabel: string
 * - onConfirm: () => void
 * - onCancel: () => void
 * - variant: "default" | "danger"
 */

export default function Modal({
  isOpen,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  onConfirm,
  onCancel,
  variant = "default",
}) {
  const dialogRef = useRef(null);

  // Trap focus and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmButtonStyles =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white"
      : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        className="
          relative z-10
          bg-white rounded-2xl shadow-xl
          w-full max-w-md
          p-6
          animate-in fade-in zoom-in-95 duration-200
        "
      >
        {/* Title */}
        <h2
          id="modal-title"
          className="text-lg font-semibold text-gray-900 mb-2"
        >
          {title}
        </h2>

        {/* Message */}
        {message && (
          <p className="text-sm text-gray-600 mb-6">{message}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="
              px-4 py-2 rounded-lg text-sm font-medium
              text-gray-700 bg-gray-100 hover:bg-gray-200
              focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
              transition-colors
            "
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium
              focus:outline-none focus:ring-2 focus:ring-offset-2
              transition-colors
              ${confirmButtonStyles}
            `}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
