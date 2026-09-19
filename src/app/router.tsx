// src/app/router.tsx
import { createBrowserRouter } from 'react-router-dom'

// ─── Onboarding / Public ────────────────────────────────
import WelcomePage from '../pages/onboarding/WelcomePage'
import HowItWorksPage from '../pages/onboarding/HowItWorksPage'
import AboutPage from '../pages/onboarding/AboutPage'

// ─── Auth ───────────────────────────────────────────────
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import VerifyEmailPage from '../pages/auth/VerifyEmailPage'
import PinSetupPage from '../pages/auth/PinSetupPage'

// ─── Legal ──────────────────────────────────────────────
import TermsPage from '../pages/legal/TermsPage'
import PrivacyPage from '../pages/legal/PrivacyPage'
// import ChargesPage from '../pages/legal/ChargesPage'

// ─── Dashboard ──────────────────────────────────────────
import DashboardPage from '../pages/dashboard/DashboardPage'
import ReleasesPage from '../pages/dashboard/ReleasesPage'

// ─── Wallets ────────────────────────────────────────────
import WalletsPage from '../pages/wallets/WalletsPage'
import CreateWallet from '../pages/wallets/CreateWallet'
import WalletDetailPage from '../pages/wallets/WalletDetailPage'
import WalletSettingsPage from '../pages/wallets/WalletSettingsPage'
import BreakWalletPage from '../pages/wallets/BreakWalletPage'
import WithdrawFromWalletPage from '../pages/wallets/WithdrawFromWalletPage'

// ─── Money movement ─────────────────────────────────────
import AddFundsPage from '../pages/add-funds/AddFundsPage'
import PaymentConfirmationPage from '../pages/add-funds/PaymentConfirmationPage'
import BankPage from '../pages/bank/BankPage'

// ─── Analytics ──────────────────────────────────────────
import AnalyticsPage from '../pages/analytics/AnalyticsPage'
import SchedulePreview from '../pages/analytics/SchedulePreviewPage'

// ─── Profile & Settings ─────────────────────────────────
import ProfilePage from '../pages/profile/ProfilePage'
import SettingsPage from '../pages/settings/SettingsPage'
import SupportPage from '../pages/settings/SupportPage'
import ChangePasswordPage from '../pages/profile/ChangePasswordPage'
import PinSetupGatePage from '../pages/profile/PinSetupGatePage'

// ─── Notifications ──────────────────────────────────────
import NotificationsPage from '../pages/notification/NotificationsPage'

// ─── Error pages ────────────────────────────────────────
import NotFoundPage from '../pages/error/NotFoundPage'
import ForbiddenPage from '../pages/error/ForbiddenPage'

export const router = createBrowserRouter([
  // ───────────────────────────────────────────────────────
  // Onboarding / Public
  // ───────────────────────────────────────────────────────
  { path: '/', element: <WelcomePage /> },
  { path: '/how-it-works', element: <HowItWorksPage /> },
  { path: '/about', element: <AboutPage /> },

  // ───────────────────────────────────────────────────────
  // Auth
  // ───────────────────────────────────────────────────────
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/pin-setup', element: <PinSetupPage /> },

  // ───────────────────────────────────────────────────────
  // Legal
  // ───────────────────────────────────────────────────────
  { path: '/terms', element: <TermsPage /> },
  { path: '/privacy', element: <PrivacyPage /> },
  // { path: '/charges', element: <ChargesPage /> },

  // ───────────────────────────────────────────────────────
  // Dashboard
  // ───────────────────────────────────────────────────────
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/releases', element: <ReleasesPage /> },

  // ───────────────────────────────────────────────────────
  // Wallets
  // ───────────────────────────────────────────────────────
  { path: '/wallets', element: <WalletsPage /> },
  { path: '/create-wallet', element: <CreateWallet /> },
  { path: '/wallet/:walletId', element: <WalletDetailPage /> },
  { path: '/wallet/:walletId/settings', element: <WalletSettingsPage /> },
  { path: '/wallet/:walletId/break-wallet', element: <BreakWalletPage /> },
  { path: '/wallet/:walletId/withdraw', element: <WithdrawFromWalletPage /> },

  
  // ───────────────────────────────────────────────────────
  // Money movement
  // ───────────────────────────────────────────────────────
  { path: '/add-funds', element: <AddFundsPage /> },
  { path: '/payment/confirmation', element: <PaymentConfirmationPage /> },
  { path: '/bank', element: <BankPage /> },

  // ───────────────────────────────────────────────────────
  // Analytics
  // ───────────────────────────────────────────────────────
  { path: '/analytics', element: <AnalyticsPage /> },
  { path: '/calculate-release', element: <SchedulePreview /> },

  // ───────────────────────────────────────────────────────
  // Profile & Settings
  // ───────────────────────────────────────────────────────
  { path: '/profile', element: <ProfilePage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '/support', element: <SupportPage /> },
  { path: '/change-password', element: <ChangePasswordPage /> },
  { path: '/pin-gate', element: <PinSetupGatePage /> },

  // ───────────────────────────────────────────────────────
  // Notifications
  // ───────────────────────────────────────────────────────
  { path: '/notifications', element: <NotificationsPage /> },

  // ───────────────────────────────────────────────────────
  // Errors
  // ───────────────────────────────────────────────────────
  { path: '/403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage />, errorElement: <NotFoundPage /> },
])