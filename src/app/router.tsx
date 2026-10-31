// src/app/router.tsx
import { createBrowserRouter } from 'react-router-dom'

// ─── Onboarding / Public ────────────────────────────────
import LandingPage from '../pages/onboarding/LandingPage'
import WelcomePage from '../pages/onboarding/WelcomePage'
import HowItWorksPage from '../pages/onboarding/HowItWorksPage'
import AboutPage from '../pages/onboarding/AboutPage'

// ─── Auth ───────────────────────────────────────────────
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import VerifyEmailPage from '../pages/auth/VerifyEmailPage'
import PinSetupPage from '../pages/auth/PinSetupPage'
import VerifyBvnPage from '../pages/auth/VerifyBvnPage'

// ─── Legal ──────────────────────────────────────────────
import TermsPage from '../pages/legal/TermsPage'
import PrivacyPage from '../pages/legal/PrivacyPage'

// ─── Dashboard ──────────────────────────────────────────
import DashboardPage from '../pages/dashboard/DashboardPage'
import ReleasesPage from '../pages/dashboard/ReleasesPage'
import ServicesPage from '../pages/dashboard/ServicesPage'
import WithdrawalPage from '../pages/dashboard/WithdrawalPage'

// ─── Wallets ────────────────────────────────────────────
import WalletsPage from '../pages/wallets/WalletsPage'
import WalletTypePicker from '../pages/wallets/WalletTypePicker'
import WalletDetailPage from '../pages/wallets/WalletDetailPage'
import WalletEditPage from '../pages/wallets/WalletEditPage'
import BreakWalletPage from '../pages/wallets/BreakWalletPage'
import WithdrawFromWalletPage from '../pages/wallets/WithdrawFromWalletPage'
import WalletAutomationPage from '../pages/wallets/WalletAutomationPage'
import TemplatesPage from '../pages/wallets/TemplatesPage'
import CreateWallet from '../pages/wallets/CreateWallet'


// ---- Trustee Wallets ─────────────────────────────────────
import CreateWalletTrusteeWalletPage from '../pages/trustee-wallet/CreateWalletTrusteeWalletPage'
import TrusteePage from '../pages/trustee-wallet/TrusteePage'
import TrusteeWalletDetailPage from '../pages/trustee-wallet/TrusteeWalletDetailPage'
import TrusteeRequestRelease from '../pages/trustee-wallet/TrusteeRequestRelease'
import TrusteeReleaseConsentPage from '../pages/trustee-wallet/TrusteeReleaseConsentPage'
import TrusteeCreateConsentPage from '../pages/trustee-wallet/TrusteeCreateConsentPage'


// ---- Circle Wallets ─────────────────────────────────────
import CreateCircle from '../pages/circle-wallet/CreateCircle'
import CircleConsentPage from '../pages/circle-wallet/CircleConsentPage'
import CircleDetailPage from '../pages/circle-wallet/CircleDetailPage'





// ─── Money movement ─────────────────────────────────────
import AddFundsPage from '../pages/add-funds/AddFundsPage'
import PaymentConfirmationPage from '../pages/add-funds/PaymentConfirmationPage'
import BankPage from '../pages/bank/BankPage'
import TransactionsPage from '../pages/add-funds/TransactionsPage'

// ─── Analytics ──────────────────────────────────────────
import AnalyticsPage from '../pages/analytics/AnalyticsPage'
import SchedulePreview from '../pages/analytics/SchedulePreviewPage'

// ─── Profile & Settings ─────────────────────────────────
import ProfilePage from '../pages/profile/ProfilePage'
import SettingsPage from '../pages/settings/SettingsPage'
import SupportPage from '../pages/settings/SupportPage'
import ChangePasswordPage from '../pages/profile/ChangePasswordPage'
import PinSetupGatePage from '../pages/profile/PinSetupGatePage'
import FeedbackPage from '../pages/profile/FeedbackPage'
import DeleteAccountPage from '../pages/profile/DeleteAccountPage'

// ─── Notifications ──────────────────────────────────────
import NotificationsPage from '../pages/notification/NotificationsPage'

// ─── Error pages ────────────────────────────────────────
import NotFoundPage from '../pages/error/NotFoundPage'
import ForbiddenPage from '../pages/error/ForbiddenPage'
import LockedPage from '../pages/error/LockedPage'
import RouteErrorPage from '../pages/error/RouteErrorPage'

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
      // ───────────────────────────────────────────────────
      // Onboarding / Public
      // ───────────────────────────────────────────────────
      { path: '/', element: <LandingPage /> },
      { path: '/welcome', element: <WelcomePage /> },
      { path: '/how-it-works', element: <HowItWorksPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/support', element: <SupportPage /> },


      // ───────────────────────────────────────────────────
      // Auth
      // ───────────────────────────────────────────────────
      { path: '/auth/login', element: <LoginPage /> },
      { path: '/auth/register', element: <RegisterPage /> },
      { path: '/auth/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/auth/verify-email', element: <VerifyEmailPage /> },
      { path: '/auth/pin-setup', element: <PinSetupPage /> },
      { path: '/auth/verify-bvn', element: <VerifyBvnPage /> },

      // ───────────────────────────────────────────────────
      // Legal
      // ───────────────────────────────────────────────────
      { path: '/legal/terms', element: <TermsPage /> },
      { path: '/legal/privacy', element: <PrivacyPage /> },

      // ───────────────────────────────────────────────────
      // Dashboard
      // ───────────────────────────────────────────────────
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/dashboard/releases', element: <ReleasesPage /> },
      { path: '/dashboard/services', element: <ServicesPage /> },
      { path: '/dashboard/withdraw', element: <WithdrawalPage /> },

      // ───────────────────────────────────────────────────
      // Wallets
      // ───────────────────────────────────────────────────
      { path: '/dashboard/wallets', element: <WalletsPage /> },
      { path: '/dashboard/create-wallet', element: <WalletTypePicker /> },
      { path: '/dashboard/scheduled/wallet/:walletId', element: <WalletDetailPage /> },
      { path: '/dashboard/scheduled/wallet/:walletId/edit', element: <WalletEditPage /> },
      { path: '/dashboard/scheduled/wallet/:walletId/break-wallet', element: <BreakWalletPage /> },
      { path: '/dashboard/scheduled/wallet/:walletId/withdraw', element: <WithdrawFromWalletPage /> },
      { path: '/dashboard/scheduled/wallet/:walletId/automation', element: <WalletAutomationPage /> },
      { path: '/dashboard/templates', element: <TemplatesPage /> },
      { path: '/dashboard/create-wallet/scheduled', element: <CreateWallet /> },
      

      // ───────────────────────────────────────────────────
      // Trustee Wallets
      // ───────────────────────────────────────────────────
      { path: '/dashboard/trustees', element: <TrusteePage /> },
      { path: '/dashboard/create-wallet/trustee', element: <CreateWalletTrusteeWalletPage /> },
      { path: '/dashboard/trustee/wallet/:walletId', element: <TrusteeWalletDetailPage /> },
      { path: '/dashboard/trustee/wallet/:walletId/request-release', element: <TrusteeRequestRelease /> },
      { path: '/trustee/wallet/release/:token', element: <TrusteeReleaseConsentPage /> },
      { path: '/trustee/wallet/consent/:token', element: <TrusteeCreateConsentPage /> },
      
      // ───────────────────────────────────────────────────
      // Circle Wallets
      // ───────────────────────────────────────────────────
      { path: '/dashboard/create-wallet/circle', element: <CreateCircle /> },
      { path: '/dashboard/circles/consent', element: <CircleConsentPage /> },
      { path: '/dashboard/circles/details/:circleId', element: <CircleDetailPage /> },



      // ───────────────────────────────────────────────────
      // Money movement
      // ───────────────────────────────────────────────────
      { path: '/dashboard/add-funds', element: <AddFundsPage /> },
      { path: '/dashboard/payment/confirmation', element: <PaymentConfirmationPage /> },
      { path: '/dashboard/bank', element: <BankPage /> },
      { path: '/dashboard/transactions', element: <TransactionsPage /> },

      // ───────────────────────────────────────────────────
      // Analytics
      // ───────────────────────────────────────────────────
      { path: '/dashboard/analytics', element: <AnalyticsPage /> },
      { path: '/dashboard/calculate-release', element: <SchedulePreview /> },

      // ───────────────────────────────────────────────────
      // Profile & Settings
      // ───────────────────────────────────────────────────
      { path: '/dashboard/profile', element: <ProfilePage /> },
      { path: '/dashboard/settings', element: <SettingsPage /> },
      { path: '/dashboard/change-password', element: <ChangePasswordPage /> },
      { path: '/dashboard/pin-gate', element: <PinSetupGatePage /> },
      { path: '/dashboard/feedback', element: <FeedbackPage /> },
      { path: '/dashboard/delete-account', element: <DeleteAccountPage /> },

      // ───────────────────────────────────────────────────
      // Notifications
      // ───────────────────────────────────────────────────
      { path: '/dashboard/notifications', element: <NotificationsPage /> },

      // ───────────────────────────────────────────────────
      // Errors
      // ───────────────────────────────────────────────────
      { path: '/error/403', element: <ForbiddenPage /> },
      { path: '/error/423', element: <LockedPage /> },

      // 404 — any URL that doesn't match above
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])