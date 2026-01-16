# 🌐 Chommie Nexus: Enterprise Marketplace Protocol

Chommie is a high-performance, microservices-driven e-commerce platform designed to rival the customer experience of global giants like Amazon. It features a unique **BNPL Trust Engine**, an **AI Concierge**, and a sophisticated **Beige & Orange** design system.

## 🏗️ Architecture: The Nexus Grid

The system follows a **Microservices-First** pattern, orchestrated by **Turbo** and communicating via **NestJS TCP Transports**.

### 🏛️ API Gateway (`packages/api-gateway`)
The central coordinator. 
- **Internal Routing**: Translates RESTful HTTP requests into microservice commands.
- **Vendor Unification**: Specialized logic to reconstruct fragmented order data for the Vendor Portal.
- **Port**: `3000` (Production: Dynamic)

### ⚙️ Core Microservices
| Service | Data Store | Primary Responsibility |
| :--- | :--- | :--- |
| **Auth** | Postgres | Identity, 2FA (OTP), Seller Statistics, and Vetting. |
| **Product** | MongoDB | High-scale catalog, Stock management, Q&A, and Search. |
| **BNPL** | Postgres | The "Trust Engine": Score calculation (0-1000) and Credit Limits. |
| **Order** | Postgres | Transaction persistence, Shipping Manifests, and Coupon logic. |
| **Payment** | Postgres | CARD/EFT processing simulation and event emission. |
| **Notification**| Postgres | Real-time system alerts and Email dispatch simulation. |
| **Recommendation**| MongoDB | AI Insights, Discovery Matrix, and the **AI Concierge**. |

---

## 🚀 Premium Protocol Features

### 🤖 Chommie AI Concierge
A floating neural assistant that guides users through the marketplace.
- **Action-Oriented**: Can trigger UI navigations (Orders, BNPL, Deals).
- **Heuristic Logic**: Backend located in `recommendation-service` for centralized intelligence.

### 🛡️ BNPL Trust Protocol
A behavioral loyalty system that rewards "Good Players."
- **Tiered Limits**: Bronze (R500) to Platinum (R2000+).
- **Trust Discounts**: High scores (>700) unlock automated price drops at checkout.
- **Trust Coins**: Native marketplace currency earned through on-time settlements.

### 📍 Live Logistics Simulation
An Amazon-rivaling tracking experience.
- **Nexus Node Map**: Visual SVG simulation of the package's physical location.
- **HUD Telemetry**: Real-time distance and environment data display.

---

## 🎨 Design System: Vibrant Amazonia
- **Core Palette**: 
  - Primary: `#FF6D1F` (Action Orange)
  - Background: `#FAF3E1` (Deep Ocean Beige)
  - High-Contrast: `#131921` / `#222222` (Charcoal)
- **Visual Language**: Boxy informational density, rounded-sm corners, and horizontal-scroll navigation for mobile-first accessibility.

---

## 🛠️ Developer Operations

### Prerequisites
- Node.js 20+
- PostgreSQL
- MongoDB

### Installation
```bash
npm install
npm run build
```

### Running Locally
```bash
npm run dev
```

### Database Seeding
```bash
# Populates the product catalog via the API Gateway
npm run seed
```

---

## ☁️ Deployment (Render Blueprint)
The project is 100% Render-Ready via `render.yaml`.
1. Connect GitHub repository to Render.
2. Create a "New Blueprint Instance".
3. Render will auto-provision Postgres, Mongo, and all 11 services.

---
© 2026 Chommie.za Marketplace Protocol. All Rights Reserved.
