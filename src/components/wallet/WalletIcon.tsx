import { Wallet } from 'lucide-react'

import { useTheme } from '../../hooks/useTheme'
import {
  colors,
  darkColors,
} from '../../styles/tokens'

interface WalletIconProps {
  size?: number
}

export default function WalletIcon({
  size = 22,
}: WalletIconProps) {
  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-[14px]"
      style={{
        width: 44,
        height: 44,
        backgroundColor:
          themeColors.greenLight,
        color: themeColors.green,
      }}
    >
      <Wallet
        size={size}
        strokeWidth={2}
      />
    </div>
  )
}