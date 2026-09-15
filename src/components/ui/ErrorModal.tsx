import { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';
import { colors, darkColors } from '../../styles/tokens';
import { useTheme } from '../../hooks/useTheme';

interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  supportNumber?: string;
  title?: string;
  variant?: 'error' | 'rateLimit';
  retryAfterSeconds?: number;
  onClose: () => void;
}

export default function ErrorModal({
  isOpen,
  message,
  supportNumber = '+234 800 000 0000',
  title,
  variant = 'error',
  retryAfterSeconds,
  onClose,
}: ErrorModalProps) {
  const { isDark } = useTheme();
  const themeColors = isDark ? darkColors : colors;

  const isRateLimit = variant === 'rateLimit';
  const [remaining, setRemaining] = useState(retryAfterSeconds ?? 0);

  // Reset countdown whenever the modal opens with a new value
  useEffect(() => {
    if (isOpen && isRateLimit) {
      setRemaining(retryAfterSeconds ?? 60);
    }
  }, [isOpen, isRateLimit, retryAfterSeconds]);

  // Tick down while open
  useEffect(() => {
    if (!isOpen || !isRateLimit) return;
    if (remaining <= 0) return;

    const timer = setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isRateLimit, remaining]);

  if (!isOpen) return null;

  const isReady = !isRateLimit || remaining <= 0;

  const displayTitle =
    title ??
    (isRateLimit ? "You're going a bit fast" : 'Something went wrong');

  const accentColor = isRateLimit ? '#F59E0B' : themeColors.red;
  const accentBg = isRateLimit
    ? isDark
      ? 'rgba(245, 158, 11, 0.15)'
      : 'rgba(245, 158, 11, 0.1)'
    : themeColors.redBackground;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-[20px] p-6 shadow-xl"
        style={{ backgroundColor: themeColors.background }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 transition-opacity hover:opacity-70"
          style={{ color: themeColors.mid }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          {/* Icon */}
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: accentBg }}
          >
            {isRateLimit ? (
              <AlertTriangle size={32} style={{ color: accentColor }} />
            ) : (
              <AlertCircle size={32} style={{ color: accentColor }} />
            )}
          </div>

          {/* Title */}
          <h2
            className="mb-2 text-xl font-bold"
            style={{ color: themeColors.charcoal }}
          >
            {displayTitle}
          </h2>

          {/* Message */}
          <p
            className="mb-6 text-sm leading-relaxed"
            style={{ color: themeColors.mid }}
          >
            {message}
          </p>

          {/* Rate limit countdown */}
          {isRateLimit && (
            <div
              className="mb-6 rounded-[12px] px-4 py-3"
              style={{
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.04)'
                  : '#F9FAFB',
              }}
            >
              {isReady ? (
                <p
                  className="text-sm font-semibold"
                  style={{ color: themeColors.green }}
                >
                  You can try again now
                </p>
              ) : (
                <>
                  <p
                    className="text-[11px] uppercase tracking-wider"
                    style={{ color: themeColors.mid }}
                  >
                    Try again in
                  </p>
                  <p
                    className="mt-1 text-2xl font-bold"
                    style={{
                      color: themeColors.charcoal,
                      fontFamily:
                        "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    {formatCountdown(remaining)}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Support number — only for the 500 variant */}
          {!isRateLimit && supportNumber && (
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
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {isRateLimit && !isReady && (
              <button
                onClick={onClose}
                className="flex-1 rounded-[14px] border px-4 py-3 font-semibold transition-opacity hover:opacity-80"
                style={{
                  borderColor: themeColors.border,
                  backgroundColor: 'transparent',
                  color: themeColors.charcoal,
                }}
              >
                Close
              </button>
            )}

            <button
              onClick={onClose}
              disabled={!isReady}
              className="flex-1 rounded-[14px] px-4 py-3 font-semibold transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: isReady
                  ? themeColors.green
                  : themeColors.border,
                color: isReady ? '#FFFFFF' : themeColors.mid,
              }}
            >
              {isRateLimit
                ? isReady
                  ? 'Try Again'
                  : 'Please wait'
                : 'Okay, got it'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '0s';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
}