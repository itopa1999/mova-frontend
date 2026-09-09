import { useMemo } from 'react'
import {
  Wallet,
  Car,
  Utensils,
  Smartphone,
  AlertTriangle,
  PiggyBank,
  TrendingUp,
  Gamepad2,
  ShoppingBag,
  FileText,
  Clock,
  PlusCircle,
  Sparkles,
  Target,
  Calendar,
  Shield,
  Zap,
  User,
  Calculator,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'

// Map category icon names from backend to Lucide components
const iconMap: Record<string, LucideIcon> = {
  // From DefaultWalletCategories
  'Utensils': Utensils,
  'Car': Car,
  'Wallet': Wallet,
  'Zap': Zap,
  'ShoppingBag': ShoppingBag,
  'PlusCircle': PlusCircle,
  'FileText': FileText,
  'Gamepad2': Gamepad2,
  'User': User,
  'Sparkles': Sparkles,
  'Calendar': Calendar,
  'Smartphone': Smartphone,
  'Clock': Clock,
  'Shield': Shield,
  'Calculator': Calculator,
  'PiggyBank': PiggyBank,
  'TrendingUp': TrendingUp,
  'BarChart3': BarChart3,
  'AlertTriangle': AlertTriangle,
  'Target': Target,
  'Lock': Shield,
  'Home': Wallet,
}

export function useCategoryIcon() {
  const getIcon = useMemo(() => {
    return (iconName: string): LucideIcon => {
      return iconMap[iconName] || Wallet
    }
  }, [])

  return getIcon
}