import { useEffect } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-[var(--card-bg)] rounded-2xl shadow-elevated max-w-sm w-full animate-scaleIn border border-[var(--card-border)]">
        <div className="p-8">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{title}</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{message}</p>

          <div className="flex gap-3 mt-8">
            <button onClick={onCancel} className="flex-1 btn-secondary">
              {cancelText}
            </button>
            <button onClick={onConfirm} className="flex-1 btn-primary">
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
