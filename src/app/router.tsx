// src/app/router.tsx
import { createBrowserRouter } from 'react-router-dom'
import WelcomePage from '../pages/onboarding/WelcomePage'
import LoginPage from '../pages/auth/LoginPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import RegisterPage from '../pages/auth/RegisterPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import VerifyEmailPage from '../pages/auth/VerifyEmailPage'
import PinSetupPage from '../pages/auth/PinSetupPage'
import TermsPage from '../pages/legal/TermsPage'
import PrivacyPage from '../pages/legal/PrivacyPage'
import HowItWorksPage from '../pages/onboarding/HowItWorksPage'
import WalletsPage from '../pages/wallets/WalletsPage'
import WalletDetailPage from '../pages/wallets/WalletDetailPage'
import AddFundsPage from '../pages/add-funds/AddFundsPage'
import AnalyticsPage from '../pages/analytics/AnalyticsPage'
import UnusedMoneyPage from '../pages/wallets/UnusedMoneyPage'
import BreakWalletPage from '../pages/wallets/BreakWalletPage'
import NotFoundPage from '../pages/error/NotFoundPage'
import ForbiddenPage from '../pages/error/ForbiddenPage'
import SettingsPage from '../pages/settings/SettingsPage'
import SupportPage from '../pages/settings/SupportPage'
import ProfilePage from '../pages/profile/ProfilePage'
import BankPage from '../pages/bank/BankPage'
import SchedulePreview from '../pages/analytics/SchedulePreviewPage'
import CreateWallet from '../pages/wallets/CreateWallet'
import PinSetupGatePage from '../pages/profile/PinSetupGatePage'
import PaymentConfirmationPage from '../pages/add-funds/PaymentConfirmationPage'
import NotificationsPage from '../pages/notification/NotificationsPage'
import ChangePasswordPage from '../pages/profile/ChangePasswordPage'


export const router = createBrowserRouter([
  { path: '/', element: <WelcomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/pin-setup', element: <PinSetupPage /> },
  { path: '/terms', element: <TermsPage /> },
  { path: '/privacy', element: <PrivacyPage /> },
  { path: '/how-it-works', element: <HowItWorksPage /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/wallets', element: <WalletsPage /> },
  { path: '/create-wallet', element: <CreateWallet /> },
  { path: '/wallet/:walletId', element: <WalletDetailPage /> },
  { path: '/add-funds', element: <AddFundsPage /> },
  { path: '/analytics', element: <AnalyticsPage /> },
  { path: '/wallet/:walletId/unused-money', element: <UnusedMoneyPage /> },
  { path: '/wallet/:walletId/break-wallet', element: <BreakWalletPage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/support', element: <SupportPage /> },
  { path: '/bank', element: <BankPage /> },
  { path: '/payment/confirmation', element: <PaymentConfirmationPage /> },
  { path: '/pin-gate', element: <PinSetupGatePage /> },
  { path: '/calculate-release', element: <SchedulePreview /> },
  {
    path: '/notifications',
    element: <NotificationsPage />,
  },
  {
    path: '/change-password',
    element: <ChangePasswordPage />,
  },
  { path: '/403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage />, errorElement: <NotFoundPage /> },
])