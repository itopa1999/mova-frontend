<!-- TODO -->
1. make sure that verify-email does nt' show register page before going to pjin
2. make sure that is only one error message pops up when there's any error please.
3. making sure that the flow from registeration, verify or resend/verify, pin setup, dashbaord
4. All Pages should show the message please.
5. remove any emoji and replace it with the installed icon
6. Any new register users deletes all the localstorage
7. I NEED a standard preloader maybe using the icon.

New features
7. Multiple release destinations. Right now a release goes to the linked bank. What about "keep it in my main balance"? Some users don't want to pay bank fees on every micro-release. Give them the choice: ReleaseDestination = { BankAccount, MainBalance } on the WalletRule.


10. Scheduled reports. A monthly email: "This month MOVA released ₦45,000 across 4 wallets. You broke 1 wallet. Your next release is tomorrow." Predictable, useful, keeps the app in the user's inbox.

11. 
# Feature Note — Bill Payments

**Goal:** Let users pay airtime, data, cable TV, and electricity from MOVA.

**Provider:** Monnify Bills API. Fallback: Flutterwave. Backup: VTpass.

**Biller categories (v1):** Airtime, Data, Cable TV (DStv, GOtv, Startimes), Electricity (EKEDC, IKEDC, AEDC, PHED, KEDCO).

**Design:** Manual payment, not scheduled. User picks biller, enters customer ID, validates, picks amount + source, confirms with PIN.

**Source of funds:** Main MOVA balance (default) or a wallet's available balance.

**Why not scheduled:** Bill amounts vary, customer IDs change, wrong meters aren't refundable.

**Refunds:** No auto-refund on user error. Auto-refund on provider failure. Always validate customer ID before payment.

**New entity:** `BillPayment` — tracks category, biller, customer ID, amount, fee, provider reference, status.

**Endpoints:**
- `GET /bills/categories`
- `GET /bills/billers/{category}`
- `POST /bills/validate`
- `POST /bills/pay`
- `GET /bills/history`

**Flow:** Category → Biller → Customer ID → Validate → Amount → Source → Confirm → PIN → Debit → Provider → Receipt.

**Blocker:** Monnify Bills not enabled by default. Email `integration-support@monnify.com` to activate.

**Open questions:** Fee model, commission destination, reconciliation job, electricity token delivery, rate limits.

**Non-goals (v1):** Scheduled bill payments, recurring bills, bulk payments.



Unexpected Application Error!
Invalid time value
RangeError: Invalid time value
    at format (http://localhost:5173/node_modules/.vite/deps/date-fns-DrRlKu4Q.js?v=30e7cfae:5042:36)
    at Day (http://localhost:5173/src/components/ui/ReleaseCalendar.tsx:211:18)
    at Object.react_stack_bottom_frame (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=47cf4abd:12866:12)
    at renderWithHooks (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=47cf4abd:4213:19)
    at updateFunctionComponent (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=47cf4abd:5569:16)
    at beginWork (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=47cf4abd:6140:20)
    at runWithFiberInDEV (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=47cf4abd:851:66)
    at performUnitOfWork (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=47cf4abd:8429:92)
    at workLoopSync (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=47cf4abd:8325:37)
    at renderRootSync (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=47cf4abd:8309:6)
💿 Hey developer 👋

You can provide a way better UX than this when your app throws errors by providing your own ErrorBoundary or errorElement prop on your route.