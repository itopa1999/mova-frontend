import {
  Wallet,
  Frown,
  Plus,
  Calendar,
  ArrowUpRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Sparkles,
  Target,
  Shield,
} from 'lucide-react'

import { type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import {
  getWallets,
  type WalletItem,
  type WalletsData,
} from '../../services/app/wallets'
import type { ApiResponse } from '../../types/api'
import { useCategoryIcon } from '../../hooks/useCategoryIcon'


// Carousel items
interface CarouselItem {
  id: number
  icon: LucideIcon
  title: string
  description: string
  color: string
}

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    icon: Target,
    title: 'Set Smart Goals',
    description: 'Create wallets for savings, bills, and daily expenses.',
    color: '#4ADE80',
  },
  {
    id: 2,
    icon: Shield,
    title: 'Protect Your Money',
    description: 'Lock funds and release them only when needed.',
    color: '#60A5FA',
  },
  {
    id: 3,
    icon: Sparkles,
    title: 'Build Better Habits',
    description: 'Small releases help you stick to your budget.',
    color: '#F472B6',
  },
]

// Helper to get status color
const getStatusColor = (status: string, themeColors: any): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return themeColors.green
    case 'paused':
      return '#F59E0B'
    case 'completed':
      return '#3B82F6'
    case 'cancelled':
      return '#EF4444'
    default:
      return themeColors.mid
  }
}

// Search Bar Component
const SearchBar = ({
  value,
  onChange,
  onClear,
  isLoading,
}: {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  isLoading: boolean
}) => {
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  return (
    <div
      className="flex items-center gap-2 rounded-[12px] border px-3 py-2 transition-all duration-200 focus-within:ring-2"
      style={{
        backgroundColor: themeColors.card,
        borderColor: value ? themeColors.green : themeColors.border,
        boxShadow: value ? `0 0 0 2px ${themeColors.green}40` : 'none',
      }}
    >
      <Search
        size={18}
        style={{
          color: value ? themeColors.green : themeColors.mid,
        }}
      />
      <input
        type="text"
        placeholder="Search wallets..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[13px]"
        style={{
          color: themeColors.charcoal,
        }}
      />
      {isLoading && (
        <div
          className="h-4 w-4 animate-spin rounded-full border-2"
          style={{
            borderColor: themeColors.green,
            borderTopColor: 'transparent',
          }}
        />
      )}
      {value && !isLoading && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-full p-0.5 transition-all hover:opacity-70"
          style={{
            color: themeColors.mid,
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

// Wallet Card Component
const WalletCard = ({
  wallet,
  onClick,
}: {
  wallet: WalletItem
  onClick: () => void
}) => {
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const getIcon = useCategoryIcon()
  const Icon = getIcon(wallet.categoryIcon)
  const statusColor = getStatusColor(wallet.status, themeColors)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const releasedAmount = wallet.targetAmount - wallet.lockedAmount

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-[16px] border p-4 transition-all duration-200 hover:opacity-80 active:scale-[0.98]"
      style={{
        backgroundColor: themeColors.card,
        borderColor: themeColors.border,
        boxShadow: isDark
          ? '0 1px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
          : '0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[12px]"
            style={{
              backgroundColor: isDark ? 'rgba(15, 185, 110, 0.2)' : 'rgba(15, 185, 110, 0.1)',
              color: themeColors.green,
            }}
          >
            <Icon size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p
                className="text-[15px] font-semibold"
                style={{
                  color: themeColors.charcoal,
                }}
              >
                {wallet.name}
              </p>
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-medium uppercase"
                style={{
                  backgroundColor: statusColor + '20',
                  color: statusColor,
                }}
              >
                {wallet.status}
              </span>
            </div>
            <p
              className="text-[11px]"
              style={{
                color: themeColors.mid,
              }}
            >
              {wallet.scheduleDescription}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className="text-[15px] font-bold"
            style={{
              color: themeColors.charcoal,
              fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            {formatCurrency(wallet.targetAmount)}
          </p>
          <p
            className="text-[11px]"
            style={{
              color: themeColors.mid,
            }}
          >
            {formatCurrency(wallet.lockedAmount)} locked
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span style={{ color: themeColors.mid }}>
            Released: {formatCurrency(releasedAmount)}
          </span>
          <span style={{ color: themeColors.mid }}>
            {Math.round(wallet.progressPercentage)}%
          </span>
        </div>
        <div
          className="h-1.5 w-full rounded-full overflow-hidden"
          style={{
            backgroundColor: themeColors.border,
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              backgroundColor: statusColor,
              width: `${Math.min(wallet.progressPercentage, 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} style={{ color: themeColors.mid }} />
          <p
            className="text-[11px]"
            style={{
              color: themeColors.mid,
            }}
          >
            Next release: {wallet.nextRelease}
          </p>
        </div>
        <ArrowUpRight size={14} style={{ color: themeColors.mid }} />
      </div>
    </div>
  )
}

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  hasPrevious,
  hasNext,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasPrevious: boolean
  hasNext: boolean
}) => {
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const getVisiblePages = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(0)
      let start = Math.max(1, currentPage - 1)
      let end = Math.min(totalPages - 2, currentPage + 1)

      if (currentPage <= 2) {
        end = 3
      }
      if (currentPage >= totalPages - 3) {
        start = totalPages - 4
      }

      for (let i = start; i <= end; i++) {
        if (i > 0 && i < totalPages - 1) {
          pages.push(i)
        }
      }
      pages.push(totalPages - 1)
    }

    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="mt-4 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevious}
        className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-70 active:scale-95"
        style={{
          backgroundColor: themeColors.card,
          border: `1px solid ${themeColors.border}`,
          color: themeColors.charcoal,
        }}
      >
        <ChevronLeft size={18} />
      </button>

      {visiblePages.map((page, index) => {
        const isCurrent = page === currentPage

        if (index > 0 && page - visiblePages[index - 1] > 1) {
          return (
            <span
              key={`ellipsis-${page}`}
              className="flex h-9 w-9 items-center justify-center text-[13px]"
              style={{ color: themeColors.mid }}
            >
              …
            </span>
          )
        }

        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-medium transition-all duration-200 hover:opacity-70 active:scale-95"
            style={{
              backgroundColor: isCurrent ? themeColors.green : 'transparent',
              color: isCurrent ? '#FFFFFF' : themeColors.charcoal,
              border: isCurrent ? 'none' : `1px solid ${themeColors.border}`,
            }}
          >
            {page + 1}
          </button>
        )
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-70 active:scale-95"
        style={{
          backgroundColor: themeColors.card,
          border: `1px solid ${themeColors.border}`,
          color: themeColors.charcoal,
        }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

// Empty State Component
const EmptyState = ({ onCreateWallet, searchTerm }: { onCreateWallet: () => void; searchTerm?: string }) => {
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  return (
    <div
      className="flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed p-12 text-center"
      style={{
        backgroundColor: themeColors.card,
        borderColor: themeColors.border,
      }}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          backgroundColor: isDark ? 'rgba(15, 185, 110, 0.2)' : 'rgba(15, 185, 110, 0.1)',
          color: themeColors.green,
        }}
      >
        {searchTerm ? <Search size={32} strokeWidth={1.5} /> : <Wallet size={32} strokeWidth={1.5} />}
      </div>
      <h3
        className="mt-4 text-[18px] font-semibold"
        style={{
          color: themeColors.charcoal,
        }}
      >
        {searchTerm ? `No results for "${searchTerm}"` : 'No wallets yet'}
      </h3>
      <p
        className="mt-1 text-[13px]"
        style={{
          color: themeColors.mid,
        }}
      >
        {searchTerm
          ? 'Try adjusting your search'
          : 'Create your first wallet to start controlling your spending'}
      </p>
      {!searchTerm && (
        <button
          type="button"
          onClick={onCreateWallet}
          className="mt-6 flex items-center gap-2 rounded-full px-6 py-2.5 text-[14px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: themeColors.green,
            color: '#FFFFFF',
          }}
        >
          <Plus size={18} />
          Create Wallet
        </button>
      )}
    </div>
  )
}

export default function WalletsPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [currentPage, setCurrentPage] = useState(0) // 0-based for frontend
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<ApiResponse<WalletsData> | null>(null)
  const pageSize = 10

  // Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)

  const themeColors = isDark ? darkColors : colors

  // Carousel auto-slide
  useEffect(() => {
    if (isCarouselPaused) return
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselItems.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isCarouselPaused])

  // Carousel touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 50) {
      setCarouselIndex((prev) => (prev + 1) % carouselItems.length)
    } else if (touchEndX - touchStartX > 50) {
      setCarouselIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
    }
  }

  // Fetch data when page changes
  const fetchData = useCallback(async () => {
  setIsLoading(true)

  try {
    const result = await getWallets(
      currentPage,
      pageSize
    )

    if (result.is_success && result.data) {
      setResponse(result)
    }
  } catch (error) {
    console.error(
      'Error fetching wallets:',
      error
    )
  } finally {
    setIsLoading(false)
  }
}, [currentPage])

  // Fetch data on mount and when page changes
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter wallets on the frontend based on search term
  const filteredItems = useMemo(() => {
    if (!response?.data?.items) return []
    
    if (!searchTerm.trim()) {
      return response.data.items
    }
    
    const term = searchTerm.toLowerCase().trim()
    return response.data.items.filter((wallet) =>
      wallet.name.toLowerCase().includes(term) ||
      wallet.status.toLowerCase().includes(term) ||
      wallet.categoryName.toLowerCase().includes(term) ||
      wallet.frequency.toLowerCase().includes(term) ||
      wallet.scheduleDescription.toLowerCase().includes(term)
    )
  }, [response, searchTerm])

  // Use the API response for pagination - SOURCE OF TRUTH
  const totalPages = response?.data?.totalPages || 1
  const totalItems = response?.data?.totalCount || 0
  const hasNextPage = response?.data?.hasNextPage || false
  const hasPreviousPage = response?.data?.hasPreviousPage || false
  
  // Get current page items from filtered items
  const currentPageItems = useMemo(() => {
    // If no search, show all items from API
    if (!searchTerm.trim()) {
      return filteredItems
    }
    // If search, filter and paginate locally
    const start = currentPage * pageSize
    const end = start + pageSize
    return filteredItems.slice(start, end)
  }, [filteredItems, currentPage, searchTerm])

  // Reset to page 0 when search changes
  useEffect(() => {
    setCurrentPage(0)
  }, [searchTerm])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleWalletClick = (walletId: number) => {
    navigate(`/wallet/${walletId}`)
  }

  const handleCreateWallet = () => {
    navigate('/create-wallet')
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setCurrentPage(0)
  }

  // Show loading state while fetching initial data
  if (isLoading && !response) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] items-center justify-center py-5">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4"
            style={{
              borderColor: themeColors.green,
              borderTopColor: 'transparent',
            }}
          />
        </div>
      </AppLayout>
    )
  }

  // Guard against null response
  if (!response || !response.data) {
  return (
    <AppLayout>
      <div className="flex min-h-[400px] flex-col items-center justify-center py-5 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            backgroundColor: isDark
              ? 'rgba(15, 185, 110, 0.15)'
              : 'rgba(15, 185, 110, 0.08)',
            color: themeColors.mid,
          }}
        >
          <Frown size={32} strokeWidth={1.5} />
        </div>
        <p
          className="mt-4 text-[15px] font-semibold"
          style={{ color: themeColors.charcoal }}
        >
          Failed to load wallets
        </p>
        <p
          className="mt-1 text-[13px]"
          style={{ color: themeColors.mid }}
        >
          We couldn't fetch your wallets. Please try again later.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 cursor-pointer rounded-full px-6 py-2.5 text-[14px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: themeColors.green,
            color: '#FFFFFF',
          }}
        >
          Try again
        </button>
      </div>
    </AppLayout>
  )
}

  const { data } = response

  // If no items and not loading
  if (data.items.length === 0) {
    return (
      <AppLayout>
        <div className="py-5" style={{ color: themeColors.charcoal }}>
          {/* Header with Back Button */}
          <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:opacity-70"
              style={{
                borderColor: themeColors.border,
                backgroundColor: themeColors.card,
              }}
            >
              <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
            </button>

            <div>
              <h2
                className="text-[20px] font-bold"
                style={{
                  color: themeColors.charcoal,
                }}
              >
                Wallets
              </h2>
              <p
                className="text-[13px]"
                style={{
                  color: themeColors.mid,
                }}
              >
                Manage your controlled wallets
              </p>
            </div>
          </div>

          {/* Summary Strip */}
          <section
            className="rounded-[16px] p-4"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-[12px]"
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  Total Controlled
                </p>
                <p
                  className="mt-0.5 text-[22px] font-bold"
                  style={{
                    color: '#FFFFFF',
                    fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  {formatCurrency(0)}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-[12px]"
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  Active Wallets
                </p>
                <p
                  className="mt-0.5 text-[22px] font-bold"
                  style={{
                    color: '#FFFFFF',
                    fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  0
                </p>
              </div>
            </div>
          </section>

          {/* Empty State */}
          <div
            className="mt-4 flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed p-12 text-center"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDark ? 'rgba(15, 185, 110, 0.2)' : 'rgba(15, 185, 110, 0.1)',
                color: themeColors.green,
              }}
            >
              <Wallet size={32} strokeWidth={1.5} />
            </div>
            <h3
              className="mt-4 text-[18px] font-semibold"
              style={{
                color: themeColors.charcoal,
              }}
            >
              No wallets yet
            </h3>
            <p
              className="mt-1 text-[13px]"
              style={{
                color: themeColors.mid,
              }}
            >
              Create your first wallet to start controlling your spending
            </p>
            <button
              type="button"
              onClick={handleCreateWallet}
              className="mt-6 flex items-center gap-2 rounded-full px-6 py-2.5 text-[14px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: themeColors.green,
                color: '#FFFFFF',
              }}
            >
              <Plus size={18} />
              Create Wallet
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div
        className="py-5"
        style={{
          color: themeColors.charcoal,
        }}
      >
        {/* Header with Back Button */}
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:opacity-70"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.card,
            }}
          >
            <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
          </button>

          <div>
            <h2
              className="text-[20px] font-bold"
              style={{
                color: themeColors.charcoal,
              }}
            >
              Wallets
            </h2>
            <p
              className="text-[13px]"
              style={{
                color: themeColors.mid,
              }}
            >
              Manage your controlled wallets
            </p>
          </div>
        </div>

        {/* Summary Strip */}
        <section
          className="rounded-[16px] p-4"
          style={{
            backgroundColor: themeColors.green,
            color: '#FFFFFF',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-[12px]"
                style={{
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                Total Controlled
              </p>
              <p
                className="mt-0.5 text-[22px] font-bold"
                style={{
                  color: '#FFFFFF',
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {formatCurrency(data.totalControlledAmount)}
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-[12px]"
                style={{
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                Active Wallets
              </p>
              <p
                className="mt-0.5 text-[22px] font-bold"
                style={{
                  color: '#FFFFFF',
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {data.activeWalletCount}
              </p>
            </div>
          </div>
        </section>

        {/* Carousel Section */}
        <section className="mt-4">
          <div
            className="relative overflow-hidden rounded-[5px] border"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${carouselIndex * 100}%)`,
              }}
            >
              {carouselItems.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.id} className="min-w-full p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: isDark
                            ? 'rgba(74, 222, 128, 0.15)'
                            : 'rgba(15, 151, 61, 0.08)',
                        }}
                      >
                        <Icon size={22} strokeWidth={2} style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className="text-[14px] font-semibold"
                          style={{ color: themeColors.charcoal }}
                        >
                          {item.title}
                        </h4>
                        <p
                          className="text-[12px]"
                          style={{ color: themeColors.mid }}
                        >
                          {item.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCreateWallet}
                        className="shrink-0 rounded-[5px] px-4 py-2 text-[12px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap"
                        style={{
                          backgroundColor: themeColors.green,
                          color: '#FFFFFF',
                        }}
                      >
                        Create
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-1.5 pb-3">
              {carouselItems.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCarouselIndex(index)}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: carouselIndex === index ? '16px' : '6px',
                    backgroundColor:
                      carouselIndex === index
                        ? themeColors.green
                        : themeColors.border,
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <section className="mt-4">
          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
            isLoading={isLoading}
          />
        </section>

        {/* Wallet Cards */}
        <section className="mt-4">
          {currentPageItems.length > 0 ? (
            <>
              <div className="space-y-3">
                {currentPageItems.map((wallet) => (
                  <WalletCard
                    key={wallet.walletId}
                    wallet={wallet}
                    onClick={() => handleWalletClick(wallet.walletId)}
                  />
                ))}
              </div>

              {/* Results count */}
              <div className="mt-3 text-center text-[11px]" style={{ color: themeColors.mid }}>
                Showing {currentPageItems.length} of {totalItems} wallets
                {searchTerm && ` matching "${searchTerm}"`}
              </div>

              {/* Pagination - Using API response values */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  hasPrevious={hasPreviousPage}
                  hasNext={hasNextPage}
                />
              )}
            </>
          ) : (
            <EmptyState
              onCreateWallet={handleCreateWallet}
              searchTerm={searchTerm}
            />
          )}
        </section>

        {/* Create Wallet Button (only show if wallets exist) */}
        {data.items && data.items.length > 0 && (
          <button
            type="button"
            onClick={handleCreateWallet}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed py-4 transition-all duration-200 hover:opacity-80 active:scale-[0.98]"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.green,
              color: themeColors.green,
            }}
          >
            <Plus size={18} strokeWidth={2} />
            <span className="text-[15px] font-semibold">Create Wallet</span>
          </button>
        )}
      </div>
    </AppLayout>
  )
}