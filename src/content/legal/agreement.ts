
// src/content/legal/agreement.ts

export interface LegalSection {
  title: string
  content: string
}

export const AGREEMENT_VERSION = '2027-v1'

export const AGREEMENT_SECTIONS: LegalSection[] = [
  {
    title: 'Introduction',
    content:
      'Welcome to MOVA. This User Agreement governs your access to and use of MOVA\'s services, including your MOVA account, main wallet, controlled wallets, scheduled releases, Trustee Wallets, savings circles (AJo), transaction features, and any related applications or tools we provide. By creating an account, accepting this Agreement, or using our services, you agree to be bound by this Agreement and the applicable Terms & Conditions and Privacy Policy.',
  },
  {
    title: 'Eligibility',
    content:
      'You must be at least 18 years old and legally capable of entering into a binding contract to use MOVA. By registering, you confirm that the information you provide is accurate and that you are not prohibited by law from using our services. Certain features may have additional eligibility, identity verification, or participation requirements.',
  },
  {
    title: 'Account Registration',
    content:
      'You agree to provide accurate, current, and complete information when registering. You are responsible for maintaining the confidentiality of your account credentials, transaction PIN, and any devices used to access your account. You must notify MOVA promptly if you suspect unauthorised access, compromised credentials, or suspicious activity. You must not create accounts using another person\'s identity or permit another person to use your account without authorisation.',
  },
  {
    title: 'Services We Provide',
    content:
      'MOVA provides digital wallet and controlled-spending features that allow you to fund an account, allocate money, configure release rules, and manage transactions according to your preferences. Depending on availability, MOVA may also provide Trustee Wallets and Circle (AJo) features. These services are intended to help users manage access to and movement of their money. They are not a guarantee of investment returns, interest, profit, or financial growth. Service availability may change over time. MOVA may add, modify, restrict, or discontinue features where necessary, subject to applicable law and any required notice.',
  },
  {
    title: 'Your Responsibilities',
    content:
      'You agree to use MOVA only for lawful purposes and in accordance with this Agreement. You must provide accurate information, follow the instructions displayed in the application, protect your account credentials, and ensure that transactions and configurations reflect your intentions. You must not attempt to gain unauthorised access, interfere with other users, manipulate transaction records, misuse wallet or trustee permissions, misrepresent a Circle, use the service for fraud or money laundering, or engage in any activity that violates applicable laws.',
  },
  {
    title: 'Wallets and Release Rules',
    content:
      'MOVA allows you to allocate funds into controlled wallets and configure rules governing when those funds become available. Depending on the wallet type, you may specify a target amount, release amount, schedule, destination, or other applicable settings. When you create a wallet and confirm its release rules, you instruct MOVA to process releases according to the parameters you have selected. You are responsible for reviewing the configuration before confirmation. A confirmed release may be processed automatically when its conditions are met. Once a release or transfer has been completed, it may not be reversible. Where available, editing, pausing, breaking, or cancelling a wallet will be subject to the functionality and conditions displayed in the application.',
  },
  {
    title: 'Wallet Funding and Transactions',
    content:
      'You may fund your MOVA account through the payment methods made available in the application. You are responsible for ensuring that the funding source and transaction details are accurate and that sufficient funds are available. Funding, allocation, release, and payout transactions may be subject to processing times, provider requirements, transaction limits, verification checks, and applicable charges. A transaction is not considered successful merely because you initiated it. Its status must be confirmed through the relevant payment process. The handling and settlement of funds may involve third-party payment providers or financial institutions.',
  },
  {
    title: 'Trustee Wallets',
    content:
      'Where Trustee Wallets are available, you may designate an eligible person as a trustee for a wallet arrangement involving an identified beneficiary. The account holder, person providing the funds, trustee, beneficiary, and payout recipient may be different individuals. Their roles and permissions will be determined by the arrangement and the functionality provided by MOVA. By creating a Trustee Wallet, you confirm that you have an appropriate lawful basis and the necessary consent to provide the trustee\'s information and send them invitations or notifications. A designated trustee must accept the role and complete any required verification before the arrangement becomes active.',
  },
  {
    title: 'Trustee Responsibilities and Approval',
    content:
      'A trustee agrees to perform the responsibilities associated with the role they accept. Where trustee approval is required, the trustee must review each release request and approve or reject it using the authentication method provided by MOVA. The trustee must not approve requests they know to be fraudulent, unauthorised, or inconsistent with the agreed purpose of the arrangement. A trustee must protect their credentials, maintain the confidentiality of information they receive, and promptly report suspected misuse. Approval authorises MOVA to process the relevant instruction but does not guarantee successful settlement by a payment provider. The trustee is not automatically the owner of the funds merely because they have been designated as a trustee.',
  },
  {
    title: 'Trustee Changes and Withdrawal',
    content:
      'Where the feature permits, the account holder may request a change or replacement of a trustee, subject to verification, pending requests, and applicable restrictions. A trustee may decline an invitation or request to discontinue their role through the available process. Removing or replacing a trustee does not automatically cancel pending transactions or reverse completed releases. MOVA may temporarily restrict a Trustee Wallet where there is a reported dispute, suspected misuse, conflicting instructions, or a legal or security concern. The parties remain responsible for resolving private disagreements about the intended use of funds, subject to applicable law.',
  },
  {
    title: 'Savings Circles and AJo',
    content:
      'Where available, Circle or AJo allows a group of eligible users to contribute towards a collective pool and receive payouts according to an agreed rotation or payout arrangement. Each Circle will operate according to rules established by its organiser and presented to members before participation. These rules may cover membership, contribution amounts, contribution frequency, payment deadlines, payout order, applicable charges, and consequences of missed contributions. By joining a Circle, you agree to comply with its disclosed rules. Participation in a Circle does not guarantee that every member will contribute on time or that every expected payout will be completed on a particular date.',
  },
  {
    title: 'Circle Organiser and Moderator Responsibilities',
    content:
      'The Circle organiser or moderator is responsible for configuring and administering the Circle within the permissions provided by MOVA. This may include defining contribution schedules, setting contribution amounts, establishing payout order, inviting members, managing authorised membership, and communicating relevant changes. Organisers must provide accurate information about the Circle and must not misrepresent its purpose, financial requirements, or payout expectations. Organisers must not manipulate membership, contribution records, or payout arrangements to deceive or unfairly disadvantage other participants. Any material changes to Circle rules must follow the change and approval process provided by MOVA.',
  },
  {
    title: 'Circle Membership and Invitations',
    content:
      'Circle membership is subject to the eligibility and authorisation requirements displayed in the application. Where a Circle requires its organiser or moderator to add or authorise members, an invitation or join code alone does not grant membership unless the required authorisation and acceptance steps have been completed. By accepting an invitation, you confirm that you understand and agree to the Circle rules presented to you. You must not impersonate another person, use another person\'s account, or bypass membership controls. MOVA may reject, restrict, or remove membership where necessary for security, legal, or fraud-prevention reasons.',
  },
  {
    title: 'Circle Contributions',
    content:
      'By joining a Circle, you agree to make the contributions assigned to you according to the contribution amount, frequency, and deadlines disclosed in its rules. You are responsible for ensuring that sufficient funds are available and that your payment method is valid. A contribution is considered successful only when confirmed by the relevant payment process. You must not falsely claim that a contribution has been made or manipulate payment confirmations. Your contribution obligations may continue even if you stop actively using the application or request to leave the Circle, subject to the applicable Circle rules and law.',
  },
  {
    title: 'Circle Payouts and Rotation',
    content:
      'The payout order and expected payout amount must be disclosed to members before they participate. Payouts are subject to the required contributions, applicable fees, verification checks, available funds, payment-provider processing, and other disclosed conditions. A displayed payout date is an expected processing date and is not an unconditional guarantee that funds will arrive at a particular time. A payout is considered completed only when the relevant payment process confirms successful completion. You are responsible for providing accurate payout destination details. MOVA may delay or suspend a payout where contributions are incomplete, a transaction is disputed, fraud is suspected, or a legal or operational restriction applies.',
  },
  {
    title: 'Missed Contributions and Defaults',
    content:
      'You acknowledge that failing to make a required Circle contribution by its deadline may affect the Circle and other members\' expected payouts. The consequences of a missed contribution will be determined by the Circle rules disclosed before participation. Depending on those rules, consequences may include reminders, delayed payout eligibility, restrictions, suspension, removal from the Circle, or disclosed penalties where permitted by law. Any applicable penalty or late charge must be communicated before you agree to participate. MOVA does not guarantee that it can recover money from a defaulting member or compensate other members for losses caused by a member\'s failure to contribute.',
  },
  {
    title: 'Leaving a Circle and Member Replacement',
    content:
      'Your ability to leave a Circle may depend on your contribution history, whether you have received a payout, outstanding obligations, and the Circle rules. Leaving a Circle does not automatically cancel outstanding contributions or entitle you to an immediate refund. Any settlement, refund, or replacement-member arrangement will be handled according to the disclosed Circle rules, applicable payment arrangements, and applicable law. You must not assume that contributions can be withdrawn on demand after joining or receiving a payout. MOVA may restrict membership changes while transactions, payouts, or disputes are pending.',
  },
  {
    title: 'Circle Disputes and Member Conduct',
    content:
      'You agree to act honestly and comply with the rules accepted when joining a Circle. Disputes may arise from missed contributions, payout delays, membership changes, incorrect payment details, or disagreements about Circle rules. You should report disputes through the available support or complaint channels and provide relevant transaction references and evidence. MOVA may review relevant platform records, restrict actions, or temporarily suspend a Circle while investigating suspected fraud, abuse, or rule violations. MOVA does not guarantee recovery of money lost through another member\'s default or misconduct and does not act as a substitute for legal proceedings.',
  },
  {
    title: 'Fees and Charges',
    content:
      'Certain services, wallet transactions, Circle activities, or other features may incur fees. Applicable MOVA fees and known third-party charges will be displayed before you confirm the relevant transaction or service, where required. By proceeding, you agree to the disclosed charges. Fees may vary according to transaction type, payment provider, or service. Any Circle-specific administration fee, late charge, or penalty must be disclosed to affected members before they become bound by it. MOVA will communicate material changes to its own fees in advance where required by applicable law.',
  },
  {
    title: 'Transaction Authorisation',
    content:
      'You are responsible for transactions initiated from your account, including transactions authenticated using your transaction PIN or another accepted authentication method. You must keep your PIN confidential and must not share it with anyone. You are responsible for checking the amount, recipient, destination, and applicable charges before confirming a transaction. You must not approve a transaction on behalf of another user unless you have been expressly authorised to do so through the relevant feature. You must report suspected unauthorised transactions promptly.',
  },
  {
    title: 'Failed, Delayed, and Reversed Transactions',
    content:
      'Transactions may fail, remain pending, be delayed, or be reversed due to insufficient funds, incorrect details, network interruptions, payment-provider issues, verification requirements, or legal restrictions. A debit from your account does not always mean that the recipient has received the funds. Where a transaction fails or is reversed, the relevant balance will be updated following confirmation and reconciliation. Refund and reversal timelines may depend on the payment provider or financial institution involved. If you believe you have been charged incorrectly or have not received a credit, contact support with the relevant transaction reference. Do not assume a pending transaction has failed and initiate a duplicate payment without checking its status.',
  },
  {
    title: 'Refunds and Reversals',
    content:
      'Refunds and reversals are subject to the transaction status, applicable payment-provider processes, and applicable law. A completed release, transfer, or payout may not be reversible once the recipient or financial institution has received the funds. Where a refund or reversal is approved, the amount and timing will depend on the relevant transaction records and provider confirmation. This Agreement does not remove any refund, chargeback, or consumer rights that cannot lawfully be excluded.',
  },
  {
    title: 'Identity Verification and Compliance',
    content:
      'You agree to provide accurate identity and verification information when requested. MOVA may require additional information before enabling certain wallet features, trustee roles, Circle participation, or payouts. MOVA may monitor transactions and account activity for security, fraud prevention, and compliance purposes. Where required or permitted by law, MOVA may restrict, delay, reject, or report certain transactions or activities. Some features may remain unavailable until the necessary verification is completed.',
  },
  {
    title: 'Third-Party Services',
    content:
      'MOVA may integrate with third-party providers for payment processing, transfers, identity verification, hosting, and related services. Your use of those services may be subject to their own terms and privacy policies. Transaction processing, settlement, and availability may depend on these providers and participating financial institutions. MOVA will take reasonable steps within its role to investigate reported issues and assist with resolution. Nothing in this Agreement excludes responsibility that MOVA cannot lawfully exclude.',
  },
  {
    title: 'Suspension and Termination',
    content:
      'MOVA may suspend, restrict, or terminate your access if you breach this Agreement, if required by law, or if MOVA reasonably suspects fraud, unlawful activity, security threats, or misuse of the Services. Where permitted, we will notify you of the reason. You may request account closure through the available account controls or by contacting support. Closing your account does not automatically cancel pending transactions, outstanding Circle contributions, disputes, or other obligations that arose before closure. MOVA may retain records where required by law or necessary for legitimate security, compliance, accounting, or dispute-resolution purposes.',
  },
  {
    title: 'Limitation of Liability',
    content:
      'To the extent permitted by applicable law, MOVA is not liable for indirect, incidental, special, or consequential losses arising from your use of the Services. MOVA is not responsible for losses caused by inaccurate information you provide, your failure to safeguard credentials, another Circle member\'s failure to contribute, or a trustee\'s misuse of their role, except to the extent that the loss results from MOVA\'s own breach of its obligations or other liability that cannot lawfully be excluded. Subject to applicable law, MOVA\'s total liability for a claim will not exceed the fees you paid directly to MOVA for the relevant Services during the twelve months preceding the event giving rise to the claim. This limitation does not exclude liability that cannot lawfully be limited.',
  },
  {
    title: 'Changes to This Agreement',
    content:
      'We may update this Agreement from time to time to reflect changes to our services, operational requirements, or applicable law. We will publish the updated version and communicate material changes through the application or by email where appropriate. The updated version will identify its effective date or version. Where required by law or where a change materially affects your rights or obligations, we will obtain any required acceptance before applying the change. If you do not agree with an updated Agreement, you should stop using the affected Services and contact support about pending transactions or outstanding obligations.',
  },
  {
    title: 'Governing Law and Disputes',
    content:
      'This Agreement is governed by the laws of the Federal Republic of Nigeria. If you have a complaint or dispute, you should first contact MOVA through the in-app help centre or the official support channel. We will make reasonable efforts to investigate and resolve complaints in good faith. Where a dispute cannot be resolved through support, it may be referred to a court or other competent dispute-resolution body in Nigeria, as applicable. Nothing in this Agreement prevents you from exercising rights available under applicable law.',
  },
  {
    title: 'Contact',
    content:
      'For questions about this Agreement, your account, wallet transactions, Trustee Wallets, or Circles, please contact our support team through the in-app help centre or at support@mova.app. Include relevant transaction references where necessary. Do not include sensitive credentials such as your password, transaction PIN, or authentication secrets in your message.',
  },
]
