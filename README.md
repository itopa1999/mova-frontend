<!-- TODO -->
1. I NEED a standard preloader maybe using the icon
2. the issue now is the withdrawal if i pay for airtime utilities it doesn't want to pay again for another airtime utilities until i pay others utilities, please fix the state and making sure that all work perfect accross all utilities and transafer thanks. Withdrawal page. 
3. Backend already g=have a enum same as the frontend too have the same enums create a file.ts for all enums same as the backend please and let use it stop calling raw please. 
4. some endpoint is firing twice check and fix
5. making sure that all the FE and BE has a strong input validation please. 



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