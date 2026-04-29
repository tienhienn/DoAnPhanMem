import { useEffect, useState } from "react";

/**
 * Toast component - hiển thị thông báo tạm thời
 *
 * Props:
 * - message: string - nội dung thông báo
 * - type: "success" | "error" | "info"
 * - onClose: () => void - callback khi toast đóng
 */

const TOAST_STYLES = {
  success: {
    container: "bg-green-50 border border-green-200 text-green-800",
    icon: (
      <svg className="w-5 h-5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  error: {
    container: "bg-red-50 border border-red-200 text-red-800",
    icon: (
      <svg className="w-5 h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  info: {
    container: "bg-blue-50 border border-blue-200 text-blue-800",
    icon: (
      <svg className="w-5 h-5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

const AUTO_HIDE_DELAY = 3000;

export default function Toast({ message, type = "info", onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, AUTO_HIDE_DELAY);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  const styles = TOAST_STYLES[type] ?? TOAST_STYLES.info;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        fixed top-4 right-4 z-50
        flex items-center gap-3
        px-4 py-3 rounded-lg shadow-lg
        max-w-sm w-full
        animate-in fade-in slide-in-from-top-2 duration-300
        ${styles.container}
      `}
    >
      {styles.icon}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={() => {
          setVisible(false);
          onClose?.();
        }}
        aria-label="Đóng thông báo"
        className="shrink-0 rounded p-0.5 hover:bg-black/10 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
