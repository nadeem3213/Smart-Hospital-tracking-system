# 🚑 MediRoute - Smart Hospital Tracking & Analytics System

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" alt="Socket.io" />
</div>

<br />

MediRoute is a highly dynamic, sophisticated Web Platform designed to synchronize, analyze, and map emergency medical resources across a network of hospitals in true real-time. Built with a modern micro-service architecture, it intelligently directs users to the most readily available hospitals while allowing admins to manage live bed occupancies transparently.

---

## ✨ Core Features

* **⚡ Real-Time Socket Synchronization**: Powered by Socket.io, when bed capacity or hospital statuses change, connected UIs instantly update across the planet without refreshing the page.
* **🤖 AI Triage Chatbot**: Integrated Generative AI agent that analyzes symptoms and cross-references them with live hospital data to recommend the optimal destination.
* **🗺️ Smart Geographic Routing**: Uses MapLeaflet + OSRM to physically draw and calculate "Fastest" and "Alternative" geometric pathings avoiding UI clutter.
* **📈 Data Analytics Dashboard**: Advanced visualizations via Recharts, allowing stakeholders to dissect availability and traffic distributions cleanly.
* **🔐 Role-Based Access Control**: Admins are granted robust mutation capabilities over hospital data while strictly segregated from User-facing dashboards.

---

## 🛠️ Technology Stack

### **Frontend Pipeline**
* **Framework**: React 18 / TypeScript
* **Build Tool**: Vite
* **Styling Engine**: Tailwind CSS + Shadcn/UI Component Library
* **State Management**: Tanstack React Query (auto-invalidating hooks)
* **Animation**: Framer Motion
* **Maps & Geo**: React-Leaflet (`leaflet`)
* **Live Comm**: `socket.io-client`

### **Backend Pipeline**
* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB (via `mongoose`)
* **Authentication**: JWT Tracking & `bcryptjs` encryption
* **Sockets**: `socket.io` API bridging
* **AI Capabilities**: Groq / Google Generative AI SDKs

---

## 🚀 Getting Started

Follow these instructions to safely branch up the application dependencies locally.

### 1. Prerequisites 
Ensure you have `Node.js` (v18+) and standard package managers installed.

### 2. Environment Configuration
You need a `.env` configurations file mapping the internal variables for your database and secrets.
Create an `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=super_secure_secret_key
# Optional AI engine keys
GEMINI_API_KEY=your_key
GROQ_API_KEY=your_key
```

### 3. Launching the Backend
Open Terminal 1 and type:
```bash
cd backend
npm install
npm start
``` 
*(The Express API should successfully boot and log "Connected to MongoDB" along with Socket initializations on Port 5000)*

### 4. Launching the Frontend Frontend 
Open Terminal 2 and type:
```bash
npm install
npm run dev
```
*(Proceed to `http://localhost:5173` locally or via your designated network host ip)*

---

## 🔗 Testing the Real-Time Socket Synchronization (Crucial)

MediRoute is strictly built for high-demand emergency reliability. To test if your WebSocket architecture is successfully mapping data across the ecosystem asynchronously:

1. **Open Split Screens / Parallel Devices:**
   Open the application in two entirely separate browser windows (or even a laptop and a mobile phone connected to the local development network proxy).
2. **Account Execution:**
   - **Window A:** Log into an **Admin** Account.
   - **Window B:** Log into a standard **User** Account (or simply browse the public-facing dashboard view unauthenticated).
3. **Trigger the Mutation:**
   - In Window A (Admin), navigate to the `/hospitals` module.
   - Select any hospital and edit its resources (e.g., lower ICU Beds by 3, or change its status to `Critical`).
4. **Observe the Event:**
   - Watch **Window B** (User). Without clicking refresh, clicking anything, or querying the API manually, you will visually see the UI numbers tick down instantly and the charts re-render utilizing Tanstack cache-invalidation injected strictly through the Socket.io heartbeat listener!

---

## 🎨 Architecture & Styling Principles
This repository strictly relies on `glassmorphic` premium gradients, semantic functional HTML5 routing, zero-gap border grids, and CSS color-variables integrated tightly with modern `hsl()` tokenization to support crisp Light/Dark contrast shifts automatically without breaking map geometries.
