/**
 * Mirror of Mova.Domain.Enums.PinChallengeType (C#).
 *
 * WIRE FORMAT:
 * The backend uses JsonStringEnumConverter with JsonNamingPolicy.CamelCase,
 * so enum values travel as camelCase strings on the wire.
 *   C# PinChallengeType.CreateWallet    -> "createWallet"
 *   C# PinChallengeType.AddBankAccount  -> "addBankAccount"
 *
 * Deserialization is case-insensitive on read, but serialization is NOT.
 * Always send the exact camelCase strings below.
 *
 * NOTE: using `as const` object + derived union instead of `enum` because
 * `enum` is not allowed under `erasableSyntaxOnly` (TS 5.8+).
 */

export const PinChallengeType = {
  CreateWallet: 'createWallet',
  BankAccountDeletion: 'bankAccountDeletion',
  AddBankAccount: 'addBankAccount',
  AccountDeletion: 'accountDeletion',
  ManualTransferToBank: 'manualTransferToBank',
  ManualPayUtilities: 'manualPayUtilities',
  BreakWallet: 'breakWallet',
  PausedWallet: 'pausedWallet',
  UnpausedWallet: 'unpausedWallet',
  RestartWallet: 'restartWallet',
  LinkBankAccountToWallet: 'linkBankAccountToWallet',
  WalletAutomation: 'walletAutomation',
  DeleteTrustee: 'deleteTrustee',
  CreateTrustee: 'createTrustee',
  RequestRelease: 'requestRelease',
  CreateWalletTrustee: 'createWalletTrustee',
  ChangeTransactionPin: 'changeTransactionPin',
} as const;

/**
 * Union type of all valid values — this is what you use in type positions,
 * exactly like you'd use the enum name before.
 */
export type PinChallengeType =
  (typeof PinChallengeType)[keyof typeof PinChallengeType];

export const PinChallengeTypeNumeric: Record<PinChallengeType, number> = {
  [PinChallengeType.CreateWallet]: 1,
  [PinChallengeType.BankAccountDeletion]: 2,
  [PinChallengeType.AddBankAccount]: 3,
  [PinChallengeType.AccountDeletion]: 4,
  [PinChallengeType.ManualTransferToBank]: 5,
  [PinChallengeType.ManualPayUtilities]: 6,
  [PinChallengeType.BreakWallet]: 7,
  [PinChallengeType.PausedWallet]: 8,
  [PinChallengeType.UnpausedWallet]: 9,
  [PinChallengeType.RestartWallet]: 10,
  [PinChallengeType.LinkBankAccountToWallet]: 11,
  [PinChallengeType.WalletAutomation]: 12,
  [PinChallengeType.DeleteTrustee]: 13,
  [PinChallengeType.CreateTrustee]: 14,
  [PinChallengeType.RequestRelease]: 15,
  [PinChallengeType.CreateWalletTrustee]: 16,
  [PinChallengeType.ChangeTransactionPin]: 17,
};

export const PinChallengeTypeLabel: Record<PinChallengeType, string> = {
  [PinChallengeType.CreateWallet]: 'Create wallet',
  [PinChallengeType.BankAccountDeletion]: 'Delete bank account',
  [PinChallengeType.AddBankAccount]: 'Add bank account',
  [PinChallengeType.AccountDeletion]: 'Delete account',
  [PinChallengeType.ManualTransferToBank]: 'Transfer to bank',
  [PinChallengeType.ManualPayUtilities]: 'Pay utilities',
  [PinChallengeType.BreakWallet]: 'Break wallet',
  [PinChallengeType.PausedWallet]: 'Pause wallet',
  [PinChallengeType.UnpausedWallet]: 'Unpause wallet',
  [PinChallengeType.RestartWallet]: 'Restart wallet',
  [PinChallengeType.LinkBankAccountToWallet]: 'Link bank to wallet',
  [PinChallengeType.WalletAutomation]: 'Wallet automation',
  [PinChallengeType.DeleteTrustee]: 'Delete trustee',
  [PinChallengeType.CreateTrustee]: 'Create trustee',
  [PinChallengeType.RequestRelease]: 'Request Release',
  [PinChallengeType.CreateWalletTrustee]: 'Create wallet trustee',
  [PinChallengeType.ChangeTransactionPin]: 'Change transaction PIN',
};

const VERIFY_ENDPOINT_ALLOWED: ReadonlySet<PinChallengeType> = new Set([
  PinChallengeType.CreateWallet,
  PinChallengeType.BankAccountDeletion,
  PinChallengeType.AddBankAccount,
  PinChallengeType.ManualTransferToBank,
  PinChallengeType.ManualPayUtilities,
  PinChallengeType.BreakWallet,
  PinChallengeType.PausedWallet,
  PinChallengeType.UnpausedWallet,
  PinChallengeType.RestartWallet,
  PinChallengeType.LinkBankAccountToWallet,
  PinChallengeType.WalletAutomation,
  PinChallengeType.DeleteTrustee,
  PinChallengeType.CreateTrustee,
  PinChallengeType.RequestRelease,
  PinChallengeType.CreateWalletTrustee,
  PinChallengeType.ChangeTransactionPin
]);

export const isAllowedOnVerifyEndpoint = (
  type: PinChallengeType,
): boolean => VERIFY_ENDPOINT_ALLOWED.has(type);