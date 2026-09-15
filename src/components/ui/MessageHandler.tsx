// src/components/ui/MessageHandler.tsx
import { useEffect, useState } from 'react';
import ErrorModal from './ErrorModal';
import Toast, { type ToastType } from './Toast';

interface MessageHandlerProps {
  children: React.ReactNode;
}

interface ModalState {
  isOpen: boolean;
  title?: string;
  message: string;
  supportNumber?: string;
  variant?: 'error' | 'rateLimit';
  retryAfterSeconds?: number;
}

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

export function MessageHandler({ children }: MessageHandlerProps) {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    message: '',
    supportNumber: '+234 800 000 0000',
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  let toastId = 0;

  useEffect(() => {
    const handleServerError = (event: Event) => {
      const customEvent = event as CustomEvent;
      setModal({
        isOpen: true,
        variant: 'error',
        message: customEvent.detail.message || 'Something went wrong on our end. Please try again later.',
        supportNumber: customEvent.detail.supportNumber || '+234 800 000 0000',
      });
    };

    const handleRateLimitExceeded = (event: Event) => {
      const customEvent = event as CustomEvent;
      setModal({
        isOpen: true,
        variant: 'rateLimit',
        title: "You're going a bit fast",
        message:
          customEvent.detail.message ||
          'Too many requests. Please slow down and try again shortly.',
        retryAfterSeconds: customEvent.detail.retryAfterSeconds ?? 60,
      });
    };

    const handleShowToast = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newToast: ToastItem = {
        id: ++toastId,
        type: customEvent.detail.type || 'error',
        message: customEvent.detail.message,
      };
      setToasts((prev) => [...prev, newToast]);
    };

    const handleNetworkError = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newToast: ToastItem = {
        id: ++toastId,
        type: customEvent.detail.type || 'error',
        message: customEvent.detail.message || 'Network error. Please check your connection.',
      };
      setToasts((prev) => [...prev, newToast]);
    };

    window.addEventListener('serverError', handleServerError as EventListener);
    window.addEventListener('rateLimitExceeded', handleRateLimitExceeded as EventListener);
    window.addEventListener('showToast', handleShowToast as EventListener);
    window.addEventListener('networkError', handleNetworkError as EventListener);

    return () => {
      window.removeEventListener('serverError', handleServerError as EventListener);
      window.removeEventListener('rateLimitExceeded', handleRateLimitExceeded as EventListener);
      window.removeEventListener('showToast', handleShowToast as EventListener);
      window.removeEventListener('networkError', handleNetworkError as EventListener);
    };
  }, []);

  const handleCloseModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCloseToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <>
      {children}

      {/* Stacked Toasts */}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-3 px-5">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto w-full max-w-[420px]">
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => handleCloseToast(toast.id)}
              duration={5000}
            />
          </div>
        ))}
      </div>

      {/* Error / Rate-limit Modal */}
      <ErrorModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        supportNumber={modal.supportNumber}
        variant={modal.variant}
        retryAfterSeconds={modal.retryAfterSeconds}
        onClose={handleCloseModal}
      />
    </>
  );
}