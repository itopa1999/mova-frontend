import {
  ArrowUpRight,
  MoreVertical,
} from 'lucide-react'

import { useTheme } from '../../hooks/useTheme'
import {
  colors,
  darkColors,
} from '../../styles/tokens'

import ProgressBar from '../ui/ProgressBar'
import WalletIcon from './WalletIcon'

interface WalletCardProps {
  name: string
  targetAmount: number
  controlledAmount: number
  releasedAmount: number
  releaseAmount?: number
  releaseLabel?: string
  onClick?: () => void
  onMenuClick?: () => void
}

function formatAmount(
  amount: number,
): string {
  return `₦${amount.toLocaleString('en-NG')}`
}

export default function WalletCard({
  name,
  targetAmount,
  controlledAmount,
  releasedAmount,
  releaseAmount,
  releaseLabel,
  onClick,
  onMenuClick,
}: WalletCardProps) {
  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  return (
    <div
      className="rounded-[18px] border p-4"
      style={{
        backgroundColor:
          themeColors.card,
        borderColor:
          themeColors.border,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onClick}
          className="flex min-w-0 items-center gap-3 text-left"
        >
          <WalletIcon />

          <div className="min-w-0">
            <h3
              className="truncate text-[15px] font-semibold"
              style={{
                color:
                  themeColors.charcoal,
              }}
            >
              {name}
            </h3>

            <p
              className="mt-0.5 text-[12px]"
              style={{
                color:
                  themeColors.mid,
              }}
            >
              Target {formatAmount(targetAmount)}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-70"
          style={{
            color:
              themeColors.mid,
          }}
          aria-label={`More options for ${name}`}
        >
          <MoreVertical
            size={19}
            strokeWidth={1.8}
          />
        </button>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <p
              className="text-[11px]"
              style={{
                color:
                  themeColors.mid,
              }}
            >
              Controlled
            </p>

            <p
              className="amount mt-0.5 text-[20px] font-semibold"
              style={{
                color:
                  themeColors.charcoal,
              }}
            >
              {formatAmount(
                controlledAmount,
              )}
            </p>
          </div>

          <div className="text-right">
            <p
              className="text-[11px]"
              style={{
                color:
                  themeColors.mid,
              }}
            >
              Released
            </p>

            <p
              className="amount mt-0.5 text-[13px] font-medium"
              style={{
                color:
                  themeColors.green,
              }}
            >
              {formatAmount(
                releasedAmount,
              )}
            </p>
          </div>
        </div>

        <ProgressBar
          value={controlledAmount}
          max={targetAmount}
        />
      </div>

      {(releaseAmount !== undefined ||
        releaseLabel) && (
        <div
          className="mt-4 flex items-center justify-between rounded-[14px] px-3 py-2.5"
          style={{
            backgroundColor:
              themeColors.background,
          }}
        >
          <div>
            <p
              className="text-[11px]"
              style={{
                color:
                  themeColors.mid,
              }}
            >
              {releaseLabel ??
                'Next release'}
            </p>

            {releaseAmount !==
              undefined && (
              <p
                className="amount mt-0.5 text-[14px] font-semibold"
                style={{
                  color:
                    themeColors.charcoal,
                }}
              >
                {formatAmount(
                  releaseAmount,
                )}
              </p>
            )}
          </div>

          <ArrowUpRight
            size={17}
            strokeWidth={1.9}
            style={{
              color:
                themeColors.green,
            }}
          />
        </div>
      )}
    </div>
  )
}