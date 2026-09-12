import { useTheme } from '../../hooks/useTheme'
import {
  colors,
  darkColors,
} from '../../styles/tokens'

interface ProgressBarProps {
  value: number
  max?: number
  showPercentage?: boolean
}

export default function ProgressBar({
  value,
  max = 100,
  showPercentage = false,
}: ProgressBarProps) {
  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  const percentage = Math.min(
    Math.max((value / max) * 100, 0),
    100,
  )

  return (
    <div className="w-full">
      {showPercentage && (
        <div className="mb-1.5 flex items-center justify-between">
          <span
            className="text-[12px] font-medium"
            style={{
              color: themeColors.mid,
            }}
          >
            Progress
          </span>

          <span
            className="text-[12px] font-semibold"
            style={{
              color: themeColors.charcoal,
            }}
          >
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{
          backgroundColor:
            themeColors.greenLight,
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor:
              themeColors.green,
          }}
        />
      </div>
    </div>
  )
}