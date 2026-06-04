# ReviewPe — Google Reviews SaaS Funnel Platform

ReviewPe is a complete, high-fidelity, production-ready SaaS application designed to help physical stores (restaurants, salons, retail outlets, clinics) multiply their positive Google Maps reviews, capture private customer feedback, distribute smart NFC tap stands, and export custom print-ready standee designs.

---

## 🚀 Key Features

### 1. Smart Review Funnel
*   **Routing Logic**: Intercepts QR scans and filters responses:
    *   **4-5 Stars**: Directed immediately to your public Google Maps place profile to post a public review.
    *   **1-3 Stars**: Routed to a private feedback form capturing names, numbers, and complaints privately.
*   **AI Suggestions**: Generates 3 authentic, Claude-powered review suggestions based on customer satisfaction (e.g. food quality, service, cleanliness) written natively in their own language script.
*   **Compliant Design**: Retains a legally compliant, always-visible link to bypass routing and post on Google directly.

### 2. Subscription plans & Free Trial (2 Tiers)
*   **30-Day Free Trial**: Automatically activates on signup (`plan: 'trial'`). Growth features are fully unlocked for 30 days to maximize adoption.
*   **Trial Countdown Banner**: Displays remaining days inside an elegant emerald top banner: *"🎁 X days remaining in free trial"*.
*   **Expired Read-Only Lock**: On day 30, if no plan is selected:
    *   Customer facing `/r/[slug]` pauses and shows: *"This business is currently paused."*
    *   Dashboard entries are read-only: displays a blurred glassmorphic lock overlay over settings, inboxes, and downloaders.
*   **Starter Plan (₹399/mo)**: Support for 1 physical location, 1 active NFC card, branded QR designs, and 30-day analytics history.
*   **Growth Plan (₹799/mo)**: Up to 10 physical locations, 10 active NFC cards, dynamic routing, full peak-hours heatmap analytics, CSV reports, white-label options, and developer API key access.

### 3. Multi-Location & NFC Table Tags
*   **Branch Registry**: Register, rename, and monitor ratings across multiple physical branch locations (e.g. Malviya Nagar, Vaishali Nagar). Each location has a unique dynamic slug and redirect target.
*   **NFC Chip Registry**: Map and manage table stands or cards using serial UIDs.
*   **Web NFC Standard**: Integrates browser-level Web NFC API (`NDEFReader`) allowing owners to scan physical tags directly in Chrome/Android to auto-populate registries.

### 4. Interactive Payments & Razorpay Checkout Simulator
*   **Billing Center (`/dashboard/billing`)**: Displays subscription progress bars, due alerts, and billing history.
*   **Razorpay Checkout Simulator**: Allows merchants to complete trial upgrades or reactivate expired portals by scanning a simulated **UPI QR Code** (emulating GPay/Paytm) or inserting cards, executing instant database state updates.
*   **Razorpay Webhooks Endpoint (`/api/webhooks/razorpay`)**: Receives POST event notifications:
    *   `payment.captured`: Upgrades plans, clears expiry locks, reactivates QR pages.
    *   `subscription.halted`: Halts portal active state, enables read-only lock overlays.
    *   `payment.failed`: Triggers billing alerts.

### 5. System SuperAdmin Control Panel (`/admin`)
*   **Global KPI Dashboard**: Displays Total Merchants, Active Funnels, Pending Renewals, and Outstanding Dues.
*   **Manual Payments Override**: Allows platform administrators to manually match payments, upgrade subscription plans, toggle "Trial Expired" checks, or adjust trial start dates (to test banners).

### 6. Elegant Print-Ready PDF Templates
*   **Sizes**: Generates custom A4 Counter Standees, A5 Foldable Table Tents (with folding guidelines), and Business Cards.
*   **Design Accents**: Draws solid accent headers matching the exact merchant `brandColor`, displays custom taglines, and prints brand logos beautifully centered.
*   **Hardened Rendering**: Pre-fetches remote image URLs in Node and compiles them as local Base64 inline strings, preventing SSL handshake, timeout, or CORS compilation crashes.

---

## 🛠️ Technology Stack

*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Vanilla CSS & TailwindCSS
*   **Icons**: Lucide React
*   **Localization**: Dynamic i18n segments support (English, Hindi, Marathi, Tamil, Telugu, Kannada)
*   **PDF Generation**: `@react-pdf/renderer` compiled stream buffers
*   **Data Layer**: In-memory demo databases (`src/lib/db.ts`) with dynamic updates, and Supabase client structures.

---

## 🌐 Public Agency Developer APIs

Developer API routes are located at `/api/v1/*`. Accessible via header authorization Bearer tokens (gated to **Growth** plans) and protected by a **100 requests/hour** rolling rate-limiter.

### 1. Retrieve Analytics Summary
```http
GET /api/v1/summary
Authorization: Bearer rb_live_yourToken
```
**Response (200 OK)**:
```json
{
  "totalScans": 180,
  "totalReviews": 6,
  "averageStars": 3.3,
  "redirectRate": 50,
  "scanSources": {
    "qr": 72,
    "nfc": 36,
    "link": 36,
    "whatsapp": 36
  }
}
```

### 2. Fetch Review Feed
```http
GET /api/v1/reviews?limit=50&stars=5
Authorization: Bearer rb_live_yourToken
```
**Response (200 OK)**:
```json
[
  {
    "id": "rev-1",
    "stars": 5,
    "is_public": true,
    "custom_text": "Absolutely delicious masala chai and bun maska!",
    "customer_name": "Rahul Sharma",
    "created_at": "2026-06-02T08:44:11.000Z"
  }
]
```

### 3. Fetch Scans Log
```http
GET /api/v1/scans?limit=10&offset=0
Authorization: Bearer rb_live_yourToken
```

---

## 💻 Local Development Setup

### Prerequisite
*   Node.js (v18 or higher)
*   NPM or PNPM

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Local Dev Server
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser to view the ReviewPe dashboard.

### 3. Compile Production Bundle
```bash
npm run build
```

---

## 🧑‍💻 Manual Testing Scenarios

1.  **Free Trial Countdown**: Log in as **Tress Lounge Pune** (`tress-lounge-pune-8f2a`) to see the amber/emerald Free Trial Active progress banner showing *"4 days remaining in free trial"*.
2.  **Trial Expiry Lock**: Visit `/en/r/pizza-hut-expired` to verify that visitors see *"This business is currently paused"*. Log into this merchant's dashboard to see the blurred, read-only lock overlay blocking reviews, settings, and download actions.
3.  **Simulated Checkout Upgrade**: Go to the `/en/dashboard/billing` page as Pizza Hut Express, select a plan, scan the simulated UPI QR Code, click pay, and see the portal reactive immediately.
4.  **Admin Console Overrides**: Go to `/en/admin` to manual-match dues, expire trials, or update merchant dates.
