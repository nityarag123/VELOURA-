# VELOURA — The Art of Sweetness
> *My first choice • Premium • Elegant • International*

VELOURA is a luxury online bakery, celebratory cake studio, specialty coffee roastery, and cafe e-commerce platform inspired directly by the high-conversion shopping experience and festive visual design of [Bakingo](https://www.bakingo.com/).

---

## ?? Key Highlights & Features

### 1. Vibrant Festive Red & Gold Aesthetic
- **Festive Header with Fairy Lights**: Rich celebration red (`#E31837`), glowing fairy light garland, white flowing VELOURA cursive script, and gold badge *"THE ART OF SWEETNESS"*.
- **Intuitive "Home Bar" Navigation**:
  - Sticky bottom mobile navigation bar (Home, Cakes, Cafe, Bag, Account).
  - Prominent Home button in the desktop category navigation bar.
  - Interactive breadcrumbs (`Home / Category / Product`) on all subpages.
- **Garland Category Cards**: 8 festive cards (*Hampers, Classic, Bento, Designer, Desserts, Cupcakes, Coffee, Cafe Bites*).
- **Floating Concierge**: Interactive customer assistance bubble.

### 2. Full Coffee Roastery & Cafe Savory Catalog
- **Artisanal Coffee & Brews**: Spanish Latte, 24-Hour Cascara Cold Brew, Belgian Dark Mocha Royale, Madagascar Vanilla Cappuccino, Caramel Hazelnut Frappé, Ethiopian Pour-Over.
- **Gourmet Cafe & Savories**: Truffle Mushroom Panini, Flaky Butter Croissants, Almond Twice-Baked Croissants, Pesto Mozzarella Brioche Melts, Greek Spinach Quiche, Avocado Everything Bagels.
- **Smart Customization Modal**: Dynamic options adapting between cakes (eggless, weights, messages) and beverages/cafe bites (cup sizes, oat/almond milk, toast preferences).

### 3. Bakingo-Style Cake Catalog & Customization
- **Curated Cake Categories**: Belgian Chocolate, Birthday Cakes, Anniversary, Korean Minimalist Bento Cakes, Cupcake Boxes, French Pastries & Macarons.
- **Comprehensive Product Options**:
  - Weight selection (0.5 kg, 1.0 kg, 1.5 kg, 2.0 kg) with dynamic price calculation.
  - 100% Eggless preparation toggle with FSSAI vegetarian badges.
  - Free custom cake message on an edible chocolate plaque.
  - Delivery date and slot selector (Morning, Afternoon, Evening Prime, Midnight Surprise).

### 4. Authentication Architecture (Customer vs Admin)
- **Customers (Passwordless)**: Customers simply enter their email (and name on first visit) for instant passwordless sign-in and auto-registration.
- **Admins (Secure Password)**: Admin login requires verified password credentials.
- **Admin Security Console**: Admins can update their password directly from the admin dashboard with real-time feedback.

### 5. Admin Management Console (`/admin`)
- **Live KPI Dashboard**: Real-time tracking of Total Orders, Revenue (?), Registered Patrons, and Live Menu Items.
- **Menu, Price & Picture Editor**: Live editing of product photos, prices, discounts, stock availability, and descriptions.
- **Live Order Management**: View delivery notes, address, and update status (`Order Placed` ? `Confirmed` ? `Baking` ? `Out for Delivery` ? `Delivered`).

### 6. Shopping Bag, Coupons & Express Checkout
- Slide-out Velvet Bag drawer with instant item quantity adjustments.
- Active coupon validation (`VELOURA10`, `SWEETDEAL`, `FIRSTBITE`).
- Free delivery calculation on orders above ?500.
- Interactive live order tracking with step-by-step progress visualizer.

---

## ??? Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v3, Lucide React, Canvas Confetti |
| **Backend** | Python REST API, WSGI architecture, SQLite3 (Auto-seeding) |
| **Authentication** | JWT (HMAC-SHA256) with PBKDF2 cryptographic password hashing |
| **HTTP Client** | Axios with automated Bearer token request interceptor |

---

## ?? Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)

### 2. Backend Server
From the project root:
```bash
cd backend
python app/server.py
```
*The backend starts at `http://127.0.0.1:8000` and automatically initializes and seeds all 28 products and categories.*

### 3. Frontend Development Server
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*The frontend opens at `http://localhost:5173`.*

---

## ?? Default Credentials

| Role | Email | Password | Notes |
|---|---|---|---|
| **Customer** | `user@veloura.com` | *None* | Passwordless instant login |
| **Admin** | `admin@veloura.com` | `admin123` | Password required (changeable in `/admin`) |

---

## ?? Automated Testing
Run the comprehensive end-to-end integration test suite:
```bash
python test_e2e.py
```
Passes 100% across all 11 test suites (auth, coupons, orders, live tracking, admin product updates, password management, cafe orders, and reviews).
