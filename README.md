# 📊 FinOps Strategic Command Center

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2014-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Anthropic](https://img.shields.io/badge/AI%20Engine-Claude%203.5%20Sonnet-6112d1?style=flat-square)](https://anthropic.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

An enterprise-grade, high-fidelity FinOps dashboard designed for deep ML Model Attribution and Chargeback analysis. Powered by **Claude 3.5 Sonnet**, this platform transforms raw cloud billing data into actionable financial strategy.

---

## 🌟 Key Features

### 🏢 Multi-Tenant White-Labeling
The dashboard supports seamless multi-brand deployments via environment variables. The system dynamically updates the application title, logo, and brand name project-wide.
- **Brands Supported**: `Company (Default)`, `Persistant`, `Cogniify`.
- **Configurable**: Managed via `src/config/branding.ts` and `NEXT_PUBLIC_BRAND`.

### 🧠 Strategic AI Advisor
Built-in AI Chatbot providing real-time financial consulting:
- **Analyze**: Interpret vertical cost concentration and portfolio efficiency.
- **Recommend**: Suggest infrastructure shifts (Dedicated vs Shared models).
- **Format**: All answers are provided in a clean, bulleted format starting with `answer : ` and using double underscores (`__`) for emphasis, ensuring maximum readability in exports.

### 📈 Advanced Analytics
- **Executive Summary**: High-level KPIs including Ownership Concentration and Attribution Stability.
- **Initiative Attribution**: Deep-dive into model-to-initiative mapping with time-series trends.
- **Vertical Usage**: Segmented cost analysis across Credit Cards (CC), Personal Loans (PL), and Insurance (INS).
- **Model Portfolio**: Technical breakdown of individual model costs and ownership types.

---

## ⚙️ Configuration & Setup

### 1. Environment Setup
Create a `.env` file in the root directory and add the following keys:

```env
# Anthropic API Configuration
VITE_ANTHROPIC_API_KEY=your_key_here

# Brand Selection (Optional: company, persistant, cogniify)
NEXT_PUBLIC_BRAND=persistant
```

### 2. API Verification
The currently configured Anthropic API key in this environment ends with:
> **`***J-1jwAA`** (Last 7 characters)

### 3. Installation
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

---

## 📂 Project Structure

```text
src/
├── app/              # Next.js App Router (Layouts & Pages)
├── api/              # Serverless API routes (Chatbot logic)
├── components/       # UI Components (Charts, Sidebar, Insights)
├── config/           # Centralized Brand & App configuration
└── public/           # Static assets (Brand Logos, Data)
```

## 🔐 Security & Integrity
- **Local Processing**: Data parsing (PapaParse) happens entirely in-browser.
- **Secure API Bridge**: Anthropic calls are proxied through server-side routes to protect API keys.
- **Integrity Framework**: Built-in verification for schema consistency between Billing and Attribution datasets.

---

Proudly built with a focus on **Visual Excellence** and **Strategic Clarity**.
