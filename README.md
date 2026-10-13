# StyleMate — Virtual Closet & AI Outfit Recommender

> *"Your closet. Your style. Smarter."*

StyleMate is a production-grade personal digital wardrobe and smart styling assistant. It enables users to digitize clothing, track laundry and repairs through a two-tier availability system, analyze photos via an extensible AI vision layer, generate multi-criteria outfit combinations, and export their entire wardrobe data into Microsoft Excel (`.xlsx`).

---

## 🌟 Key Features

### 1. Digital Wardrobe Inventory
- **Visual Grid**: Browse clothes with high-resolution imagery, category filtering (*Tops, Bottoms, Outerwear, Shoes, Accessories, Ethnic Wear, Dresses*), full-text search, and favorite tracking.
- **Two-Tier Availability Architecture**:
  - **Permanently Remove from Closet**: Deletes the item permanently from the database.
  - **Temporarily Unavailable**: Keeps the item visible and searchable in your closet, but **strictly excludes it from outfit recommendations** until marked available again. Track reasons (*Laundry, Repair, Packed, Loaned, Seasonal Storage*) and expected return dates.

### 2. AI-Assisted Clothing Classification
- **Smart Image Analyzer**: Upload JPG, PNG, or WEBP images.
- **Provider Abstraction (`IVisionProvider`)**:
  - `MockVisionProvider`: Intelligent deterministic and heuristic vision model operating with zero external API credentials.
  - `GeminiVisionProvider`: Connects to Google Gemini Vision via `GEMINI_API_KEY` with structured JSON schema extraction.
- **Human-in-the-Loop**: Every AI suggestion displays confidence (e.g. *94% Match*) and remains **100% editable** before saving.

### 3. Multi-Criteria Outfit Recommendation Engine
- **Transparent Compatibility Scoring (0–100% Style Match)**:
  - **Occasion Compatibility (30%)**: Event dress-code rules (*College Presentation, Office, Interview, Date, Casual Outing, Party, Wedding, Gym*).
  - **Formality Compatibility (25%)**: Silhouette balance avoiding clashing formal and athletic pieces.
  - **Color Harmony (20%)**: Chromatic balance matrix evaluating neutral anchors (*White, Navy, Black, Beige, Olive, Charcoal*) and complementary pairings.
  - **Weather & Season Comfort (15%)**: Temperature-appropriate layering (*Hot, Warm, Mild, Cold, Rainy*).
  - **Recent-Wear Diversity (10%)**: Dampens recurring recommendations of items worn within the past 4 days.
  - **Personal Preference Bonus**: Boosts items marked as favorites.
- **Natural Explanations**: Generates authentic *"Why this works"* breakdowns for every recommendation.
- **No Available Clothes Diagnosis**: When constraints prevent outfit generation (e.g. formal pants in laundry), diagnoses the bottleneck and displays *"Unavailable items that could help"* with 1-click availability toggles.

### 4. Outfit History & Wear Tracking
- Records outfits marked as *"Worn"* with date, event, notes, and automatically increments each item's wear counter and last-worn timestamp.

### 5. Outfit Calendar Planner
- Weekly interactive calendar to schedule and assign planned outfits in advance.

### 6. Wardrobe Analytics
- Visual analytics for wardrobe utilization, category distribution, color frequencies, and most frequently worn pieces.

### 7. Excel Export (`.xlsx`)
- Generates genuine Microsoft Excel workbooks using SheetJS (`xlsx`) with:
  - **Sheet 1**: Closet Inventory (ID, Name, Category, Type, Color, Material, Fit, Occasions, Seasons, Brand, Availability, Reason, Wear Count)
  - **Sheet 2**: Outfit History (Outfit ID, Date Worn, Occasion, Style, Items Used, Score)
  - **Sheet 3**: Availability History (Item ID, Name, Status Transitions, Reasons, Dates)
  - Custom inclusion checkboxes.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Warm cream `#FAF8F5`, charcoal typography, muted olive `#47583D`)
- **Icons**: Lucide React
- **Database**: SQLite with Prisma ORM (Zero-configuration out-of-the-box local database)
- **Image Storage**: Local filesystem upload pipeline (`/public/uploads/`) with remote URL support
- **Spreadsheets**: SheetJS (`xlsx`)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database & Seed Demo Data
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Or Run Production Server
```bash
npm run build
npm start
```

---

## 🧪 Demo Walkthrough

1. **Dashboard (`/`)**: View wardrobe statistics (18 items, available vs. unavailable breakdown, quick actions, recent outfits).
2. **My Closet (`/closet`)**:
   - Filter by *Shoes* or *Bottoms*.
   - Click on **Black Slim Jeans** — see that it is marked **Temporarily Unavailable (Laundry)**.
   - Click **+ Add New Item** → select **Upload Image & AI Scan** to test automatic attribute detection.
3. **Generate Outfit (`/generate`)**:
   - Select:
     - Event: **College Presentation**
     - Weather: **Hot**
     - Style: **Smart Casual**
   - Click **Generate Outfits**.
   - Notice that **Black Slim Jeans** does NOT appear because it is in laundry.
   - Recommended outfits feature available pieces (e.g., *White Oxford Shirt + Beige Slim Chinos + White Sneakers + Seiko Watch*).
   - Read the *"Why this works"* styling breakdown.
   - Click **Wear This Outfit** to record it in your history.
4. **Outfit History (`/history`)**: Observe the newly recorded outfit in your timeline.
5. **Export (`/export`)**: Select sheets and click **Download Excel (.xlsx)** to download your spreadsheet.
6. **Settings (`/settings`)**: Restore or reset the demo wardrobe with one click at any time.

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── page.tsx                  # Dashboard
│   ├── closet/page.tsx           # My Closet Grid & Management
│   ├── generate/page.tsx         # AI Outfit Generator
│   ├── history/page.tsx          # Outfit History Timeline
│   ├── calendar/page.tsx         # Outfit Calendar Planner
│   ├── analytics/page.tsx        # Wardrobe Analytics
│   ├── export/page.tsx           # Excel Export
│   ├── settings/page.tsx         # Preferences & Demo Reset
│   └── api/                      # Dynamic API Routes
│       ├── closet/               # Items CRUD & Availability toggle
│       ├── analyze-image/        # AI Vision Classification
│       ├── outfits/              # Recommendation & Outfit history
│       ├── analytics/            # Wardrobe metrics
│       ├── export/closet/        # Multi-sheet .xlsx generation
│       └── upload/               # Local file storage
│
├── components/
│   ├── layout/                   # Sidebar, Header, AppLayout
│   ├── closet/                   # ClothingCard, Modals (Detail, Add, Availability, Delete)
│   ├── outfits/                  # OutfitCard, OutfitDetailModal, NoClothesDiagnosis
│   └── ui/                       # Toast notification system
│
├── services/
│   ├── recommendation/           # Scoring engine, color harmony, formality, weather
│   ├── vision/                   # VisionProvider abstraction (Mock + Gemini)
│   ├── export/                   # ExcelExportService (.xlsx workbook generator)
│   └── weather/                  # Weather contextual conditions
│
├── types/                        # TypeScript definitions
└── prisma/                       # Prisma Schema & Seed script
```

---

## 🔒 Environment Variables (`.env`)

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AI_VISION_PROVIDER="mock" # "mock" or "gemini"
GEMINI_API_KEY=""         # Optional API key for Gemini Vision
```
