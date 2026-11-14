
// src/content/legal/terms.ts

export interface LegalSection {
  title: string
  content: string
}

export const TERMS_VERSION = '2027-v1'

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: 'Acceptance of Terms',
    content:
      'By accessing or using MOVA, you agree to these Terms & Conditions. If you do not agree with any part of these Terms, you must not use our services. These Terms apply to all users of MOVA, including account holders, organisers, circle members, beneficiaries, and trustees.',
  },
  {
    title: 'Definitions',
    content:
      'In these Terms, "MOVA", "we", "us", and "our" refer to the MOVA platform and its operator. "You" and "your" refer to any individual accessing or using MOVA. "Services" refers to the features provided by MOVA, including main wallets, controlled wallets, scheduled releases, savings circles, trustee wallets, payment processing, notifications, and customer support. A "Controlled Wallet" is a wallet or allocation configured to restrict when funds become available. A "Scheduled Wallet" is a controlled wallet in which the account holder configures a target amount, release amount, and release schedule. A "Trustee Wallet" is a wallet arrangement involving a designated trustee and a beneficiary, where applicable. A "Circle" or "AJo" is a group arrangement in which members contribute towards a collective pool and receive payouts according to agreed rules. A "Circle Organiser" or "Moderator" is the person responsible for creating and administering a Circle. A "Trustee" is a person designated to perform an approval or oversight role. A "Beneficiary" is the person intended to benefit from a wallet arrangement or payout. A "Payment Provider" is a third-party financial institution or payment service provider integrated with MOVA.',
  },
  {
    title: 'Eligibility and Account Creation',
    content:
      'You must be at least 18 years old, possess the legal capacity to enter into binding contracts, and provide accurate and complete information when creating an account. You are responsible for keeping your account information current. MOVA may request identity verification or additional information where required by law, our risk controls, or our payment partners. MOVA may refuse, restrict, suspend, or terminate accounts that fail to meet eligibility requirements, provide false information, or present an unacceptable legal, fraud, or security risk.',
  },
  {
    title: 'Account Security',
    content:
      'You must keep your password, transaction PIN, authentication credentials, and devices secure. You must notify MOVA immediately if you suspect unauthorised access, a compromised device, or suspicious activity. You must not share your authentication credentials or permit another person to transact through your account. MOVA may temporarily restrict access or require additional verification where suspicious activity is detected. You should review your transaction history and report transactions you do not recognise as soon as possible.',
  },
  {
    title: 'Wallet Features and Controlled Spending',
    content:
      'MOVA provides wallet and controlled-spending features that allow you to allocate funds and configure when those funds become available. Depending on the feature, you may set a target amount, release amount, release schedule, destination, or other applicable rules. These features are designed to help you manage access to your money; they are not a guarantee of investment returns, interest, profit, or financial growth. You are responsible for reviewing your wallet configuration before confirming it. A confirmed release instruction may be processed automatically according to the applicable rules. Once a payment or release has been completed by the relevant payment provider, it may not be reversible. Any available pause, break, edit, cancellation, or withdrawal functionality will be subject to the rules displayed in the application.',
  },
  {
    title: 'Wallet Funding and Movement of Funds',
    content:
      'You may fund your MOVA account or wallet through the payment methods made available in the application. Funding transactions may be subject to minimum and maximum limits, provider charges, verification requirements, and processing delays. MOVA will display applicable charges and transaction details before confirmation where required. Funds may be allocated between wallet balances or released to a linked destination according to the instructions you confirm. The handling, safeguarding, settlement, and availability of funds may involve third-party Payment Providers or financial institutions. The applicable arrangement for holding and processing funds will be disclosed through the application or relevant product documentation. You must not use MOVA to process funds obtained through fraud, unlawful activity, or unauthorised sources.',
  },
  {
    title: 'Scheduled Wallets and Release Rules',
    content:
      'When creating a Scheduled Wallet, you are responsible for selecting the target amount, release amount, schedule, and other required settings. You must check that the configured rules reflect your intentions before confirming them. Releases will be processed according to the configuration and the operational status of the relevant services. A release may be delayed or fail because of insufficient funds, incorrect destination details, provider downtime, verification requirements, legal restrictions, or other circumstances outside MOVA\'s reasonable control. Where the application allows you to edit or pause a schedule, changes will apply according to the effective date and conditions displayed in the application. Changes will not necessarily reverse releases that have already been processed.',
  },
  {
    title: 'Trustee Wallets',
    content:
      'Where Trustee Wallets are available, the feature allows an account holder to designate another eligible person as a trustee for an identified beneficiary or wallet arrangement. The roles of the account holder, person providing the funds, trustee, beneficiary, and payout recipient may be different and will be identified in the application where applicable. A person must not be designated as a trustee without their knowledge and consent. A trustee must accept the role and complete any required verification before the arrangement becomes active. The trustee must use the trustee role only for its stated purpose and must not misuse access, approval rights, notifications, or information provided through MOVA.',
  },
  {
    title: 'Trustee Approval and Responsibilities',
    content:
      'Where a Trustee Wallet requires trustee approval, the trustee must review each request and approve or reject it using the authentication method provided by MOVA. Approval authorises MOVA to process the relevant release request in accordance with the wallet rules and applicable payment arrangements; it does not guarantee that the payment provider will successfully complete the transaction. A trustee must not approve a request they know to be fraudulent, unauthorised, or inconsistent with the agreed purpose of the arrangement. A trustee must keep their account credentials secure and promptly report suspected misuse. The account holder must ensure that the trustee understands the role and any responsibilities communicated through the application. The exact approval powers, ability to reject requests, replacement process, and effect of a trustee becoming unavailable will be governed by the feature settings disclosed when the arrangement is created.',
  },
  {
    title: 'Trustee Consent, Changes, and Disputes',
    content:
      'By creating a Trustee Wallet, the account holder confirms that they have a lawful basis to provide the trustee\'s information and request that MOVA send notifications relating to the arrangement. The trustee may decline the invitation or role. Where the feature permits, the account holder may request a change or removal of a trustee, subject to pending releases, verification, and any applicable restrictions. MOVA may suspend a Trustee Wallet while investigating suspected fraud, misuse, conflicting instructions, or a dispute between the parties. MOVA does not decide private ownership disputes or act as a court, guardian, or legal representative. The parties remain responsible for resolving disagreements about the intended use of the funds, subject to applicable law and MOVA\'s obligations.',
  },
  {
    title: 'Savings Circles and AJo',
    content:
      'Where available, Circles or AJo allow a group of eligible users to contribute towards a collective pool, with payouts made to members according to an agreed rotation or other payout arrangement displayed in the application. Each Circle will have rules covering matters such as membership, contribution amounts, contribution frequency, payout order, payment deadlines, and applicable charges. You must review and accept the Circle rules before joining or participating. A Circle is a group financial arrangement between its participants; participation does not create a partnership, employment relationship, agency, or guarantee of payment by MOVA. The availability of a Circle feature does not mean MOVA guarantees that every member will contribute or that every payout will be completed.',
  },
  {
    title: 'Circle Organisers and Moderators',
    content:
      'The Circle Organiser or Moderator is responsible for configuring the Circle and administering it in accordance with the rules presented to its members. Depending on the available features, this may include setting contribution amounts and schedules, defining the payout order, inviting members, managing membership, and communicating relevant changes. An organiser must provide accurate information and must not misrepresent the Circle, its purpose, its financial requirements, or the likelihood of receiving a payout. Organisers must not collect or redirect member contributions outside the approved process while representing that those payments are protected or processed by MOVA. Organisers must not change material Circle rules in a way that unfairly prejudices existing members or bypasses required member consent. MOVA may restrict an organiser\'s permissions where misuse, fraud, or a breach of these Terms is suspected.',
  },
  {
    title: 'Circle Membership and Invitations',
    content:
      'Membership is subject to the Circle\'s eligibility requirements and the membership process provided by MOVA. Where the feature requires an organiser or moderator to add or authorise members, an invitation code or join code alone does not grant membership unless the required authorisation and acceptance steps have been completed. You must not impersonate another person, use another person\'s identity, or attempt to bypass Circle membership controls. By accepting a Circle invitation, you agree to the Circle rules displayed to you at that time. Membership may be subject to verification and approval. MOVA may reject, suspend, or remove a membership where required by law, for security reasons, or because the membership was obtained through fraud or a breach of the Circle rules.',
  },
  {
    title: 'Circle Contributions and Payment Obligations',
    content:
      'By joining a Circle, you agree to make the contributions assigned to you in accordance with the displayed contribution amount, schedule, and payment instructions. You are responsible for ensuring that sufficient funds are available and that your payment method is valid. A contribution is not considered successful merely because you initiated a payment; it must be confirmed through the applicable payment process. You should retain transaction references and review your contribution history. You must not make false claims that a contribution has been paid or attempt to manipulate payment confirmations. Contribution obligations, deadlines, and any permitted changes will be governed by the Circle rules accepted by its members.',
  },
  {
    title: 'Circle Payout Rotation and Payouts',
    content:
      'The payout order and the amount expected to be received by each member must be disclosed through the Circle rules or application before participation. A payout is subject to the required contributions, applicable fees, verification checks, available funds, payment-provider processing, and any other disclosed conditions. A displayed payout date is an expected processing date and is not an unconditional guarantee that funds will arrive at a particular time. MOVA may delay or suspend a payout where contributions are incomplete, a transaction is disputed, fraud is suspected, a payment provider is unavailable, or a legal or compliance restriction applies. A payout is considered completed only when the relevant payment process confirms successful completion. Members must ensure that their payout destination details are accurate and belong to an eligible recipient.',
  },
  {
    title: 'Missed Contributions and Member Defaults',
    content:
      'A member who fails to make a required contribution by the applicable deadline may be treated as having missed a contribution or defaulted under the Circle rules. The consequences of a missed contribution must be disclosed to members before they join and may include reminders, temporary restrictions, delayed eligibility for a payout, suspension, removal from the Circle, or other consequences expressly stated in the accepted rules and permitted by applicable law. Any penalty, late charge, forfeiture, or deduction must be clearly disclosed before the member becomes bound by it. MOVA will not apply an undisclosed penalty or represent a penalty as legally enforceable where it is not. A member\'s default may affect the timing or amount of other members\' expected payouts. Members acknowledge this risk when joining a Circle.',
  },
  {
    title: 'Circle Withdrawal, Exit, and Replacement of Members',
    content:
      'A member\'s ability to leave a Circle may depend on whether the member has received a payout, whether contributions remain outstanding, whether other members would be materially affected, and the exit rules accepted when joining. Leaving a Circle does not automatically cancel a contribution obligation or create an immediate right to a refund. Any refund, settlement, replacement-member process, or outstanding balance will be handled according to the disclosed Circle rules, applicable payment arrangements, and applicable law. A member must not assume that contributions can be withdrawn on demand after joining or receiving a payout. MOVA may restrict changes to membership while a payout or contribution is pending or disputed.',
  },
  {
    title: 'Circle Disputes and Member Conduct',
    content:
      'Members must provide accurate information, comply with the accepted Circle rules, and communicate honestly with other participants. Disputes may arise from missed contributions, payout delays, membership changes, incorrect payment details, or disagreements about the Circle rules. Members should first use the available in-app support or dispute-reporting process and provide relevant transaction references and evidence. MOVA may review platform records, restrict relevant actions, or temporarily suspend a Circle while investigating suspected fraud, abuse, or rule violations. MOVA does not guarantee recovery of money lost through a member\'s default or misconduct and does not act as a substitute for legal proceedings. Nothing in these Terms prevents a member from exercising rights available under applicable law.',
  },
  {
    title: 'Transactions and Authorisations',
    content:
      'Transactions initiated from your account are authorised when you provide your transaction PIN or another authentication method accepted by MOVA. You are responsible for checking the recipient, amount, fees, and transaction details before confirming an instruction. You must not approve a transaction on behalf of another user unless you are expressly authorised to do so through the relevant feature. An instruction successfully authenticated through your account may be treated as authorised, subject to applicable law and any investigation into reported unauthorised activity. MOVA may request additional verification or delay a transaction where necessary for security, fraud prevention, or compliance.',
  },
  {
    title: 'Failed, Delayed, Reversed, and Duplicate Transactions',
    content:
      'A transaction may fail, be delayed, remain pending, or be reversed because of incorrect details, insufficient funds, payment-provider issues, network interruptions, verification checks, or other operational or legal reasons. A debit from your account does not always mean that the recipient has received the funds. Where a transaction fails or is reversed, the relevant balance will be updated after confirmation and reconciliation by MOVA or the applicable Payment Provider. Refund and reversal timelines may depend on the provider and financial institution involved. If you believe you have been charged incorrectly, debited more than once, or not credited for a successful payment, contact support with the transaction reference. You must not assume that a pending transaction has failed and initiate a duplicate payment without checking its status.',
  },
  {
    title: 'Fees and Charges',
    content:
      'Certain transactions, wallet features, Circle activities, or other services may incur fees. Applicable MOVA fees and known third-party charges will be displayed before you confirm the relevant transaction or service, where required. By proceeding, you agree to the disclosed charges. Fees may vary by transaction type, payment provider, or service. MOVA will communicate material changes to its own fees in advance where required. A third-party Payment Provider may impose charges under its own terms. Any Circle-specific contribution charge, administration fee, late charge, or penalty must be disclosed to affected members before they become bound by it.',
  },
  {
    title: 'Refunds and Reversals',
    content:
      'Refunds and reversals are subject to the nature and status of the transaction, the applicable Payment Provider\'s processes, and applicable law. A completed payout, release, or transfer may not be reversible once the recipient or financial institution has received the funds. Where a refund is approved or a payment is reversed, the amount and timing will depend on the relevant transaction records and provider confirmation. MOVA may request supporting information to investigate a refund or reversal request. This section does not remove any refund, chargeback, or consumer rights that cannot lawfully be excluded.',
  },
  {
    title: 'Prohibited Activities',
    content:
      'You must not use MOVA for unlawful purposes, including fraud, money laundering, terrorism financing, the financing of prohibited activities, or any activity that violates Nigerian or applicable international law. You must not use false identities, create fictitious Circle members, manipulate contribution or payout records, misuse trustee permissions, divert funds without authorisation, or misrepresent a Circle or Trustee Wallet to another person. You must not attempt to circumvent security features, interfere with another user\'s access, exploit technical vulnerabilities, reverse-engineer the service, or use MOVA to facilitate scams or unauthorised financial activity.',
  },
  {
    title: 'Identity Verification and Compliance',
    content:
      'MOVA may collect and verify identity, contact, transaction, and other information to meet legal, regulatory, fraud-prevention, security, and Payment Provider requirements. You agree to provide accurate information and cooperate with reasonable verification requests. MOVA may monitor transactions and activity for suspicious or prohibited conduct and may restrict, delay, reject, or report activity where required or permitted by law. Some features, transaction limits, Circle participation, trustee roles, or payout services may not be available until required verification is completed. MOVA may be unable to disclose certain compliance actions where disclosure is restricted by law.',
  },
  {
    title: 'Third-Party Services',
    content:
      'MOVA integrates with third-party providers for payment processing, transfers, identity verification, communications, and related services. Your use of those services may be subject to their own terms, privacy policies, and operational requirements. Payment processing and settlement may depend on the availability and performance of those providers and participating financial institutions. MOVA is not responsible for failures caused solely by a third-party provider, but will take reasonable steps within its role to investigate reported issues and assist with resolution. Nothing in these Terms excludes responsibility that MOVA cannot lawfully exclude.',
  },
  {
    title: 'Privacy and Communications',
    content:
      'MOVA handles personal information in accordance with its Privacy Policy and applicable data protection laws. You must not provide another person\'s personal information without an appropriate lawful basis. When you invite a trustee, beneficiary, or Circle member, you confirm that you are permitted to provide the information needed to send the invitation or administer the relevant feature. MOVA may send service messages relating to account security, transactions, releases, contributions, payouts, trustee requests, Circle activity, and changes to these Terms. You should not include passwords, transaction PINs, or other secret credentials in support messages.',
  },
  {
    title: 'Suspension and Termination',
    content:
      'MOVA may restrict, suspend, or terminate your access where you breach these Terms, where required by law, where a Payment Provider requires action, or where MOVA reasonably suspects fraud, unlawful activity, security threats, or misuse of the Services. Where legally permitted, MOVA will provide information about the reason for the action. You may request account closure through the in-app settings or by contacting support. Closing an account does not automatically cancel pending transactions, outstanding contribution obligations, disputes, or other liabilities that arose before closure. MOVA may retain records where required by law or for legitimate compliance, security, dispute-resolution, and recordkeeping purposes.',
  },
  {
    title: 'Service Availability and Changes',
    content:
      'MOVA aims to make its Services available reliably but does not guarantee uninterrupted or error-free operation. Features may be unavailable due to maintenance, technical issues, security incidents, third-party provider failures, or circumstances outside our reasonable control. MOVA may modify, suspend, or discontinue a feature where necessary for operational, security, legal, or commercial reasons. Where a change materially affects an active wallet, Trustee Wallet, or Circle, MOVA will take reasonable steps to communicate the change and explain any available next steps, subject to applicable law and operational constraints.',
  },
  {
    title: 'Limitation of Liability',
    content:
      'To the extent permitted by applicable law, MOVA will not be liable for indirect, incidental, special, or consequential losses arising from your use of the Services. MOVA is not responsible for losses caused by your failure to protect your credentials, inaccurate recipient details supplied by you, a member\'s failure to contribute to a Circle, a trustee\'s misuse of their role, or another user\'s unlawful conduct, except to the extent that the loss results from MOVA\'s own breach of its obligations or other liability that cannot lawfully be excluded. Subject to applicable law, MOVA\'s total liability for a claim will not exceed the fees you paid directly to MOVA for the relevant Services during the twelve months preceding the event giving rise to the claim. This limitation does not exclude liability that cannot lawfully be limited, including any applicable statutory consumer rights.',
  },
  {
    title: 'Indemnity',
    content:
      'To the extent permitted by applicable law, you agree to be responsible for losses, claims, and reasonable costs directly resulting from your fraud, unlawful conduct, intentional misuse of the Services, or material breach of these Terms. You are not required to indemnify MOVA for losses caused by MOVA\'s own negligence, fraud, wilful misconduct, or breach of applicable law. This section does not limit rights or remedies that cannot lawfully be restricted.',
  },
  {
    title: 'Changes to These Terms',
    content:
      'MOVA may update these Terms from time to time to reflect changes in the Services, operational requirements, or applicable law. We will publish the updated version and communicate material changes through the application or by email where appropriate. The updated Terms will identify their effective version or date. Where required by law or where a change materially affects your rights or obligations, we will obtain any required acceptance before applying the change. If you do not agree with updated Terms, you should stop using the affected Services and contact support about any pending transactions or outstanding obligations.',
  },
  {
    title: 'Governing Law and Disputes',
    content:
      'These Terms are governed by the laws of the Federal Republic of Nigeria. If you have a complaint or dispute, you should first contact MOVA through the in-app help centre or the support contact provided below. We will make reasonable efforts to investigate and resolve complaints in good faith. Where a dispute cannot be resolved through support, it may be referred to a court or other competent dispute-resolution body in Nigeria, as applicable. Nothing in these Terms prevents you from contacting a relevant regulator or exercising a right available under applicable law.',
  },
  {
    title: 'Contact',
    content:
      'For questions, complaints, or support relating to these Terms, your account, wallet transactions, Trustee Wallets, or Circles, contact our support team through the in-app help centre or at support@mova.app. Include relevant transaction references where necessary, but do not include your password, transaction PIN, full authentication credentials, or other secret security information.',
  },
]
