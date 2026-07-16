# ⚽ FanPilot AI — The Elite 2026 Football Fan Companion

**FanPilot AI** is a premium, full-stack, AI-powered travel assistant and stadium navigation guide designed specifically for global supporters attending the **2026 FIFA World Cup** across the USA, Mexico, and Canada. Built around a cohesive, ultra-modern **Sophisticated Dark** aesthetic, FanPilot AI acts as a smart, localized companion that breaks down linguistic, regional, and logistical barriers in real-time.

---

## 🎨 Design Philosophy: "Sophisticated Dark"

This application has been meticulously styled to reflect a high-contrast, premium dark mode optimized for outdoor mobile use under bright stadium lights:
* **The Cosmic Slate Canvas**: Styled entirely in pitch-blacks (`#050505` and `#0a0a0a`) with delicate semi-transparent borders (`border-white/10`) to eliminate eye strain.
* **Premium Typography Pairs**: Headings and displays use **Playfair Display** (an elegant serif with thin, italic curves), general user interface controls utilize **Outfit & Inter** (for ultimate readability), and stadium coordinates utilize **JetBrains Mono** to project a high-fidelity, data-dense look.
* **Vibrant Accent Tones**: Neon electric blues (`#3b82f6`) highlight primary actions, while emerald green (`#10b981`) represents security checklists, and amber-gold (`#fbbf24`) frames warnings and cultural slang insight alerts.

---

## 🚀 Key Modules & Capabilities

### 1. 🌆 Host Cities & Venues Directory
Explore highly contextual guides for the tournament's focal arenas:
* **Estadio Azteca (Mexico City, Mexico)**: Detailed transport via Tren Ligero from Metro Tasqueña, local snacks like *Tacos de canasta*, and strict gate regulations.
* **SoFi Stadium (Los Angeles, USA)**: Strict NFL clear-bag rules, LA Street Dog recommendations, and C-Line/K-Line shuttle connections.
* **BC Place (Vancouver, Canada)**: Walkable Skytrain routes, Okanagan wine details, *Japadogs*, and retractable roof guidelines.
* **MetLife Stadium (East Rutherford, USA)**: Secaucus Meadowlands rail guides, Taylor Ham/Pork roll specialties, and NYC express busses.
* **Estadio BBVA (Monterrey, Mexico)**: Shaded metro walking corridors, Monterrey arrachera tacos, and local Regio drafts.

### 2. 🗣️ Language & Slang Coach (Gemini AI Powered)
Navigate matches in local tongue without getting lost in translation:
* **Cultural Phrasebook**: Authentic pre-loaded phrases categorized by Matchday Essentials, Food & Drink, Transit, Chants, and Emergencies.
* **Voice TTS Player**: Synthesizes and speaks phrases in natural Spanish or English using custom audio components to bridge face-to-face conversations.
* **Slang Translation Coach**: Grounded server-side **Gemini 3.5** translates any query on-the-fly, generating phonetic pronunciation codes, cultural context explanations, and localized match-day supporter tips.

### 3. 🚇 Match-Day Timeline Planner & Gate Locator
Never miss the opening kick-off:
* **Timeline Generator**: Tailors a minute-by-minute itinerary from your specific hotel location to the kick-off seats based on transport preferences (Transit, Rideshare, Walking, Cycling) and fan styles (*Early Tailgater* vs *Balanced* vs *Efficient*).
* **Vibration Reminders**: Interactive checklist items where supporters can activate custom countdown alarm bells for each transit segment.
* **Section Gate Locator**: Input any seating section on your matchday ticket to instantly locate the closest arena entrance gate, seating bowl zone, and helpful entry hints.

### 4. 🏟️ Grounded Stadium Copilot Chat
Your private stadium concierge available at all times:
* **Playbook Grounded Chat**: Multi-turn chat interface directly integrated with official stadium handbooks. Answers specific questions on parking structures, cashless payment policies, camera rules, and security guidelines.
* **Quick-Prompt Selector**: Rapidly asks pre-composed questions with one-tap shortcuts to speed up queries when walking through crowded turnstiles.

---

## 🛠️ Technology & Architecture Stack

The codebase is built on top of high-performance modern web technologies:
* **Frontend SPA Framework**: React 19 paired with Vite 6 for rapid rendering.
* **Fluid Interface Animations**: Powered by `motion` (`motion/react`) for elegant page loads and tab shifts.
* **Dynamic Iconography**: High-contrast SVG line-icons provided by `lucide-react`.
* **Micro-services API Server**: Custom Node.js Express server configured to run server-side requests securely, preventing any client-side API key leakage.
* **Advanced AI Engine**: Official Google Gen AI SDK (`@google/genai`) loaded with `gemini-3.5-flash` for high-speed, highly-reliable semantic processing.

---

## 📡 Backend API Reference

### `POST /api/translate`
Translates user phrases with a focus on local slang.
* **Request Body**:
  ```json
  {
    "text": "Where can I buy water?",
    "sourceLang": "English",
    "targetLang": "Mexican Spanish",
    "cityId": "mexico_city"
  }
  ```
* **Response Pattern**:
  ```json
  {
    "translation": "¿Dónde mero puedo comprar agua?",
    "phonetic": "Dohn-deh meh-ro pweh-doh cohm-prahr ah-gwah",
    "contextExplanation": "Uses local Mexican slang 'mero' to express precisely.",
    "footballTermTip": "Tip: Hydration is crucial! Draft beers inside are strictly cashless."
  }
  ```

### `POST /api/navigation`
Generates a detailed travel itinerary from hotel to stadium.
* **Request Body**:
  ```json
  {
    "cityId": "mexico_city",
    "stadiumName": "Estadio Azteca",
    "hotelLocation": "Downtown Hilton",
    "transportMode": "Public Transit",
    "matchTime": "18:00",
    "fanStyle": "balanced"
  }
  ```
* **Response Pattern**: An array of `ItineraryItem` objects.

### `POST /api/copilot`
Multi-turn conversational chat grounded in specific arena handbooks.
* **Request Body**:
  ```json
  {
    "messages": [
      { "id": "1", "sender": "user", "text": "Can I bring an umbrella?" }
    ],
    "cityId": "vancouver"
  }
  ```
* **Response Pattern**:
  ```json
  {
    "text": "BC Place has a retractable roof, so umbrellas are prohibited inside. Please wear a waterproof poncho if rain is forecasted!"
  }
  ```

---

## 💻 Local Installation & Setup

Ensure you have **Node.js 18+** installed on your system.

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root workspace and define your Gemini credentials (never prefix server-side variables with `VITE_` to protect key secrecy):
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

3. **Launch the Development Server**:
   ```bash
   npm run dev
   ```
   The dev server will boot and serve the frontend assets + proxy API requests on port **`3000`** (accessible locally at `http://localhost:3000`).

4. **Production Build**:
   Compiles Vite static client assets and bundles the Express server-side TypeScript code using Esbuild:
   ```bash
   npm run build
   ```

5. **Start Production Container**:
   Runs the optimized bundle securely from the `dist/` workspace:
   ```bash
   npm run start
   ```

---

## ⚽ Legals
This application is an independent international travel aid designed specifically for supporters attending the matches. It has no affiliation, license, or endorsement from FIFA, national teams, or official arena operators.
