# AUSTCAIC Poster Generator 🎨⚡

> **Internal graphics tool for the AUSTCAIC Graphics Team.**  
> Generate print-ready posters at 300 DPI with fixed brand guidelines — no design software required.

---

## ✨ Features

- 🎯 **300 DPI Print-Ready PNG Exports**: Generate posters at high-resolution print standard sizes (5x8 Poster, A4 Portrait, 5x2 Banner, Facebook Post, Instagram Square, Instagram Story, or Custom dimensions).
- ⚡ **Instant Live Preview**: CSS-based live preview canvas updates in real time as you type with zero lag.
- 🌓 **Light & Dark Theme Modes**: Modern high-contrast user interface with light and dark mode support.
- 🤖 **AI Content Assist**: Auto-generate headlines, subtitles, bullet points, icon badges, and data tables from quick rough notes using **Groq SDK** and **Pinecone**.
- 📋 **Bullet List Builder**: 1 to 3 column layouts, custom Lucide bullet icons, and Left / Center / Right alignment controls.
- 🔀 **Dynamic Section Reordering**: Drag-and-drop or use quick reorder buttons to rearrange Poster Content, Bullet Lists, Tables, Icon Badges, QR Codes, and Uploaded Images.
- 🛡️ **1000+ Searchable Lucide Icon Badges**: Browse icons by category, search by keyword, and set custom X/Y canvas coordinates and badge sizes.
- 📊 **Interactive Table Builder**: Add dynamic columns and rows for schedules, speakers, and event agendas with automatic density auto-scaling.
- 🖼️ **Framed Image Uploads**: Upload event images with Circle, Square, Rectangle, or Borderless frames, custom sizes, and a 9-point position grid.
- 🔗 **Shareable Links & Poster History**: Generate shareable URL edit links and access team poster history saved server-side or locally.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI & Logic**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Rendering Engine**: [Satori](https://github.com/vercel/satori) + [@resvg/resvg-js](https://github.com/yisibl/resvg-js)
- **AI & Storage**: [Groq SDK](https://groq.com/), [Pinecone](https://www.pinecone.io/)

---

## 🚀 Quick Start

### 1. Prerequisites

Make sure you have Node.js 18+ and `npm` installed.

### 2. Installation

Clone the repository and install dependencies inside `poster-app`:

```bash
cd poster-app
npm install
```

### 3. Environment Setup

Create a `.env` or `.env.local` file inside `poster-app/`:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
PINECONE_API_KEY=your_pinecone_api_key_optional
PINECONE_INDEX=austcaic-posters
```

*(Note: Groq powers the AI Quick Notes assistant. Pinecone is optional for vector-based style matching).*

### 4. Download Fonts

Run the font downloader script to load required ArrayBuffer fonts for the Satori rendering engine:

```bash
npm run download-fonts
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

Inside `poster-app`:

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Cleans and builds the optimized production bundle.
- `npm run start`: Starts the production server.
- `npm run download-fonts`: Downloads required font binaries for print export.

---

## 🎨 Branding & Theme Tokens

Design system tokens (colors, fonts, sizes, and layout multipliers) are centrally configured in [`poster-app/lib/theme.ts`](file:///e:/vs%20code%20projects/poster-generator/poster-generator/poster-app/lib/theme.ts):

- `COLORS`: Official AUSTCAIC brand palette (Hex, RGB, and Gradients).
- `FONTS`: Headline (`Oswald`) & Body (`Poppins`).
- `SIZE_PRESETS`: Print preset definitions at 300 DPI.

---

## 📄 License

Internal Tool - AUSTCAIC Graphics Team.
