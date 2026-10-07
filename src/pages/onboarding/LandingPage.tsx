import {
  Activity,
  ArrowRight,
  Bell,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileCheck2,
  Fingerprint,
  Globe,
  GraduationCap,
  KeyRound,
  Landmark,
  Lock,
  LockKeyhole,
  Mail,
  Menu,
  MessageCircle,
  Minus,
  Moon,
  Phone,
  PiggyBank,
  Plus,
  Quote,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Star,
  Store,
  Sun,
  Target,
  Timer,
  UserCircle,
  Users,
  Wallet,
  WalletCards,
  Wand2,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const navLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Security', href: '#security' },
  { label: 'Who it’s for', href: '#audience' },
  { label: 'FAQ', href: '#faq' },
]

const walletTabs = [
  {
    id: 'transport',
    label: 'Transportation',
    balance: '₦30,000',
    release: '₦1,000',
    cadence: 'Releases daily',
    next: 'Tomorrow',
    progress: 66,
    automation: true,
  },
  {
    id: 'emergency',
    label: 'Emergency Fund',
    balance: '₦120,000',
    release: '₦10,000',
    cadence: 'Releases weekly',
    next: 'in 2d 06h',
    progress: 42,
    automation: false,
  },
  {
    id: 'tech',
    label: 'Tech Gear',
    balance: '₦85,000',
    release: '₦5,000',
    cadence: 'Custom interval',
    next: 'in 9h 40m',
    progress: 78,
    automation: false,
  },
]

const trustBadges = [
  { icon: ShieldCheck, label: 'OTP-secured access' },
  { icon: Landmark, label: 'Bank-grade custody' },
  { icon: Globe, label: 'No download — works in your browser' },
]

const tractionStats = [
  { value: 'NGN-native', label: 'Built for the Naira' },
  { value: 'Multi-provider', label: 'Paystack & Flutterwave' },
  { value: 'Any device', label: 'Mobile, tablet, desktop' },
]

const audiences = [
  {
    icon: Briefcase,
    title: 'Salaried workers',
    copy: 'Protect your salary from first-week overspending and stretch it calmly across the month.',
  },
  {
    icon: GraduationCap,
    title: 'Students',
    copy: 'Stretch your allowance across the whole term instead of running out before the next top-up.',
  },
  {
    icon: UserCircle,
    title: 'Freelancers & self-employed',
    copy: 'Smooth out irregular income into a steady, scheduled plan you can actually rely on.',
  },
  {
    icon: Store,
    title: 'Small business owners',
    copy: 'Ring-fence money for rent, stock, and tax — so it is still there when the bill is due.',
  },
]

const features = [
  {
    id: 'aside',
    icon: Lock,
    title: 'Set money aside',
    copy: 'Move money into a wallet so it is not all available to spend at once.',
    span: 4,
    kind: 'progress' as const,
  },
  {
    id: 'released',
    icon: Wallet,
    title: 'Choose when money is released',
    copy: 'Choose the amount and timing. MOVA follows the release schedule you set.',
    span: 2,
    kind: 'lock' as const,
  },
  {
    id: 'terms',
    icon: CalendarCheck,
    title: 'Money released on your terms',
    copy: 'When a release is due, MOVA sends the money to the destination you selected.',
    span: 2,
    kind: 'countdown' as const,
  },
  {
    id: 'template',
    icon: Wand2,
    title: 'Start with a template',
    copy: 'Start with a preset wallet setup, then adjust the amount and release schedule to suit you.',
    span: 2,
    kind: 'template' as const,
  },
  {
    id: 'automation',
    icon: RefreshCw,
    title: 'Keep your release rules running',
    copy: 'Where available, automation can refill a wallet from your main balance based on the rules you set.',
    span: 2,
    kind: 'automation' as const,
  },
]

const securityItems = [
  {
    icon: ShieldCheck,
    title: 'OTP-secured account access',
    copy: 'Every sign-in and sensitive action is confirmed with a one-time code that expires after use.',
  },
  {
    icon: KeyRound,
    title: 'Transaction PIN',
    copy: 'Sensitive actions like withdrawals and rule changes require a PIN that only you know.',
  },
  {
    icon: Fingerprint,
    title: 'Signature-verified payments',
    copy: 'Every Paystack and Flutterwave event is signature-verified before it can change your balance.',
  },
  {
    icon: Users,
    title: 'Scoped to your account',
    copy: 'Every request is authorized against your account. No one else can read or touch your data.',
  },
  {
    icon: Timer,
    title: 'Rate-limited & monitored',
    copy: 'Login, verification, and PIN endpoints are rate-limited, and privileged actions are audited.',
  },
  {
    icon: FileCheck2,
    title: 'Reconciled, ledger-backed',
    copy: 'Every balance change has a matching transaction and ledger entry that can be reconciled.',
  },
]

const faqs = [
  {
    q: 'Is MOVA a bank?',
    a: 'No. MOVA is a controlled-access wallet product that works with bank-linked funding providers. Money is held with our payment partners under bank-grade custody — MOVA is not a bank itself.',
  },
  {
    q: 'Do I have to download an app?',
    a: 'No. MOVA is a web app. Sign in from any modern browser on your phone, tablet, or desktop — no app store, no install, no updates to manage.',
  },
  {
    q: 'How do I fund my MOVA account?',
    a: 'Through Paystack or Flutterwave. Both providers support the funding methods available for your account, and every successful payment is signature-verified before it credits your balance.',
  },
  {
    q: 'Can I withdraw before the release is due?',
    a: 'Locked funds stay locked until a release is due — that is the whole point. Where the rules allow, you can pause, resume, break, or restart a wallet, and each operation has clear, visible consequences.',
  },
  {
    q: 'What happens if a release fails?',
    a: 'Failed releases are retried a bounded number of times and every attempt is visible. Unwithdrawn amounts are kept as unused — never discarded — so nothing gets lost between windows.',
  },
  {
    q: 'Is my money safe?',
    a: 'Access is secured with OTP and a transaction PIN, payment events are signature-verified, every request is scoped to your account, and every balance change is recorded on a matching transaction and ledger entry.',
  },
  {
    q: 'Can I set my own rules?',
    a: 'Yes. You choose the target, the release amount, and the schedule — once, daily, weekly, monthly, quarterly, yearly, or a custom interval — and you can preview the full schedule before you commit.',
  },
  {
    q: 'What if I want to stop or change a wallet?',
    a: 'You can pause a wallet at any time and resume when you are ready. Breaking or restarting a wallet is supported where the rules permit, and its financial effects are shown before you confirm.',
  },
]

/* ------------------------------------------------------------------ */
/*  Contact methods — replace with your real support channels          */
/* ------------------------------------------------------------------ */

const contactMethods = [
  {
    icon: Mail,
    title: 'Email us',
    value: 'hello@mova.app',
    detail: 'We reply within 24 hours',
    href: 'mailto:hello@mova.app',
  },
  {
    icon: MessageCircle,
    title: 'Live chat',
    value: 'Chat with support',
    detail: 'Weekdays · 8am – 8pm WAT',
    href: 'https://wa.me/2348000000000',
  },
  {
    icon: Phone,
    title: 'Call us',
    value: '+234 800 000 0000',
    detail: 'Weekdays · 9am – 5pm WAT',
    href: 'tel:+2348000000000',
  },
]

const workflowSteps = [
  {
    id: 'goal',
    step: '01',
    title: 'Fund and create a wallet',
    copy: 'Fund your main account, then create a wallet around a goal. Set a target, a release amount, a schedule, and a payout destination — and preview the schedule before you commit.',
    icon: Target,
    preview: {
      heading: 'New wallet',
      title: 'Transportation',
      amount: '₦30,000',
      meta: 'Target · 30 days · Daily',
      progress: 12,
      rows: [
        { label: 'Wallet name', value: 'Transportation' },
        { label: 'Goal amount', value: '₦30,000' },
        { label: 'Schedule preview', value: '30 releases' },
      ],
    },
  },
  {
    id: 'rule',
    step: '02',
    title: 'Set your release rule',
    copy: 'Choose how much is unlocked and how often — once, daily, weekly, monthly, quarterly, yearly, or a custom interval. MOVA reserves the target from your main balance.',
    icon: CalendarDays,
    preview: {
      heading: 'Release rule',
      title: '₦1,000 / day',
      amount: 'Daily',
      meta: 'Auto-release · On',
      progress: 48,
      rows: [
        { label: 'Release amount', value: '₦1,000' },
        { label: 'Frequency', value: 'Every day' },
        { label: 'Destination', value: 'Linked bank account' },
      ],
    },
  },
  {
    id: 'execute',
    step: '03',
    title: 'MOVA runs it in the background',
    copy: 'Our background service processes each release when it is due — even when the app is closed. Unused amounts are kept as unused, not discarded, until the next release window.',
    icon: Activity,
    preview: {
      heading: 'Wallet activity',
      title: '₦19,800 released',
      amount: 'On schedule',
      meta: '20 releases · 0 missed',
      progress: 66,
      rows: [
        { label: 'Next release', value: 'Tomorrow' },
        { label: 'Released this month', value: '₦19,800' },
        { label: 'Unused (kept)', value: '₦2,000' },
      ],
    },
  },
]

const testimonials = [
  {
    quote:
      'The daily release is the only thing that has ever worked for me. My transport money is not just sitting there waiting to be spent.',
    name: 'Amaka O.',
    role: 'Product Designer',
    initials: 'AO',
    rating: 5,
  },
  {
    quote:
      'I set the rule once and it just handles the discipline. Paused it when I travelled, resumed it when I got back — no drama.',
    name: 'Tunde A.',
    role: 'Software Engineer',
    initials: 'TA',
    rating: 5,
  },
  {
    quote:
      'The transparency is what sold me. I can see exactly what is locked, what is coming next, and what I have already spent.',
    name: 'Zainab M.',
    role: 'Small Business Owner',
    initials: 'ZM',
    rating: 5,
  },
]

/**
 * Footer columns — 3 balanced columns.
 * Product · Company · Legal (Resources collapsed into Product/Company).
 */
const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', to: '/how-it-works' },
      { label: 'Wallets', to: '/dashboard' },
      { label: 'Go to app', to: '/welcome' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '#contact' },
      // { label: 'Status', to: '/status' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms', to: '/terms' },
      { label: 'Privacy', to: '/privacy' },
      { label: 'Cookies', to: '/privacy' },
      { label: 'Licences', to: '/terms' },
    ],
  },
]

const LOGO_URL =
  'https://res.cloudinary.com/et0r3out/image/upload/v1789426234/9.png'

/* ------------------------------------------------------------------ */
/*  Small shared pieces                                                */
/* ------------------------------------------------------------------ */

function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p
      className="text-[11px] font-semibold uppercase tracking-[0.2em] sm:text-xs"
      style={{ color }}
    >
      {children}
    </p>
  )
}

function StatusDot({ color, ring = true }: { color: string; ring?: boolean }) {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      {ring && (
        <span
          className="mova-pulse-ring absolute inline-flex h-full w-full rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <span
        className="relative inline-flex h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
    </span>
  )
}

function SocialIcon({ name }: { name: 'twitter' | 'linkedin' | 'github' }) {
  const paths: Record<string, string> = {
    twitter:
      'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    linkedin:
      'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.062 2.062 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    github:
      'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  }

  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const REDIRECT_SECONDS = 5

export default function LandingPage() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeWallet, setActiveWallet] = useState(walletTabs[0].id)
  const [activeStep, setActiveStep] = useState(workflowSteps[0].id)
  const [isLocked, setIsLocked] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [secondsLeft, setSecondsLeft] = useState(4 * 3600 + 12 * 60 + 36)

  /* ---- redirect modal state ---- */
  const [isRedirectOpen, setIsRedirectOpen] = useState(false)
  const [redirectLeft, setRedirectLeft] = useState(REDIRECT_SECONDS)
  const [pendingPath, setPendingPath] = useState<string>('')
  const [pendingLabel, setPendingLabel] = useState<string>('')

  /* ---- auth redirect (unchanged behaviour) ---- */
  useEffect(() => {
    const userData =
      sessionStorage.getItem('userData') ?? localStorage.getItem('userData')

    if (userData) {
      navigate('/dashboard')
    }
  }, [navigate])

  /* ---- live countdown for the timer tile ---- */
  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 4 * 3600 + 12 * 60 + 36 : prev - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  /* ---- 5-second redirect countdown → goes to the pending path ---- */
  useEffect(() => {
    if (!isRedirectOpen) return
    if (redirectLeft <= 0) {
      const target = pendingPath || '/welcome'
      setIsRedirectOpen(false)
      setRedirectLeft(REDIRECT_SECONDS)
      setPendingPath('')
      setPendingLabel('')
      navigate(target)
      return
    }
    const id = window.setTimeout(() => {
      setRedirectLeft((s) => s - 1)
    }, 1000)
    return () => window.clearTimeout(id)
  }, [isRedirectOpen, redirectLeft, pendingPath, navigate])

  /* ---- escape to cancel + lock body scroll ---- */
  useEffect(() => {
    if (!isRedirectOpen) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsRedirectOpen(false)
        setRedirectLeft(REDIRECT_SECONDS)
        setPendingPath('')
        setPendingLabel('')
      }
    }
    window.addEventListener('keydown', onKey)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isRedirectOpen])

  const goTo = (path: string, label: string = 'the app') => {
    setPendingPath(path)
    setPendingLabel(label)
    setIsRedirectOpen(true)
    setRedirectLeft(REDIRECT_SECONDS)
  }

  const handleNav = (to: string, label: string = '') => {
    if (to.startsWith('#')) {
      // Smooth-scroll to the section on the same page
      const el = document.querySelector(to)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      return
    }
    if (to === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    goTo(to, label || to)
  }

  const cancelRedirect = () => {
    setIsRedirectOpen(false)
    setRedirectLeft(REDIRECT_SECONDS)
    setPendingPath('')
    setPendingLabel('')
  }

  const continueNow = () => {
    const target = pendingPath || '/welcome'
    setIsRedirectOpen(false)
    setRedirectLeft(REDIRECT_SECONDS)
    setPendingPath('')
    setPendingLabel('')
    navigate(target)
  }

  const activeWalletData =
    walletTabs.find((tab) => tab.id === activeWallet) ?? walletTabs[0]

  const activeStepData =
    workflowSteps.find((step) => step.id === activeStep) ?? workflowSteps[0]

  const countdown = (() => {
    const h = Math.floor(secondsLeft / 3600)
    const m = Math.floor((secondsLeft % 3600) / 60)
    const s = secondsLeft % 60
    return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
  })()

  const redirectProgress =
    ((REDIRECT_SECONDS - redirectLeft) / REDIRECT_SECONDS) * 100

  /* -------- restrained visual system -------- */
  const pageBg = isDark ? '#0D0F11' : '#FFFFFF'
  const altBg = isDark ? '#121517' : '#FAFAFA'
  const sunkenBg = isDark ? '#161A1D' : '#F8FAFC'
  const hairline = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'
  const hairlineStrong = isDark ? 'rgba(255,255,255,0.14)' : '#DDE2E7'
  const greenSoftBg = isDark ? 'rgba(85,217,148,0.14)' : '#ECFDF3'
  const ctaBg = isDark ? '#161B18' : '#0F1A16'

  const shadowCard = isDark
    ? '0 8px 30px rgba(0, 0, 0, 0.35)'
    : '0 8px 30px rgba(15, 23, 42, 0.06)'
  const shadowLifted = isDark
    ? '0 12px 35px rgba(0, 0, 0, 0.45)'
    : '0 12px 35px rgba(15, 23, 42, 0.08)'
  const shadowCta = isDark
    ? '0 16px 40px rgba(0, 0, 0, 0.5)'
    : '0 16px 40px rgba(15, 23, 42, 0.10)'
  const shadowBtn = isDark
    ? '0 4px 12px rgba(0, 0, 0, 0.35)'
    : '0 4px 12px rgba(23, 107, 69, 0.18)'

  return (
    <main
      className="relative min-h-screen overflow-x-hidden antialiased"
      style={{
        backgroundColor: pageBg,
        color: themeColors.charcoal,
      }}
    >
      <style>{`
        @keyframes mova-pulse-ring {
          0%   { transform: scale(0.85); opacity: 0.65 }
          70%  { transform: scale(1.9);  opacity: 0 }
          100% { transform: scale(1.9);  opacity: 0 }
        }
        .mova-pulse-ring {
          animation: mova-pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .mova-pulse-ring { animation: none !important; }
        }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* ============================================================ */}
      {/*  HEADER                                                      */}
      {/* ============================================================ */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: pageBg, borderColor: hairline }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5"
            aria-label="MOVA home"
          >
            <img
              src={LOGO_URL}
              alt="MOVA logo"
              className="h-11 w-11 rounded-xl object-contain sm:h-12 sm:w-12"
              loading="eager"
              draggable={false}
            />
            <span
              className="font-mono text-[24px] font-bold tracking-[-0.08em]"
              style={{ color: themeColors.green }}
            >
              MOVA
            </span>
          </button>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-7 lg:flex"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: themeColors.mid }}
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => goTo('/about', 'About')}
              className="text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: themeColors.mid }}
            >
              About
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
              style={{
                backgroundColor: pageBg,
                borderColor: hairline,
                color: themeColors.charcoal,
              }}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              onClick={() => goTo('/welcome', 'the app')}
              className="group hidden items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition-colors sm:inline-flex"
              style={{
                backgroundColor: themeColors.green,
                boxShadow: shadowBtn,
              }}
            >
              Go to app
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border lg:hidden"
              style={{
                backgroundColor: pageBg,
                borderColor: hairline,
                color: themeColors.charcoal,
              }}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="absolute inset-x-0 top-full border-b px-5 py-4 lg:hidden"
            style={{
              backgroundColor: pageBg,
              borderColor: hairline,
            }}
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  goTo('/about', 'About')
                }}
                className="rounded-xl px-3 py-3 text-left text-sm font-medium"
                style={{ color: themeColors.charcoal }}
              >
                About
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  handleNav('#contact', 'Contact')
                }}
                className="rounded-xl px-3 py-3 text-left text-sm font-medium"
                style={{ color: themeColors.charcoal }}
              >
                Contact
              </button>
              <div
                className="mt-2 border-t pt-4"
                style={{ borderColor: hairline }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    goTo('/welcome', 'the app')
                  }}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-center text-sm font-semibold text-white"
                  style={{ backgroundColor: themeColors.green }}
                >
                  Go to app
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section
        className="relative border-b"
        style={{ backgroundColor: pageBg, borderColor: hairline }}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-10 lg:py-28">
          <div className="max-w-2xl">
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium"
              style={{
                backgroundColor: sunkenBg,
                borderColor: hairline,
                color: themeColors.mid,
              }}
            >
              <Download size={13} style={{ color: themeColors.green }} />
              <span>No download needed — MOVA runs in your browser</span>
            </div>

            <p
              className="mb-3 text-sm font-medium sm:text-base"
              style={{ color: themeColors.mid }}
            >
              Too easy to spend money meant for later?
            </p>

            <h1 className="text-[clamp(2.6rem,6.6vw,5.2rem)] font-semibold leading-[1.04] tracking-[-0.05em]">
              Your money.
              <br />
              <span style={{ color: themeColors.green }}>Your timing.</span>
            </h1>

            <p
              className="mt-6 max-w-xl text-base leading-7 sm:text-lg sm:leading-8"
              style={{ color: themeColors.mid }}
            >
              Put money aside in a MOVA wallet, set your release rules and
              schedule, and MOVA makes it available when it is due — to the
              destination you selected, including your linked bank account.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => goTo('/welcome', 'the app')}
                className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-7 text-base font-semibold text-white transition-colors"
                style={{
                  backgroundColor: themeColors.green,
                  boxShadow: shadowBtn,
                }}
              >
                Go to app
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
              <a
                href="#how-it-works"
                className="inline-flex min-h-14 items-center justify-center rounded-full border px-7 text-base font-semibold transition-colors"
                style={{
                  backgroundColor: pageBg,
                  borderColor: hairlineStrong,
                  color: themeColors.charcoal,
                }}
              >
                See how it works
              </a>
            </div>

            <div
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium sm:text-sm"
              style={{ color: themeColors.mid }}
            >
              <span className="inline-flex items-center gap-2">
                <Check size={16} style={{ color: themeColors.green }} />
                Preview your schedule before you commit
              </span>
              <span className="inline-flex items-center gap-2">
                <Check size={16} style={{ color: themeColors.green }} />
                OTP + transaction PIN security
              </span>
              <span className="inline-flex items-center gap-2">
                <Check size={16} style={{ color: themeColors.green }} />
                Works on any device
              </span>
            </div>
          </div>

          {/* -------- interactive preview -------- */}
          <div className="relative mx-auto w-full max-w-[560px]">
            <div
              className="relative rounded-3xl border"
              style={{
                backgroundColor: pageBg,
                borderColor: hairline,
                boxShadow: shadowLifted,
              }}
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p
                      className="text-xs font-medium sm:text-sm"
                      style={{ color: themeColors.mid }}
                    >
                      Your MOVA wallet
                    </p>
                    <h2 className="mt-1 truncate text-lg font-semibold tracking-tight sm:text-xl">
                      A plan that feels good.
                    </h2>
                  </div>
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: greenSoftBg,
                      color: themeColors.green,
                    }}
                  >
                    <WalletCards size={20} />
                  </span>
                </div>

                <div
                  className="mt-5 flex gap-1 overflow-x-auto rounded-2xl p-1"
                  style={{ backgroundColor: sunkenBg }}
                  role="tablist"
                  aria-label="Wallet categories"
                >
                  {walletTabs.map((tab) => {
                    const isActive = tab.id === activeWallet
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveWallet(tab.id)}
                        className="flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition-colors sm:text-sm"
                        style={{
                          backgroundColor: isActive ? pageBg : 'transparent',
                          color: isActive
                            ? themeColors.green
                            : themeColors.mid,
                          border: `1px solid ${
                            isActive ? hairline : 'transparent'
                          }`,
                          boxShadow: isActive
                            ? '0 1px 2px rgba(15, 23, 42, 0.06)'
                            : 'none',
                        }}
                      >
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                <div
                  className="relative mt-5 overflow-hidden rounded-2xl p-5 sm:p-6"
                  style={{
                    backgroundColor: themeColors.green,
                    color: '#FFFFFF',
                  }}
                >
                  <div className="relative flex items-center justify-between">
                    <span className="text-sm font-medium text-white/85">
                      {activeWalletData.label}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
                      <StatusDot color="#FFFFFF" />
                      Active
                    </span>
                  </div>

                  <p className="amount relative mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                    {activeWalletData.balance}
                  </p>

                  <div className="relative mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs text-white/75">
                        {activeWalletData.cadence}
                      </p>
                      <p className="amount mt-1 text-lg font-semibold">
                        {activeWalletData.release}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/75">Next release</p>
                      <p className="mt-1 text-sm font-semibold">
                        {activeWalletData.next}
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white transition-[width] duration-500 ease-out"
                      style={{ width: `${activeWalletData.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div
                    className="rounded-2xl border p-4"
                    style={{
                      backgroundColor: pageBg,
                      borderColor: hairline,
                    }}
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: greenSoftBg,
                        color: themeColors.green,
                      }}
                    >
                      <LockKeyhole size={17} />
                    </span>
                    <p className="mt-3 text-sm font-semibold">Locked balance</p>
                    <p className="mt-1 text-xs" style={{ color: themeColors.mid }}>
                      Unavailable until release
                    </p>
                  </div>
                  <div
                    className="rounded-2xl border p-4"
                    style={{
                      backgroundColor: pageBg,
                      borderColor: hairline,
                    }}
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: greenSoftBg,
                        color: themeColors.green,
                      }}
                    >
                      <CalendarDays size={17} />
                    </span>
                    <p className="mt-3 text-sm font-semibold">Release schedule</p>
                    <p className="mt-1 text-xs" style={{ color: themeColors.mid }}>
                      Runs while the app is closed
                    </p>
                  </div>
                </div>

                {activeWalletData.automation && (
                  <div
                    className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ backgroundColor: greenSoftBg }}
                  >
                    <RefreshCw
                      size={13}
                      strokeWidth={2.4}
                      style={{ color: themeColors.green }}
                    />
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: themeColors.green }}
                    >
                      Automation on — follows your refill rule
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div
              className="absolute -left-4 top-24 hidden items-center gap-2.5 rounded-2xl border px-4 py-3 sm:flex lg:-left-10"
              style={{
                backgroundColor: pageBg,
                borderColor: hairline,
                boxShadow: shadowCard,
              }}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: greenSoftBg,
                  color: themeColors.green,
                }}
              >
                <PiggyBank size={16} />
              </span>
              <div>
                <p
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: themeColors.mid }}
                >
                  Saved this month
                </p>
                <p className="text-sm font-semibold">₦120,000</p>
              </div>
            </div>

            <div
              className="absolute -right-3 bottom-32 hidden items-center gap-2.5 rounded-2xl border px-4 py-3 sm:flex lg:-right-8"
              style={{
                backgroundColor: pageBg,
                borderColor: hairline,
                boxShadow: shadowCard,
              }}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: greenSoftBg,
                  color: themeColors.green,
                }}
              >
                <Bell size={16} />
              </span>
              <div>
                <p
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: themeColors.mid }}
                >
                  Next release
                </p>
                <p className="text-sm font-semibold">{activeWalletData.next}</p>
              </div>
            </div>

            <div
              className="absolute -bottom-5 left-8 hidden items-center gap-2 rounded-full border px-3.5 py-2 sm:flex"
              style={{
                backgroundColor: pageBg,
                borderColor: hairline,
                boxShadow: shadowCard,
              }}
            >
              <CheckCircle2 size={14} style={{ color: themeColors.green }} />
              <span className="text-xs font-semibold">
                Money released on your terms
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TRUST / TRACTION BAR                                        */}
      {/* ============================================================ */}
      <section
        className="border-b"
        style={{
          borderColor: hairline,
          backgroundColor: pageBg,
        }}
      >
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-14">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="inline-flex items-center gap-2">
                  <Icon size={16} style={{ color: themeColors.green }} />
                  <span
                    className="text-xs font-semibold sm:text-sm"
                    style={{ color: themeColors.mid }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="grid grid-cols-1 divide-y rounded-2xl border sm:grid-cols-3 sm:divide-x sm:divide-y-0"
              style={{
                backgroundColor: sunkenBg,
                borderColor: hairline,
              }}
            >
              {tractionStats.map((stat) => (
                <div
                  key={stat.label}
                  className="px-4 py-4 text-center sm:px-6"
                  style={{ borderColor: hairline }}
                >
                  <p
                    className="text-base font-semibold tracking-tight sm:text-lg"
                    style={{ color: themeColors.green }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="mt-1 text-[10px] font-medium uppercase tracking-wider sm:text-xs"
                    style={{ color: themeColors.mid }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  AUDIENCE                                                    */}
      {/* ============================================================ */}
      <section
        id="audience"
        className="border-b"
        style={{ backgroundColor: pageBg, borderColor: hairline }}
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow color={themeColors.green}>Who MOVA is for</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Built for anyone who wants their money to still be there when it
              matters.
            </h2>
            <p
              className="mt-4 text-base leading-7"
              style={{ color: themeColors.mid }}
            >
              If you have ever watched a carefully-saved amount disappear into
              everyday spending, MOVA is designed for you.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map(({ icon: Icon, title, copy }) => (
              <article
                key={title}
                className="rounded-2xl border p-6"
                style={{
                  backgroundColor: pageBg,
                  borderColor: hairline,
                  boxShadow: shadowCard,
                }}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: greenSoftBg,
                    color: themeColors.green,
                  }}
                >
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 text-base font-semibold tracking-tight sm:text-lg">
                  {title}
                </h3>
                <p
                  className="mt-2 text-sm leading-6"
                  style={{ color: themeColors.mid }}
                >
                  {copy}
                </p>
              </article>
            ))}
          </div>

          <div
            className="mt-10 flex flex-col items-start gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6"
            style={{ backgroundColor: sunkenBg, borderColor: hairline }}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: pageBg,
                color: themeColors.green,
                border: `1px solid ${hairline}`,
              }}
            >
              <Smartphone size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold sm:text-base">
                No download. No app store. Works on any device you already have.
              </p>
              <p
                className="mt-1 text-xs leading-6 sm:text-sm"
                style={{ color: themeColors.mid }}
              >
                MOVA is a web app. Open it in your phone, tablet, or desktop
                browser — no install, no updates, nothing to keep track of.
              </p>
            </div>
            <button
              type="button"
              onClick={() => goTo('/welcome', 'the app')}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold text-white sm:text-sm"
              style={{ backgroundColor: themeColors.green }}
            >
              Go to app
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BENTO FEATURES                                              */}
      {/* ============================================================ */}
      <section
        id="why-mova"
        className="border-b"
        style={{ backgroundColor: altBg, borderColor: hairline }}
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow color={themeColors.green}>How MOVA helps</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Make your money work with your plans.
            </h2>
            <p
              className="mt-4 text-base leading-7"
              style={{ color: themeColors.mid }}
            >
              Five small things MOVA does so the money you set aside stays
              available when — and only when — it needs to be.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const span =
                feature.span === 4 ? 'lg:col-span-4' : 'lg:col-span-2'
              return (
                <article
                  key={feature.id}
                  className={`relative rounded-2xl border p-6 sm:p-7 ${span}`}
                  style={{
                    backgroundColor: pageBg,
                    borderColor: hairline,
                    boxShadow: shadowCard,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{
                        backgroundColor: greenSoftBg,
                        color: themeColors.green,
                      }}
                    >
                      <Icon size={22} />
                    </span>
                    <span
                      className="font-mono text-sm font-medium"
                      style={{ color: themeColors.light }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-semibold tracking-tight sm:text-xl">
                    {feature.title}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-6"
                    style={{ color: themeColors.mid }}
                  >
                    {feature.copy}
                  </p>

                  {feature.kind === 'progress' && (
                    <div className="mt-8">
                      <div className="flex items-center justify-between gap-2">
                        {['Funded', 'Scheduled', 'Releasing', 'Complete'].map(
                          (label, i) => {
                            const done = i <= 2
                            return (
                              <div
                                key={label}
                                className="flex flex-1 flex-col items-center gap-2"
                              >
                                <span
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold transition-colors"
                                  style={{
                                    backgroundColor: done
                                      ? themeColors.green
                                      : sunkenBg,
                                    color: done ? '#FFFFFF' : themeColors.mid,
                                    border: `1px solid ${
                                      done ? themeColors.green : hairline
                                    }`,
                                  }}
                                >
                                  {done ? <Check size={14} /> : i + 1}
                                </span>
                                <span
                                  className="text-[10px] font-semibold uppercase tracking-wider sm:text-[11px]"
                                  style={{
                                    color: done
                                      ? themeColors.charcoal
                                      : themeColors.mid,
                                  }}
                                >
                                  {label}
                                </span>
                              </div>
                            )
                          }
                        )}
                      </div>
                      <div
                        className="relative mt-4 h-1.5 overflow-hidden rounded-full"
                        style={{ backgroundColor: sunkenBg }}
                      >
                        <div
                          className="h-full w-[72%] rounded-full"
                          style={{ backgroundColor: themeColors.green }}
                        />
                      </div>
                    </div>
                  )}

                  {feature.kind === 'lock' && (
                    <button
                      type="button"
                      onClick={() => setIsLocked((v) => !v)}
                      className="mt-6 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors"
                      style={{
                        borderColor: hairline,
                        backgroundColor: sunkenBg,
                      }}
                      aria-pressed={isLocked}
                    >
                      <div>
                        <p className="text-xs font-semibold">
                          {isLocked ? 'Wallet locked' : 'Wallet unlocked'}
                        </p>
                        <p
                          className="mt-0.5 text-[11px]"
                          style={{ color: themeColors.mid }}
                        >
                          Tap to {isLocked ? 'unlock' : 'lock'}
                        </p>
                      </div>
                      <span
                        className="relative flex h-7 w-12 shrink-0 items-center rounded-full transition-colors"
                        style={{
                          backgroundColor: isLocked
                            ? themeColors.green
                            : hairlineStrong,
                        }}
                      >
                        <span
                          className="absolute h-5 w-5 rounded-full bg-white shadow-sm transition-all"
                          style={{ left: isLocked ? '26px' : '4px' }}
                        />
                      </span>
                    </button>
                  )}

                  {feature.kind === 'countdown' && (
                    <div
                      className="mt-6 rounded-2xl border px-4 py-4"
                      style={{
                        borderColor: hairline,
                        backgroundColor: sunkenBg,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wider"
                          style={{ color: themeColors.mid }}
                        >
                          Next release in
                        </span>
                        <StatusDot color={themeColors.green} />
                      </div>
                      <p
                        className="amount mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
                        style={{ color: themeColors.charcoal }}
                      >
                        {countdown}
                      </p>
                      <div
                        className="mt-3 h-1.5 overflow-hidden rounded-full"
                        style={{ backgroundColor: pageBg }}
                      >
                        <div
                          className="h-full w-1/3 rounded-full transition-[width] duration-1000 ease-linear"
                          style={{ backgroundColor: themeColors.green }}
                        />
                      </div>
                    </div>
                  )}

                  {feature.kind === 'template' && (
                    <div className="mt-6 space-y-2">
                      {['Transportation', 'Emergency Fund', 'Tech Gear'].map(
                        (label, i) => (
                          <div
                            key={label}
                            className="flex items-center justify-between rounded-xl border px-3 py-2.5"
                            style={{
                              borderColor: hairline,
                              backgroundColor:
                                i === 0 ? greenSoftBg : pageBg,
                            }}
                          >
                            <span
                              className="text-xs font-semibold"
                              style={{
                                color:
                                  i === 0
                                    ? themeColors.green
                                    : themeColors.charcoal,
                              }}
                            >
                              {label}
                            </span>
                            <span
                              className="text-[11px]"
                              style={{
                                color:
                                  i === 0
                                    ? themeColors.green
                                    : themeColors.mid,
                              }}
                            >
                              {i === 0 ? 'Selected' : 'Available'}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {feature.kind === 'automation' && (
                    <div
                      className="mt-6 rounded-2xl border px-4 py-3"
                      style={{
                        borderColor: hairline,
                        backgroundColor: sunkenBg,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: greenSoftBg,
                            color: themeColors.green,
                          }}
                        >
                          <RefreshCw size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold">Automation on</p>
                          <p
                            className="mt-0.5 truncate text-[11px]"
                            style={{ color: themeColors.mid }}
                          >
                            Follows your refill rule
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECURITY                                                    */}
      {/* ============================================================ */}
      <section
        id="security"
        className="border-b"
        style={{ backgroundColor: pageBg, borderColor: hairline }}
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow color={themeColors.green}>Security &amp; privacy</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Your money is only as safe as the app behind it.
            </h2>
            <p
              className="mt-4 text-base leading-7"
              style={{ color: themeColors.mid }}
            >
              MOVA is built so that access, payments, and balance changes are
              verified at every step — not just at sign-in.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {securityItems.map(({ icon: Icon, title, copy }) => (
              <article
                key={title}
                className="rounded-2xl border p-6"
                style={{
                  backgroundColor: pageBg,
                  borderColor: hairline,
                  boxShadow: shadowCard,
                }}
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: greenSoftBg,
                    color: themeColors.green,
                  }}
                >
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 text-base font-semibold tracking-tight">
                  {title}
                </h3>
                <p
                  className="mt-2 text-sm leading-6"
                  style={{ color: themeColors.mid }}
                >
                  {copy}
                </p>
              </article>
            ))}
          </div>

          <div
            className="mt-10 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-start sm:gap-6 sm:p-6"
            style={{ backgroundColor: sunkenBg, borderColor: hairline }}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: pageBg,
                color: themeColors.green,
                border: `1px solid ${hairline}`,
              }}
            >
              <ShieldCheck size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold sm:text-base">
                We store only what we need — and never in plaintext.
              </p>
              <p
                className="mt-1 text-xs leading-6 sm:text-sm"
                style={{ color: themeColors.mid }}
              >
                MOVA does not store your full bank details, card numbers, or
                PINs in readable form. Sensitive values are held as secure
                hashes or provider tokens, and we never log access tokens,
                OTPs, or raw payment payloads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS                                                */}
      {/* ============================================================ */}
      <section
        id="how-it-works"
        className="border-b"
        style={{
          backgroundColor: altBg,
          borderColor: hairline,
        }}
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow color={themeColors.green}>Simple by design</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              A few small steps.
              <br />
              A plan you can follow.
            </h2>
            <p
              className="mt-4 text-base leading-7"
              style={{ color: themeColors.mid }}
            >
              Create a wallet around something that matters to you. Then let
              your release schedule do the remembering.
            </p>
          </div>

          <div className="mt-14 grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div className="space-y-3">
              {workflowSteps.map(({ id, step, title, copy, icon: Icon }) => {
                const isActive = id === activeStep
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveStep(id)}
                    aria-pressed={isActive}
                    className="flex w-full gap-4 rounded-2xl border p-5 text-left transition-colors sm:gap-5 sm:p-6"
                    style={{
                      backgroundColor: isActive ? pageBg : altBg,
                      borderColor: isActive ? themeColors.green : hairline,
                      boxShadow: isActive ? shadowCard : 'none',
                    }}
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors"
                      style={{
                        backgroundColor: isActive
                          ? themeColors.green
                          : greenSoftBg,
                        color: isActive ? '#FFFFFF' : themeColors.green,
                      }}
                    >
                      <Icon size={19} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span
                          className="font-mono text-xs font-semibold"
                          style={{ color: themeColors.light }}
                        >
                          {step}
                        </span>
                        <h3 className="text-base font-semibold tracking-tight">
                          {title}
                        </h3>
                      </div>
                      <p
                        className="mt-1.5 text-sm leading-6"
                        style={{ color: themeColors.mid }}
                      >
                        {copy}
                      </p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="mt-1 shrink-0"
                      style={{
                        color: isActive
                          ? themeColors.green
                          : themeColors.light,
                      }}
                    />
                  </button>
                )
              })}

              <button
                type="button"
                onClick={() => goTo('/how-it-works', 'How it works')}
                className="group inline-flex items-center gap-2 px-5 pt-3 text-sm font-semibold"
                style={{ color: themeColors.green }}
              >
                Explore how MOVA works
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </div>

            <div
              className="relative rounded-3xl border p-6 sm:p-8"
              style={{
                backgroundColor: pageBg,
                borderColor: hairline,
                boxShadow: shadowLifted,
              }}
            >
              <div className="flex items-center justify-between">
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: themeColors.mid }}
                >
                  {activeStepData.preview.heading}
                </p>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{
                    backgroundColor: greenSoftBg,
                    color: themeColors.green,
                  }}
                >
                  Step {activeStepData.step}
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
                {activeStepData.preview.title}
              </h3>
              <p
                className="amount mt-1 text-sm font-medium"
                style={{ color: themeColors.green }}
              >
                {activeStepData.preview.meta}
              </p>

              <div
                className="mt-6 h-2 overflow-hidden rounded-full"
                style={{ backgroundColor: sunkenBg }}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{
                    width: `${activeStepData.preview.progress}%`,
                    backgroundColor: themeColors.green,
                  }}
                />
              </div>

              <div className="mt-6 space-y-2">
                {activeStepData.preview.rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-2xl border px-4 py-3.5"
                    style={{
                      borderColor: hairline,
                      backgroundColor: sunkenBg,
                    }}
                  >
                    <span
                      className="text-xs font-medium"
                      style={{ color: themeColors.mid }}
                    >
                      {row.label}
                    </span>
                    <span className="amount text-sm font-semibold">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="mt-6 flex items-center gap-3 rounded-2xl px-4 py-3.5"
                style={{ backgroundColor: greenSoftBg }}
              >
                <CheckCircle2
                  size={17}
                  className="shrink-0"
                  style={{ color: themeColors.green }}
                />
                <p
                  className="text-xs font-semibold sm:text-sm"
                  style={{ color: themeColors.green }}
                >
                  MOVA handles this automatically — no manual steps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TESTIMONIALS                                                */}
      {/* ============================================================ */}
      <section
        className="border-b"
        style={{ backgroundColor: pageBg, borderColor: hairline }}
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow color={themeColors.green}>Loved by savers</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              People who finally stuck to the plan.
            </h2>
            <p
              className="mt-4 text-base leading-7"
              style={{ color: themeColors.mid }}
            >
              Real feedback from people using MOVA wallets every day.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <article
                key={t.name}
                className="flex flex-col rounded-2xl border p-6 sm:p-7"
                style={{
                  backgroundColor: pageBg,
                  borderColor: hairline,
                  boxShadow: shadowCard,
                }}
              >
                <Quote
                  size={26}
                  className="shrink-0 opacity-25"
                  style={{ color: themeColors.green }}
                />

                <div className="mt-4 flex items-center gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      style={{ color: themeColors.green }}
                      fill={themeColors.green}
                    />
                  ))}
                </div>

                <p
                  className="mt-4 flex-1 text-sm leading-6 sm:text-[15px] sm:leading-7"
                  style={{ color: themeColors.charcoal }}
                >
                  “{t.quote}”
                </p>

                <div
                  className="mt-6 flex items-center gap-3 border-t pt-5"
                  style={{ borderColor: hairline }}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: greenSoftBg,
                      color: themeColors.green,
                    }}
                  >
                    {t.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold">{t.name}</p>
                      <CheckCircle2
                        size={13}
                        className="shrink-0"
                        style={{ color: themeColors.green }}
                        aria-label="Verified user"
                      />
                    </div>
                    <p
                      className="truncate text-xs"
                      style={{ color: themeColors.mid }}
                    >
                      {t.role}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FAQ                                                         */}
      {/* ============================================================ */}
      <section
        id="faq"
        className="border-b"
        style={{ backgroundColor: altBg, borderColor: hairline }}
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow color={themeColors.green}>Questions, answered</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Things people ask before they try MOVA.
            </h2>
            <p
              className="mt-4 text-base leading-7"
              style={{ color: themeColors.mid }}
            >
              Short, honest answers — no small print, no surprises.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl space-y-3">
            {faqs.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div
                  key={item.q}
                  className="rounded-2xl border"
                  style={{
                    backgroundColor: pageBg,
                    borderColor: isOpen ? themeColors.green : hairline,
                    boxShadow: isOpen ? shadowCard : 'none',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                  >
                    <span className="text-sm font-semibold sm:text-base">
                      {item.q}
                    </span>
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: isOpen ? themeColors.green : sunkenBg,
                        color: isOpen ? '#FFFFFF' : themeColors.mid,
                      }}
                    >
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      className="border-t px-5 pb-5 pt-4 sm:px-6 sm:pb-6"
                      style={{ borderColor: hairline }}
                    >
                      <p
                        className="text-sm leading-6"
                        style={{ color: themeColors.mid }}
                      >
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CONTACT                                                     */}
      {/* ============================================================ */}
      <section
        id="contact"
        className="border-b"
        style={{ backgroundColor: pageBg, borderColor: hairline }}
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow color={themeColors.green}>Get in touch</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              We&rsquo;d love to hear from you.
            </h2>
            <p
              className="mt-4 text-base leading-7"
              style={{ color: themeColors.mid }}
            >
              Questions, feedback, or partnership enquiries &mdash; the MOVA
              team reads every message.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contactMethods.map(({ icon: Icon, title, value, detail, href }) => (
              <a
                key={title}
                href={href}
                className="group rounded-2xl border p-6 transition-colors"
                style={{
                  backgroundColor: pageBg,
                  borderColor: hairline,
                  boxShadow: shadowCard,
                }}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: greenSoftBg,
                    color: themeColors.green,
                  }}
                >
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 text-base font-semibold tracking-tight sm:text-lg">
                  {title}
                </h3>
                <p
                  className="mt-2 text-sm font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  {value}
                </p>
                <p className="mt-1 text-xs" style={{ color: themeColors.mid }}>
                  {detail}
                </p>
              </a>
            ))}
          </div>

          {/* Support hours strip */}
          <div
            className="mt-10 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6"
            style={{ backgroundColor: sunkenBg, borderColor: hairline }}
          >
            <div className="flex items-start gap-4">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: pageBg,
                  color: themeColors.green,
                  border: `1px solid ${hairline}`,
                }}
              >
                <Clock size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Support hours</p>
                <p
                  className="mt-1 text-xs leading-6 sm:text-sm"
                  style={{ color: themeColors.mid }}
                >
                  Monday &ndash; Friday, 9:00am &ndash; 6:00pm WAT. Weekend
                  messages are answered on Monday.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleNav('#faq', 'FAQ')}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors sm:text-sm"
              style={{
                borderColor: hairlineStrong,
                color: themeColors.charcoal,
                backgroundColor: pageBg,
              }}
            >
              Read the FAQ
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA BANNER                                                  */}
      {/* ============================================================ */}
      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div
          className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl p-7 sm:p-10 lg:p-14"
          style={{
            backgroundColor: ctaBg,
            color: '#FFFFFF',
            boxShadow: shadowCta,
          }}
        >
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-white/70">
                Start with a plan that feels like yours
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                Ready to take more control of your money?
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                Open the app in your browser, set up your first wallet in under
                two minutes, preview the schedule, and let MOVA handle the rest.
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => goTo('/welcome', 'the app')}
                className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold transition-colors sm:text-base"
                style={{ color: themeColors.green }}
              >
                Go to app
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
              <a
                href="#how-it-works"
                className="inline-flex min-h-14 items-center justify-center rounded-full border px-7 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:text-base"
                style={{ borderColor: 'rgba(255,255,255,0.22)' }}
              >
                See how it works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                      */}
      {/* ============================================================ */}
      <footer
        className="border-t"
        style={{ borderColor: hairline, backgroundColor: pageBg }}
      >
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr] lg:gap-16">
            {/* Brand: logo + name */}
            <div className="max-w-sm">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2.5"
                aria-label="MOVA home"
              >
                <img
                  src={LOGO_URL}
                  alt="MOVA logo"
                  className="h-12 w-12 rounded-xl object-contain sm:h-14 sm:w-14"
                  loading="lazy"
                  draggable={false}
                />
                <span
                  className="font-mono text-2xl font-bold tracking-[-0.08em]"
                  style={{ color: themeColors.green }}
                >
                  MOVA
                </span>
              </button>

              <p
                className="mt-4 text-sm leading-6"
                style={{ color: themeColors.mid }}
              >
                Controlled-access wallets for money you want to keep for later.
                Fund it, set the rules, and let the schedule do the rest.
              </p>

              <div className="mt-6 flex items-center gap-3">
                {(['twitter', 'linkedin', 'github'] as const).map((name) => (
                  <a
                    key={name}
                    href="#"
                    aria-label={name}
                    className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                    style={{
                      borderColor: hairline,
                      color: themeColors.mid,
                    }}
                  >
                    <SocialIcon name={name} />
                  </a>
                ))}
              </div>
            </div>

            {/* 3 balanced link columns */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.14em]"
                    style={{ color: themeColors.charcoal }}
                  >
                    {col.title}
                  </p>
                  <ul className="mt-4 space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <button
                          type="button"
                          onClick={() => handleNav(link.to, link.label)}
                          className="text-sm transition-opacity hover:opacity-70"
                          style={{ color: themeColors.mid }}
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div
            className="mt-12 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: hairline }}
          >
            <p className="text-xs" style={{ color: themeColors.light }}>
              © {new Date().getFullYear()} MOVA. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <div className="inline-flex items-center gap-2">
                <StatusDot color={themeColors.green} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: themeColors.mid }}
                >
                  All systems operational
                </span>
              </div>
              <div
                className="inline-flex items-center gap-2"
                style={{ color: themeColors.light }}
              >
                <Globe size={14} />
                <span className="text-xs font-medium">
                  Web app · no download
                </span>
              </div>
              <div
                className="inline-flex items-center gap-2"
                style={{ color: themeColors.light }}
              >
                <Users size={14} />
                <span className="text-xs font-medium">
                  Built for the Nigerian Naira
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/*  REDIRECT MODAL                                              */}
      {/* ============================================================ */}
      {isRedirectOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-5"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="redirect-title"
          aria-describedby="redirect-desc"
          onClick={cancelRedirect}
        >
          <div
            className="w-full max-w-md rounded-3xl border p-6 sm:p-8"
            style={{
              backgroundColor: pageBg,
              borderColor: hairline,
              boxShadow: shadowCta,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: greenSoftBg,
                  color: themeColors.green,
                }}
              >
                <ArrowRight size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: themeColors.mid }}
                >
                  Redirecting
                </p>
                <h3
                  id="redirect-title"
                  className="mt-1 text-lg font-semibold tracking-tight sm:text-xl"
                >
                  Opening {pendingLabel || 'the app'}
                </h3>
                {pendingPath && (
                  <p
                    className="mt-1 text-xs"
                    style={{ color: themeColors.mid }}
                  >
                    Destination: {pendingPath}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={cancelRedirect}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors"
                style={{
                  borderColor: hairline,
                  color: themeColors.mid,
                }}
                aria-label="Cancel redirect"
              >
                <X size={16} />
              </button>
            </div>

            <p
              id="redirect-desc"
              className="mt-4 text-sm leading-6"
              style={{ color: themeColors.mid }}
            >
              You are about to be redirected to MOVA&rsquo;s main app — the
              web app where you sign in and manage your wallets. No download
              needed; it opens right in your browser.
            </p>

            <div
              className="mt-6 rounded-2xl border px-4 py-4"
              style={{
                borderColor: hairline,
                backgroundColor: sunkenBg,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: themeColors.mid }}
                >
                  Redirecting in
                </span>
                <StatusDot color={themeColors.green} />
              </div>
              <p
                className="amount mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
                style={{ color: themeColors.charcoal }}
              >
                {redirectLeft}s
              </p>
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full"
                style={{ backgroundColor: pageBg }}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-1000 ease-linear"
                  style={{
                    width: `${redirectProgress}%`,
                    backgroundColor: themeColors.green,
                  }}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={cancelRedirect}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border px-5 text-sm font-semibold transition-colors"
                style={{
                  borderColor: hairlineStrong,
                  backgroundColor: pageBg,
                  color: themeColors.charcoal,
                }}
              >
                Stay here
              </button>
              <button
                type="button"
                onClick={continueNow}
                className="group inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition-colors"
                style={{
                  backgroundColor: themeColors.green,
                  boxShadow: shadowBtn,
                }}
              >
                Continue now
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </div>

            <p
              className="mt-4 text-center text-[11px] leading-5"
              style={{ color: themeColors.light }}
            >
              Press Esc or click outside to stay on this page.
            </p>
          </div>
        </div>
      )}
    </main>
  )
}