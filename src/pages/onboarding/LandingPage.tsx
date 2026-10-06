import {
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  LockKeyhole,
  Menu,
  Moon,
  Sun,
  WalletCards,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

const navLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Why MOVA', href: '#why-mova' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const userData =
      sessionStorage.getItem('userData') ??
      localStorage.getItem('userData')

    if (userData) {
      navigate('/dashboard')
    }
  }, [navigate])

  return (
    <main
      className="min-h-screen overflow-hidden"
      style={{
        backgroundColor: themeColors.card,
        color: themeColors.charcoal,
      }}
    >
      <header
        className="relative z-20 border-b"
        style={{
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <Link
            to="/"
            className="flex items-center gap-2.5"
            aria-label="MOVA home"
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: themeColors.green,
                color: '#FFFFFF',
              }}
            >
              <WalletCards size={21} strokeWidth={2.2} />
            </span>
            <span
              className="font-mono text-[22px] font-bold tracking-[-0.08em]"
              style={{ color: themeColors.green }}
            >
              MOVA
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-9 md:flex"
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
            <Link
              to="/about"
              className="text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: themeColors.mid }}
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:opacity-75"
              style={{
                backgroundColor: themeColors.background,
                color: themeColors.charcoal,
              }}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              to="/login"
              className="hidden rounded-full px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-70 sm:inline-flex"
              style={{ color: themeColors.charcoal }}
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="hidden rounded-full px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 sm:inline-flex"
              style={{ backgroundColor: themeColors.green }}
            >
              Get started
            </Link>
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full md:hidden"
              style={{
                backgroundColor: themeColors.background,
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
            className="absolute inset-x-0 top-full border-b px-5 py-4 shadow-lg md:hidden"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
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
              <Link
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium"
                style={{ color: themeColors.charcoal }}
              >
                About
              </Link>
              <div
                className="mt-2 grid grid-cols-2 gap-3 border-t pt-4"
                style={{ borderColor: themeColors.border }}
              >
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full border px-4 py-3 text-center text-sm font-semibold"
                  style={{
                    borderColor: themeColors.border,
                    color: themeColors.charcoal,
                  }}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full px-4 py-3 text-center text-sm font-semibold text-white"
                  style={{ backgroundColor: themeColors.green }}
                >
                  Get started
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      <section
        className="relative"
        style={{ backgroundColor: themeColors.background }}
      >
        <div
          className="pointer-events-none absolute -right-36 -top-40 h-[520px] w-[520px] rounded-full blur-3xl"
          style={{
            backgroundColor: isDark
              ? 'rgba(85, 217, 148, 0.08)'
              : 'rgba(23, 107, 69, 0.08)',
          }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_0.95fr] lg:gap-16 lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <div
              className="mb-7 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold sm:text-sm"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
                color: themeColors.green,
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: themeColors.green }}
              />
              Meet a calmer way to manage money
            </div>
            <h1 className="max-w-[680px] text-[clamp(2.75rem,7vw,5.4rem)] font-semibold leading-[1.02] tracking-[-0.065em]">
              Your money.
              <br />
              <span style={{ color: themeColors.green }}>Your timing.</span>
            </h1>
            <p
              className="mt-6 max-w-xl text-base leading-7 sm:text-lg sm:leading-8"
              style={{ color: themeColors.mid }}
            >
              Set money aside in a MOVA wallet, choose how and when it is
              released, and make your spending plan easier to stick to.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/register"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-7 text-base font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: themeColors.green,
                  boxShadow: isDark
                    ? '0 12px 28px rgba(0, 0, 0, 0.25)'
                    : '0 12px 28px rgba(23, 107, 69, 0.2)',
                }}
              >
                Create your account
                <ArrowRight size={18} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex min-h-14 items-center justify-center rounded-full border px-7 text-base font-semibold transition-colors hover:opacity-75"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                  color: themeColors.charcoal,
                }}
              >
                See how it works
              </a>
            </div>
            <div
              className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium sm:text-sm"
              style={{ color: themeColors.mid }}
            >
              <span className="inline-flex items-center gap-2">
                <Check size={16} style={{ color: themeColors.green }} />
                Set your own release rules
              </span>
              <span className="inline-flex items-center gap-2">
                <Check size={16} style={{ color: themeColors.green }} />
                Start with a wallet template
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[540px]">
            <div
              className="absolute -left-5 top-14 hidden h-28 w-28 rounded-full sm:block"
              style={{
                backgroundColor: isDark
                  ? 'rgba(85, 217, 148, 0.12)'
                  : 'rgba(32, 136, 90, 0.12)',
              }}
            />
            <div
              className="absolute -bottom-5 -right-3 hidden h-32 w-32 rounded-full sm:block"
              style={{
                backgroundColor: isDark
                  ? 'rgba(85, 217, 148, 0.1)'
                  : 'rgba(32, 136, 90, 0.1)',
              }}
            />
            <div
              className="relative rounded-[28px] border p-4 shadow-2xl sm:rounded-[34px] sm:p-6"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
                boxShadow: isDark
                  ? '0 30px 80px rgba(0, 0, 0, 0.3)'
                  : '0 30px 80px rgba(17, 24, 39, 0.12)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-medium sm:text-sm"
                    style={{ color: themeColors.mid }}
                  >
                    Your MOVA wallet
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">
                    A plan that feels good.
                  </h2>
                </div>
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: themeColors.greenLight,
                    color: themeColors.green,
                  }}
                >
                  <WalletCards size={20} />
                </span>
              </div>

              <div
                className="mt-6 rounded-[22px] p-5 sm:p-6"
                style={{
                  backgroundColor: themeColors.green,
                  color: '#FFFFFF',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/80">
                    Transportation
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    Active
                  </span>
                </div>
                <p className="amount mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                  ₦30,000
                </p>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-white/70">Releases daily</p>
                    <p className="amount mt-1 text-lg font-semibold">₦1,000</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/70">Next release</p>
                    <p className="mt-1 text-sm font-semibold">On schedule</p>
                  </div>
                </div>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full w-2/3 rounded-full bg-white" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div
                  className="rounded-2xl border p-4"
                  style={{ borderColor: themeColors.border }}
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: themeColors.greenLight,
                      color: themeColors.green,
                    }}
                  >
                    <LockKeyhole size={17} />
                  </span>
                  <p className="mt-3 text-sm font-semibold">Money set aside</p>
                  <p className="mt-1 text-xs" style={{ color: themeColors.mid }}>
                    Keep your goals in focus
                  </p>
                </div>
                <div
                  className="rounded-2xl border p-4"
                  style={{ borderColor: themeColors.border }}
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: themeColors.greenLight,
                      color: themeColors.green,
                    }}
                  >
                    <CalendarDays size={17} />
                  </span>
                  <p className="mt-3 text-sm font-semibold">Your schedule</p>
                  <p className="mt-1 text-xs" style={{ color: themeColors.mid }}>
                    Releases on your terms
                  </p>
                </div>
              </div>

              <div
                className="mt-4 flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ backgroundColor: themeColors.background }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: themeColors.card,
                    color: themeColors.green,
                  }}
                >
                  <ArrowDownToLine size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold sm:text-sm">
                    Your next release is on its way
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: themeColors.mid }}>
                    MOVA follows the schedule you set
                  </p>
                </div>
                <Clock3
                  size={17}
                  className="shrink-0"
                  style={{ color: themeColors.green }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="why-mova"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="text-sm font-semibold uppercase tracking-[0.16em]"
            style={{ color: themeColors.green }}
          >
            More intention. Less impulse.
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Make your money work with your plans.
          </h2>
          <p
            className="mt-4 text-base leading-7"
            style={{ color: themeColors.mid }}
          >
            Give the money you are saving a little structure, without losing
            sight of what it is for.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: LockKeyhole,
              title: 'Put money aside',
              copy: 'Move money into a wallet so it is not all available to spend at once.',
            },
            {
              icon: CalendarDays,
              title: 'Set your schedule',
              copy: 'Choose the amount and timing that make sense for your plans.',
            },
            {
              icon: ArrowDownToLine,
              title: 'Stay in control',
              copy: 'Your wallet follows the release rules you set, with a clear view of what is next.',
            },
          ].map(({ icon: Icon, title, copy }, index) => (
            <article
              key={title}
              className="rounded-[24px] border p-6 sm:p-7"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: themeColors.greenLight,
                    color: themeColors.green,
                  }}
                >
                  <Icon size={22} />
                </span>
                <span
                  className="font-mono text-sm font-medium"
                  style={{ color: themeColors.light }}
                >
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6" style={{ color: themeColors.mid }}>
                {copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24"
        style={{ backgroundColor: themeColors.background }}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <p
              className="text-sm font-semibold uppercase tracking-[0.16em]"
              style={{ color: themeColors.green }}
            >
              Simple by design
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              A few small steps.
              <br />
              A plan you can follow.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7" style={{ color: themeColors.mid }}>
              Create a wallet around something that matters to you. Then let
              your release schedule do the remembering.
            </p>
            <Link
              to="/how-it-works"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: themeColors.green }}
            >
              Explore how MOVA works <ArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-4">
            {[
              {
                title: 'Choose what you are saving for',
                copy: 'Create a wallet for a goal, an upcoming bill, or everyday spending.',
              },
              {
                title: 'Decide how money is released',
                copy: 'Set your release amount and schedule to match your plan.',
              },
              {
                title: 'Let MOVA follow your rules',
                copy: 'Check in on your wallet and see what is coming up next.',
              },
            ].map(({ title, copy }, index) => (
              <article
                key={title}
                className="flex gap-4 rounded-2xl border p-5 sm:gap-5 sm:p-6"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: themeColors.greenLight,
                    color: themeColors.green,
                  }}
                >
                  0{index + 1}
                </span>
                <div>
                  <h3 className="text-base font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-6" style={{ color: themeColors.mid }}>
                    {copy}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div
          className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[28px] p-7 sm:rounded-[36px] sm:p-10 md:flex-row md:items-center lg:p-14"
          style={{
            backgroundColor: themeColors.green,
            color: '#FFFFFF',
          }}
        >
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-white/75">
              Start with a plan that feels like yours
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Ready to take more control of your money?
            </h2>
          </div>
          <Link
            to="/register"
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold transition-transform hover:-translate-y-0.5 sm:text-base"
            style={{ color: themeColors.green }}
          >
            Get started <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer
        className="border-t"
        style={{ borderColor: themeColors.border }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <Link to="/" className="inline-flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{
                backgroundColor: themeColors.green,
                color: '#FFFFFF',
              }}
            >
              <WalletCards size={17} />
            </span>
            <span
              className="font-mono text-lg font-bold tracking-[-0.08em]"
              style={{ color: themeColors.green }}
            >
              MOVA
            </span>
          </Link>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link
              to="/about"
              className="hover:opacity-70"
              style={{ color: themeColors.mid }}
            >
              About
            </Link>
            <Link
              to="/terms"
              className="hover:opacity-70"
              style={{ color: themeColors.mid }}
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="hover:opacity-70"
              style={{ color: themeColors.mid }}
            >
              Privacy
            </Link>
            <Link
              to="/login"
              className="hover:opacity-70"
              style={{ color: themeColors.mid }}
            >
              Log in
            </Link>
          </nav>
          <p className="text-xs" style={{ color: themeColors.light }}>
            © {new Date().getFullYear()} MOVA
          </p>
        </div>
      </footer>
    </main>
  )
}
