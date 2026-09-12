import {
  ArrowLeft,
  Search,
  X,
  Check,
  ChevronDown,
  Banknote,
  AlertCircle,
  CheckCircle,
  Building2,
  Plus,
  Trash2,
} from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import Button from '../../components/ui/Button'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import { 
  searchBanks, 
  verifyBankAccount, 
  saveBankAccount, 
  getBankAccounts, 
  deleteBankAccount,
  type SavedBank,
} from '../../services/app/bank'

interface Bank {
  name: string
  slug: string
  code: string
  ussd: string
  logo: string
}


export default function BankPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors


  // State for saved banks
  const [savedBanks, setSavedBanks] = useState<SavedBank[]>([])
  const [isLoadingBanks, setIsLoadingBanks] = useState(true)
  const [showAddBank, setShowAddBank] = useState(false)

  // State for adding bank
  const [bankSearch, setBankSearch] = useState('')
  const [banks, setBanks] = useState<Bank[]>([])
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [accountNumber, setAccountNumber] = useState('')
  const [verifiedAccount, setVerifiedAccount] = useState<{
    accountNumber: string
    accountName: string
    bankInstitution: string
    bankCode: string
  } | null>(null)
  const [consent, setConsent] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  
  const searchRef = useRef<HTMLDivElement>(null)

  // Load saved banks on mount
  useEffect(() => {
    loadSavedBanks()
  }, [])

  const loadSavedBanks = async () => {
    setIsLoadingBanks(true)
    try {
      const response = await getBankAccounts()
      if (response.is_success && response.data) {
        setSavedBanks(response.data)
      }
    } catch (error) {
      console.error('Error loading banks:', error)
    } finally {
      setIsLoadingBanks(false)
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search banks with debounce
  useEffect(() => {
    if (!bankSearch.trim() || bankSearch.length < 2) {
      setBanks([])
      setShowDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await searchBanks(bankSearch)
        if (response.is_success && response.data) {
          setBanks(response.data.banks || [])
          setShowDropdown(true)
        }
      } catch (error) {
        console.error('Error searching banks:', error)
      } finally {
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [bankSearch])

  // Handle bank selection
  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank)
    setBankSearch(bank.name)
    setShowDropdown(false)
    setVerifiedAccount(null)
    setError(null)
  }

  // Handle account number change
  const handleAccountNumberChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    if (numericValue.length <= 10) {
      setAccountNumber(numericValue)
      setVerifiedAccount(null)
      setError(null)
    }
  }

  // Verify account
  const handleVerifyAccount = async () => {
    if (!selectedBank) {
      setError('Please select a bank first')
      return
    }

    if (accountNumber.length < 10) {
      setError('Please enter a valid account number (10 digits)')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const response = await verifyBankAccount({
        accountNumber: accountNumber,
        bankCode: selectedBank.code,
      })

      if (response.is_success && response.data) {
        setVerifiedAccount(response.data)
      } else {
        setError(response.message || 'Account verification failed')
      }
    } catch (error) {
      console.error('Error verifying account:', error)
      setError('Failed to verify account. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  // Save bank account
  const handleSave = async () => {
    if (!verifiedAccount) {
      setError('Please verify your account first')
      return
    }

    if (!consent) {
      setError('You must give consent to save this account')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await saveBankAccount({
        accountNumber: verifiedAccount.accountNumber,
        bankCode: verifiedAccount.bankCode,
        consent: true,
      })

      if (response.is_success) {
        const successEvent = new CustomEvent('showToast', {
          detail: {
            type: 'success',
            message: 'Bank account added successfully!',
          },
        })
        window.dispatchEvent(successEvent)

        // Reset form
        setShowAddBank(false)
        setBankSearch('')
        setSelectedBank(null)
        setAccountNumber('')
        setVerifiedAccount(null)
        setConsent(false)
        setError(null)
        
        // Reload saved banks
        await loadSavedBanks()
      } else {
        setError(response.message || 'Failed to save bank account')
      }
    } catch (error) {
      console.error('Error saving bank account:', error)
      setError('Failed to save bank account. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete bank account
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this bank account?')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await deleteBankAccount(id)
      if (response.is_success) {
        const successEvent = new CustomEvent('showToast', {
          detail: {
            type: 'success',
            message: 'Bank account removed successfully!',
          },
        })
        window.dispatchEvent(successEvent)
        await loadSavedBanks()
      } else {
        const errorEvent = new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: response.message || 'Failed to delete bank account',
          },
        })
        window.dispatchEvent(errorEvent)
      }
    } catch (error) {
      console.error('Error deleting bank account:', error)
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: 'Failed to delete bank account. Please try again.',
        },
      })
      window.dispatchEvent(errorEvent)
    } finally {
      setDeletingId(null)
    }
  }


  const maskEmail = (value: string) => {
    if (!value) return ''
    // For account number display with spaces
    const visiblePart = value.slice(-4)
    const asteriskCount = value.length - 4
    const masked = '*'.repeat(asteriskCount) + visiblePart
    return masked.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  // Show loading state
  if (isLoadingBanks) {
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

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-70"
              style={{ backgroundColor: themeColors.background }}
            >
              <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
            </button>
            <h1 className="text-[20px] font-bold" style={{ color: themeColors.charcoal }}>
              Bank Accounts
            </h1>
          </div>
          {!showAddBank && (
            <button
              type="button"
              onClick={() => setShowAddBank(true)}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: themeColors.green,
                color: '#FFFFFF',
              }}
            >
              <Plus size={18} />
              Add Bank
            </button>
          )}
        </div>

        {/* Add Bank Form */}
        {showAddBank && (
          <div
            className="mb-6 rounded-[16px] border p-4"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[16px] font-bold" style={{ color: themeColors.charcoal }}>
                Add New Bank Account
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowAddBank(false)
                  setBankSearch('')
                  setSelectedBank(null)
                  setAccountNumber('')
                  setVerifiedAccount(null)
                  setConsent(false)
                  setError(null)
                }}
                className="rounded-full p-1 transition-all hover:opacity-70"
                style={{ color: themeColors.mid }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Bank Search */}
            <div className="mb-4" ref={searchRef}>
              <label className="mb-2 block text-[13px] font-semibold" style={{ color: themeColors.charcoal }}>
                Select Bank
              </label>
              <div className="relative">
                <div
                  className="flex items-center rounded-[14px] border px-4 py-3 transition-all duration-200"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: selectedBank ? themeColors.green : themeColors.border,
                  }}
                >
                  <Search size={18} style={{ color: themeColors.mid }} />
                  <input
                    type="text"
                    placeholder="Search for your bank..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    onFocus={() => bankSearch.length >= 2 && setShowDropdown(true)}
                    className="ml-2 w-full bg-transparent text-[14px] outline-none"
                    style={{ color: themeColors.charcoal }}
                  />
                  {isSearching && (
                    <div
                      className="h-4 w-4 animate-spin rounded-full border-2"
                      style={{
                        borderColor: themeColors.green,
                        borderTopColor: 'transparent',
                      }}
                    />
                  )}
                  {bankSearch && !isSearching && (
                    <button
                      type="button"
                      onClick={() => {
                        setBankSearch('')
                        setSelectedBank(null)
                        setBanks([])
                        setShowDropdown(false)
                      }}
                      className="rounded-full p-0.5 transition-all hover:opacity-70"
                      style={{ color: themeColors.mid }}
                    >
                      <X size={16} />
                    </button>
                  )}
                  <ChevronDown size={18} style={{ color: themeColors.mid }} />
                </div>

                {/* Dropdown */}
                {showDropdown && banks.length > 0 && (
                  <div
                    className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-[14px] border shadow-lg"
                    style={{
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                    }}
                  >
                    {banks.map((bank) => (
                      <button
                        key={bank.code}
                        type="button"
                        onClick={() => handleSelectBank(bank)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-all hover:opacity-80"
                        style={{
                          borderBottom: `1px solid ${themeColors.border}`,
                        }}
                      >
                        {bank.logo && bank.logo !== 'https://nigerianbanks.xyz/logo/default-image.png' ? (
                          <img
                            src={bank.logo}
                            alt={bank.name}
                            className="h-8 w-8 rounded-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full"
                            style={{
                              backgroundColor: isDark ? 'rgba(15, 185, 110, 0.2)' : 'rgba(15, 185, 110, 0.1)',
                              color: themeColors.green,
                            }}
                          >
                            <Building2 size={16} />
                          </div>
                        )}
                        <span className="text-[14px]" style={{ color: themeColors.charcoal }}>
                          {bank.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedBank && (
                <div
                  className="mt-2 flex items-center gap-2 rounded-[8px] px-3 py-1.5"
                  style={{
                    backgroundColor: themeColors.greenLight,
                    color: themeColors.green,
                  }}
                >
                  <Check size={14} />
                  <span className="text-[12px] font-medium">Selected: {selectedBank.name}</span>
                </div>
              )}
            </div>

            {/* Account Number */}
            <div className="mb-4">
              <label className="mb-2 block text-[13px] font-semibold" style={{ color: themeColors.charcoal }}>
                Account Number
              </label>
              <div className="flex gap-3">
                <div
                  className="flex-1 rounded-[14px] border px-4 py-3"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: verifiedAccount ? themeColors.green : themeColors.border,
                  }}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    value={accountNumber}
                    onChange={(e) => handleAccountNumberChange(e.target.value)}
                    placeholder="Enter 10-digit account number"
                    className="w-full bg-transparent text-[14px] outline-none"
                    style={{ color: themeColors.charcoal }}
                    disabled={!!verifiedAccount}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyAccount}
                  disabled={!selectedBank || accountNumber.length < 10 || isVerifying || !!verifiedAccount}
                  className="rounded-[14px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    backgroundColor: themeColors.green,
                    color: '#FFFFFF',
                  }}
                >
                  {isVerifying ? (
                    <div
                      className="h-5 w-5 animate-spin rounded-full border-2"
                      style={{
                        borderColor: '#FFFFFF',
                        borderTopColor: 'transparent',
                      }}
                    />
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
            </div>

            {/* Verified Account Info */}
            {verifiedAccount && (
              <div
                className="mb-4 rounded-[14px] border p-4"
                style={{
                  backgroundColor: themeColors.greenLight,
                  borderColor: themeColors.green,
                }}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} style={{ color: themeColors.green }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: themeColors.charcoal }}>
                      {verifiedAccount.accountName}
                    </p>
                    <p className="text-[12px]" style={{ color: themeColors.mid }}>
                      {maskEmail(verifiedAccount.accountNumber)} · {verifiedAccount.bankInstitution}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                className="mb-4 rounded-[14px] border px-4 py-3"
                style={{
                  backgroundColor: themeColors.redBackground,
                  borderColor: themeColors.red,
                }}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} style={{ color: themeColors.red }} className="mt-0.5 shrink-0" />
                  <p className="text-[13px]" style={{ color: themeColors.red }}>
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Consent Checkbox */}
            {verifiedAccount && (
              <div className="mb-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded-[4px] transition-all"
                    style={{
                      accentColor: themeColors.green,
                    }}
                  />
                  <span className="text-[13px] leading-relaxed" style={{ color: themeColors.mid }}>
                    I confirm that this is my bank account and I consent to MOVA using it for
                    receiving funds and processing transactions.
                  </span>
                </label>
              </div>
            )}

            {/* Save Button */}
            {verifiedAccount && (
              <Button
                type="button"
                onClick={handleSave}
                loading={isSaving}
                loadingText="Saving..."
                disabled={!consent}
              >
                Save Bank Account
              </Button>
            )}
          </div>
        )}

        {/* Saved Banks List */}
        {savedBanks.length > 0 ? (
          <div className="space-y-3">
            {savedBanks.map((bank) => (
              <div
                key={bank.id || bank.accountNumber}
                className="flex items-center justify-between rounded-[16px] border p-4"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div className="flex items-center gap-3">
                  {bank.bankImageUrl ? (
                    <img
                      src={bank.bankImageUrl}
                      alt={bank.bankName}
                      className="h-10 w-10 rounded-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: isDark ? 'rgba(15, 185, 110, 0.2)' : 'rgba(15, 185, 110, 0.1)',
                        color: themeColors.green,
                      }}
                    >
                      <Banknote size={18} strokeWidth={2} />
                    </div>
                  )}
                  <div>
                    <p className="text-[14px] font-semibold" style={{ color: themeColors.charcoal }}>
                      {bank.accountName}
                    </p>
                    <p className="text-[12px]" style={{ color: themeColors.mid }}>
                      {maskEmail(bank.accountNumber)} · {bank.bankName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(bank.id)}
                  disabled={deletingId === bank.id}
                  className="rounded-full p-2 transition-all hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ color: themeColors.red }}
                >
                  {deletingId === bank.id ? (
                    <div
                      className="h-4 w-4 animate-spin rounded-full border-2"
                      style={{
                        borderColor: themeColors.red,
                        borderTopColor: 'transparent',
                      }}
                    />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed p-12 text-center"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <Banknote size={48} strokeWidth={1.5} style={{ color: themeColors.mid }} />
            <p className="mt-4 text-[16px] font-semibold" style={{ color: themeColors.charcoal }}>
              No bank accounts added
            </p>
            <p className="mt-1 text-[13px]" style={{ color: themeColors.mid }}>
              Add a bank account to receive funds from your wallets
            </p>
            {!showAddBank && (
              <button
                type="button"
                onClick={() => setShowAddBank(true)}
                className="mt-6 flex items-center gap-2 rounded-full px-6 py-2.5 text-[14px] font-semibold transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: themeColors.green,
                  color: '#FFFFFF',
                }}
              >
                <Plus size={18} />
                Add Bank Account
              </button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}