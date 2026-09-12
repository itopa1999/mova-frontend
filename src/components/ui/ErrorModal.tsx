import { AlertCircle, X } from 'lucide-react';
import { colors, darkColors } from '../../styles/tokens';
import { useTheme } from '../../hooks/useTheme';

interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  supportNumber?: string;
  onClose: () => void;
}

export default function ErrorModal({
  isOpen,
  message,
  supportNumber = '+234 800 000 0000',
  onClose,
}: ErrorModalProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-[20px] p-6 shadow-xl relative"
        style={{ backgroundColor: themeColors.background }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 transition-opacity hover:opacity-70"
          style={{ color: themeColors.mid }}
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: themeColors.redBackground }}
          >
            <AlertCircle size={32} style={{ color: themeColors.red }} />
          </div>

          <h2
            className="mb-2 text-xl font-bold"
            style={{ color: themeColors.charcoal }}
          >
            Something went wrong
          </h2>

          <p
            className="mb-6 text-sm leading-relaxed"
            style={{ color: themeColors.mid }}
          >
            {message}
          </p>

          <div
            className="mb-6 rounded-[12px] px-4 py-3"
            style={{ backgroundColor: themeColors.background }}
          >
            <p className="text-xs" style={{ color: themeColors.mid }}>
              Contact our support team:
            </p>
            <p
              className="text-sm font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              {supportNumber}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-[14px] px-4 py-3 font-semibold transition-opacity hover:opacity-80"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            Okay, got it
          </button>
        </div>
      </div>
    </div>
  );
}