import { useEffect } from "react";

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  buttonText?: string;
  type?: "error" | "success" | "info";
  onClose: () => void;
}

export default function AlertDialog({
  isOpen,
  title,
  message,
  buttonText = "OK",
  type = "info",
  onClose,
}: AlertDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "error":
        return (
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--muted)] mb-4">
            <svg className="w-6 h-6 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        );
      case "success":
        return (
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--muted)] mb-4">
            <svg className="w-6 h-6 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--muted)] mb-4">
            <svg className="w-6 h-6 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-[var(--card-bg)] rounded-2xl shadow-elevated max-w-sm w-full text-center animate-scaleIn border border-[var(--card-border)]">
        <div className="p-8">
          {getIcon()}
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{title}</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{message}</p>

          <button onClick={onClose} className="btn-primary w-full mt-8">
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
