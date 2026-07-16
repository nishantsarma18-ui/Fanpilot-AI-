import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());

// Middleware to normalize Netlify serverless function path routing and direct to Express api handlers
app.use((req, res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '/api');
  } else if (!req.url.startsWith('/api') && (req.url.startsWith('/copilot') || req.url.startsWith('/translate') || req.url.startsWith('/navigation'))) {
    req.url = '/api' + req.url;
  }
  next();
});

// Function to load the Gemini API key from multiple sources with high convenience for Netlify and custom deployments
function loadApiKey(): string | undefined {
  // 1. Prioritize environment variable (e.g. set in Netlify / Cloud Run dashboard or local .env)
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MOCK_KEY') {
    return process.env.GEMINI_API_KEY;
  }

  // 2. Check config.json in the project root
  try {
    const rootConfigPath = path.join(process.cwd(), 'config.json');
    if (fs.existsSync(rootConfigPath)) {
      const data = JSON.parse(fs.readFileSync(rootConfigPath, 'utf8'));
      if (data.GEMINI_API_KEY && data.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' && data.GEMINI_API_KEY.trim() !== '') {
        return data.GEMINI_API_KEY.trim();
      }
    }
  } catch (e) {
    console.warn("Warning: Failed to parse root config.json:", e);
  }

  // 3. Check src/config.json
  try {
    const srcConfigPath = path.join(process.cwd(), 'src', 'config.json');
    if (fs.existsSync(srcConfigPath)) {
      const data = JSON.parse(fs.readFileSync(srcConfigPath, 'utf8'));
      if (data.GEMINI_API_KEY && data.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' && data.GEMINI_API_KEY.trim() !== '') {
        return data.GEMINI_API_KEY.trim();
      }
    }
  } catch (e) {
    console.warn("Warning: Failed to parse src/config.json:", e);
  }

  // 4. Hardcoded key fallback - allow user to commit the key directly to their repository
  const HARDCODED_API_KEY: string = ""; // Paste your key here (e.g. "AIzaSy...") to embed it inside the code
  if (HARDCODED_API_KEY && HARDCODED_API_KEY.trim() !== "") {
    return HARDCODED_API_KEY.trim();
  }

  return undefined;
}

const apiKey = loadApiKey();
if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY could not be loaded from process.env, config.json, or code fallback.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || 'MOCK_KEY',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Match-day Stadium Assistants Knowledge groundings
const stadiumKnowledge: Record<string, string> = {
  mexico_city: `
    Stadium: Estadio Azteca, Mexico City.
    Capacity: 87,523.
    Bag Policy: Clear plastic, vinyl, or PVC bags not exceeding 30x15x30 cm. Small clutch bags maximum 11.5x16.5 cm. No backpacks or professional cameras.
    Security rules: Strict search at entry. Belts with big metal buckles might be confiscated. No flares, bottles, or laser pointers.
    Transportation: Metro Line 2 to Tasqueña station, then change to Tren Ligero (Light Rail) to Estadio Azteca station. Ensure you leave downtown 2 hours early.
    Food Inside: Tacos de canasta, tacos al pastor, quesadillas, esquites (corn in a cup), local Mexican draft beers, and sodas.
    Gates: Gate A (Insurgentes), Gate B (Calzada de Tlalpan), Gate C (Clubes), Gate D (Palcos).
  `,
  los_angeles: `
    Stadium: SoFi Stadium, Inglewood, Los Angeles.
    Capacity: 70,240.
    Bag Policy: Strict NFL Clear Bag Policy. Clear vinyl or PVC bags max 12x6x12 inches, or small clutches max 4.5x6.5 inches.
    Security rules: Metal detectors at gates. No banners with poles, no outside food or beverages, cashless venue (card/contactless payment only).
    Transportation: Metro C Line to Hawthorne/Lennox Station, then catch the free stadium shuttle. Or Metro K Line to Downtown Inglewood Station and shuttle.
    Food Inside: LA Street Dogs, Korean BBQ tacos, specialized burgers, local craft beers, churros.
    Gates: Gate 1 (AA Plaza), Gate 5 (Century Blvd), Gate 8 (Prairie Ave), Gate 11 (VIP).
  `,
  vancouver: `
    Stadium: BC Place, Vancouver.
    Capacity: 54,500.
    Bag Policy: Clear bags only, maximum size 12x6x12 inches. Small clutches max 4.5x6.5 inches are allowed. No backpacks, diaper bags, or laptop bags.
    Security rules: Retractable roof might be open or closed depending on weather. Cashless stadium. Professional cameras with detachable lenses are prohibited.
    Transportation: SkyTrain to Stadium-Chinatown Station (Expo Line) or Yaletown-Roundhouse Station (Canada Line). Highly walkable from downtown.
    Food Inside: Classic poutine, Japadog (Japanese-style fusion hot dogs), local Okanagan wines, salmon snacks, local British Columbia craft beer.
    Gates: Gate A (Robson St), Gate C (Pacific Blvd), Gate E (Griffiths Way), Gate H (Terry Fox Plaza).
  `,
  new_york: `
    Stadium: MetLife Stadium, East Rutherford, NJ.
    Capacity: 82,500.
    Bag Policy: Clear bag policy strictly enforced. Bags must be clear plastic, vinyl, or PVC and not exceed 12x6x12 inches. Small clutch purses 4.5x6.5 inches max are allowed.
    Security rules: Metal detectors, cashless payments only, no umbrellas, no video recorders.
    Transportation: NJ Transit Meadowlands Rail Line from NYC Penn Station/Secaucus Junction directly to the stadium station. Or Coach USA 351 Express Bus from Port Authority. Train is highly recommended to avoid severe highway traffic.
    Food Inside: Jersey Taylor Ham/Pork roll breakfast rolls, NY-style cheese pizzas, pastrami sandwiches, Bavarian soft pretzels, local IPAs.
    Gates: Verizon Gate, MetLife Gate, Pepsi Gate, Bud Light Gate.
  `,
  monterrey: `
    Stadium: Estadio BBVA (El Gigante de Acero), Monterrey.
    Capacity: 53,500.
    Bag Policy: Small clear bags only (max 30x30 cm). No backpacks, professional gear, or large umbrellas.
    Security rules: Cashless and cash mixed depending on stalls. Intense local rivalry atmosphere, keep neutral or wear Mexico jersey.
    Transportation: Metro Line 1 to Exposición station, followed by a scenic 15-minute shaded walking corridor to the stadium.
    Food Inside: Cabrito roast goat skewers, Arranchera skirt steak tacos, Tacos de trompo, local Regio draft beers, Glorias sweets.
    Gates: Gate 1 (Norte), Gate 2 (Oriente), Gate 3 (Sur), Gate 4 (Poniente).
  `
};

// 1. Translation & Slang Coach API
app.post('/api/translate', async (req, res) => {
  const { text, sourceLang, targetLang, cityId } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required for translation' });
  }

  const hostContext = cityId ? `grounded in the culture of host city ${cityId}` : 'general football tournament context';

  const systemInstruction = `
    You are an expert multilingual translator and football culture guide for the FIFA World Cup 2026.
    Translate the user's text from ${sourceLang || 'detect language'} into ${targetLang || 'Mexican Spanish'}.
    The translation must feel natural, authentic, and utilize local dialect, local slang terms, and football terms popular in the target country (USA, Mexico, or Canada).
    
    Structure your response as a valid JSON object with the following properties:
    - translation: The natural translated text.
    - phonetic: A friendly phonetic pronunciation guide for speakers of ${sourceLang || 'English'}.
    - contextExplanation: Cultural context about the phrase, explaining any local slang, idioms, or cultural nuances used.
    - footballTermTip: A useful tip or interesting fact related to football culture, food, or fans in that location.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Translate and culturally annotate this phrase: "${text}" ${hostContext}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translation: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            contextExplanation: { type: Type.STRING },
            footballTermTip: { type: Type.STRING }
          },
          required: ['translation', 'phonetic', 'contextExplanation', 'footballTermTip']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('No content returned from Gemini API');
    }

    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error('Translation error:', error);
    res.status(500).json({
      error: 'Failed to translate',
      message: error.message,
      fallback: {
        translation: text,
        phonetic: "N/A",
        contextExplanation: "Offline fallback: Check your internet connection or API key configuration in settings.",
        footballTermTip: "Tip: Football is a universal language! Smile, use hand gestures, and share a cheering toast."
      }
    });
  }
});

// 2. Intelligent Match-Day Navigation & Transit Planner API
app.post('/api/navigation', async (req, res) => {
  const { cityId, stadiumName, hotelLocation, transportMode, matchTime, fanStyle } = req.body;

  if (!cityId || !stadiumName || !hotelLocation) {
    return res.status(400).json({ error: 'Missing required parameters: cityId, stadiumName, and hotelLocation are required.' });
  }

  const stadiumRules = stadiumKnowledge[cityId] || 'General FIFA rules apply.';

  const systemInstruction = `
    You are a professional Match-day Transport Logistics Specialist for the FIFA World Cup 2026.
    Generate a precise, realistic, minute-by-minute transit plan and timeline for a fan traveling to the stadium.
    
    User details:
    - Host City: ${cityId}
    - Stadium: ${stadiumName}
    - Starting location (Hotel/Hotspot): ${hotelLocation}
    - Transport mode selected: ${transportMode || 'Public Transit'}
    - Match Kick-off Time: ${matchTime || '18:00'}
    - Fan travel style: ${fanStyle || 'balanced'} (options: 'early_bird' - tailgates 4 hours early, 'balanced' - arrives 1.5 hours early, 'efficient' - arrives right before kickoff)
    
    Grounded stadium logistics:
    ${stadiumRules}

    Determine realistic travel times, security wait times (usually 30-40 minutes on World Cup matchdays), and gate walk times.
    Generate a complete sequence of 5 to 7 logical match-day itinerary steps starting from leaving the hotel, transit steps, stadium gate arrival, seat finding, and post-match exit.

    Provide the output in a JSON array format. Each element must be an ItineraryItem object with the following properties:
    - id: Unique short string (e.g., "step1", "step2")
    - time: Hour string in 24h format (e.g., "15:30") calculated precisely backward and forward from kickoff time
    - activity: Clear, engaging, descriptive travel instruction or activity
    - location: Where this step occurs (e.g., "Penn Station NY", "MetLife Stadium Gate A")
    - type: One of 'transit' (for travel/walking), 'stadium' (for gate/entry/seats), 'social' (for food/tailgating), 'match' (for kickoff/half-time)
    - completed: boolean (set to false)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Create my personalized World Cup match-day journey from ${hotelLocation} to ${stadiumName}.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              time: { type: Type.STRING },
              activity: { type: Type.STRING },
              location: { type: Type.STRING },
              type: { type: Type.STRING },
              completed: { type: Type.BOOLEAN }
            },
            required: ['id', 'time', 'activity', 'location', 'type', 'completed']
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('No timeline returned from Gemini API');
    }

    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error('Itinerary generation error:', error);
    // Return a solid fallback schedule so the user is never left hanging
    const fallbackTime = matchTime || '18:00';
    const hour = parseInt(fallbackTime.split(':')[0]);
    const min = fallbackTime.split(':')[1];

    res.json([
      {
        id: 'fallback_1',
        time: `${hour - 3}:${min}`,
        activity: `Leave hotel at ${hotelLocation} and head to transit using ${transportMode}. Carry only clear bags.`,
        location: hotelLocation,
        type: 'transit',
        completed: false
      },
      {
        id: 'fallback_2',
        time: `${hour - 2}:${min}`,
        activity: `Arrive near ${stadiumName}. Follow volunteer signs towards security gates. Keep ticket QR code ready on phone.`,
        location: `${stadiumName} Outer Plaza`,
        type: 'transit',
        completed: false
      },
      {
        id: 'fallback_3',
        time: `${hour - 1}:15`,
        activity: `Pass through security screening and bag checks. Scan ticket to enter stadium concourse.`,
        location: `${stadiumName} Security Gates`,
        type: 'stadium',
        completed: false
      },
      {
        id: 'fallback_4',
        time: `${hour - 0}:45`,
        activity: `Locate food/drink concession stands and pick up local World Cup specialties! Then navigate to your seat row.`,
        location: `${stadiumName} Concourse`,
        type: 'social',
        completed: false
      },
      {
        id: 'fallback_5',
        time: fallbackTime,
        activity: `KICKOFF! Enjoy the electric World Cup atmosphere and cheer responsibly!`,
        location: `${stadiumName} Seats`,
        type: 'match',
        completed: false
      }
    ]);
  }
});

// 3. AI Copilot Stadium Assistant Chat API
function getSmartLocalResponse(query: string, cityId: string): string {
  const q = query.toLowerCase();
  
  // MetLife Stadium (new_york)
  if (cityId === 'new_york') {
    if (q.includes('parking') || q.includes('park') || q.includes('car') || q.includes('garage') || q.includes('lot') || q.includes('drive')) {
      return `🚗 **MetLife Stadium Parking Guide (New York/New Jersey):**
• **Pre-Purchase Mandatory:** All parking passes must be purchased online in advance. No drive-up or cash parking is sold at the gate.
• **Parking Lots:** General parking lots typically open **5 hours prior** to kickoff. 
• **Tailgating:** Permitted in all stadium parking lots, provided you stay within your designated single parking space. No open flames are allowed near the stadium.
• **Rideshare Drop-off:** Designated rideshare zone (Uber/Lyft/Taxi) is located in **Lot E** off Route 120. Post-game delays are severe, so train transit is highly recommended over driving.`;
    }
    if (q.includes('bag') || q.includes('pack') || q.includes('purse') || q.includes('clutch') || q.includes('bring') || q.includes('allow') || q.includes('restrict')) {
      return `🎒 **MetLife Stadium Bag Policy (New York/New Jersey):**
• **Strict Clear Bag Policy:** Only clear plastic, vinyl, or PVC bags not exceeding **12" x 6" x 12"** are allowed.
• **Small Clutches:** One non-clear small clutch purse or wallet under **4.5" x 6" x 6.5"** is permitted (with or without a strap).
• **Prohibited Bags:** Standard backpacks, diaper bags, laptop bags, briefcases, and coolers are strictly banned.
• **Storage:** There are portable bag-check trailers located outside the Verizon, MetLife, and Pepsi gates for a small fee if your bag exceeds regulations.`;
    }
    if (q.includes('transit') || q.includes('train') || q.includes('subway') || q.includes('bus') || q.includes('get to') || q.includes('transport') || q.includes('route') || q.includes('direction') || q.includes('uber') || q.includes('rideshare') || q.includes('taxi')) {
      return `🚇 **MetLife Stadium Transit Guide:**
• **NJ Transit Rail (Highly Recommended):** Take the Meadowlands Rail Line directly from **New York Penn Station** or **Secaucus Junction** straight to the stadium station. This is by far the fastest and most reliable route.
• **Coach USA 351 Bus:** Board the 351 Express Bus at Port Authority Bus Terminal (NYC) for a direct express trip to the stadium lot.
• **Rideshare (Uber/Lyft):** Designated pickup/drop-off is in **Lot E**. Note that post-match traffic is notoriously heavy and wait times often exceed 90 minutes. Taking the train is highly recommended.`;
    }
    if (q.includes('food') || q.includes('eat') || q.includes('drink') || q.includes('beer') || q.includes('special') || q.includes('concession') || q.includes('tasty') || q.includes('dine') || q.includes('cash') || q.includes('pay') || q.includes('card')) {
      return `🍔 **MetLife Stadium Dining & Payment Guide:**
• **Local Culinary Specialties:** Look out for NJ's famous Taylor Ham/pork roll egg-and-cheese breakfast rolls, authentic NY-style pizza slices, hot pastrami on rye, and giant Bavarian soft pretzels.
• **Drinks:** A wide variety of domestic beers, local NJ craft IPAs, sodas, and bottled water are available throughout the concourse.
• **Cashless Stadium:** MetLife is **100% cashless**. Only credit/debit cards and mobile payments (Apple Pay, Google Pay) are accepted. Cash-to-card kiosks are available inside the stadium gates if needed.`;
    }
    if (q.includes('safety') || q.includes('emergency') || q.includes('medical') || q.includes('lost') || q.includes('police') || q.includes('security') || q.includes('first aid') || q.includes('rule') || q.includes('restrict') || q.includes('law')) {
      return `🚨 **MetLife Stadium Safety & Security Rules:**
• **Screening:** All guests must pass through walk-through metal detectors. Clear bags will be visually inspected.
• **Umbrellas & Cameras:** Umbrellas and professional video recorders are strictly prohibited. Small point-and-shoot cameras are allowed.
• **First Aid:** Medical stations are located on the Plaza level (near Section 144) and in the upper deck concourses.
• **Emergency Contact:** Text "MLSAFE" followed by your location and issue to **69050** to discreetly reach stadium security.`;
    }
    if (q.includes('gate') || q.includes('entrance') || q.includes('entry') || q.includes('door')) {
      return `🎟️ **MetLife Stadium Gate Information:**
• **Gates:** The stadium features four major gates: **Verizon Gate**, **MetLife Gate**, **Pepsi Gate**, and **Bud Light Gate**.
• **Arrive Early:** It is highly recommended to arrive at least **2.5 hours before kickoff** to pass through the outer security screening perimeter smoothly.
• **Gate Times:** General public stadium gates typically open **2 hours** prior to match kickoff.`;
    }
    // Default fallback overview for New York
    return `🗽 **Welcome to MetLife Stadium (New York/New Jersey) Fan Guide:**
• **Clear Bag Policy:** Bags must be clear plastic/vinyl/PVC under **12" x 6" x 12"**. Small clutches under **4.5" x 6.5"** are allowed.
• **Transit Tip:** Take the **NJ Transit Meadowlands Rail** from NYC Penn Station or Secaucus Junction. Avoid rideshares due to severe traffic.
• **Cashless Venue:** Only credit/debit cards and mobile payments are accepted.
• **Local Food:** Try Taylor Ham breakfast rolls, NYC pizza slices, and NY/NJ craft beers.
• **Arrival:** Arrive **2.5 hours early** to ensure a stress-free entry.`;
  }

  // Estadio Azteca (mexico_city)
  if (cityId === 'mexico_city') {
    if (q.includes('parking') || q.includes('park') || q.includes('car') || q.includes('garage') || q.includes('lot') || q.includes('drive')) {
      return `🚗 **Estadio Azteca Parking Guide (Mexico City):**
• **Extremely Limited Parking:** On-site parking is highly restricted and gets completely congested hours before kick-off.
• **Arrive Early:** If you must drive, arrive at least **3 to 4 hours early** to secure a space in the official stadium perimeter lots.
• **Cost:** Expect a cash parking fee (in Mexican Pesos) at the stadium gates. Keep small bills handy.
• **Alternative (Highly Recommended):** Avoid driving entirely if possible. Taking the **Tren Ligero (Light Rail)** from Tasqueña station straight to the Estadio Azteca station is much faster and hassle-free.`;
    }
    if (q.includes('bag') || q.includes('pack') || q.includes('purse') || q.includes('clutch') || q.includes('bring') || q.includes('allow') || q.includes('restrict')) {
      return `🎒 **Estadio Azteca Bag Policy (Mexico City):**
• **Clear Bags Only:** Only clear plastic, vinyl, or PVC bags not exceeding **30x15x30 cm** are permitted.
• **Small Clutches:** Small non-clear clutch purses under **11.5x16.5 cm** are allowed.
• **Prohibited Items:** Backpacks, duffel bags, briefcases, and professional cameras with detachable lenses are strictly banned.
• **Storage:** Limited locker/luggage check services are available outside the stadium main gates for a small fee.`;
    }
    if (q.includes('transit') || q.includes('train') || q.includes('subway') || q.includes('bus') || q.includes('get to') || q.includes('transport') || q.includes('route') || q.includes('direction') || q.includes('uber') || q.includes('rideshare') || q.includes('taxi')) {
      return `🚇 **Estadio Azteca Transit Guide:**
• **Subway & Light Rail (Recommended):** Take Metro Line 2 (Blue Line) to the southern terminus **Tasqueña station**, then transfer immediately to the **Tren Ligero (Light Rail)** to the **Estadio Azteca station**.
• **Traffic Warning:** Traffic in the south of Mexico City is exceptionally heavy. Leave downtown at least **2 hours** prior to kick-off.
• **Rideshare & Taxis:** Ubers and official authorized "Sitio" cabs have designated drop-off and pick-up zones near the outer gates.`;
    }
    if (q.includes('food') || q.includes('eat') || q.includes('drink') || q.includes('beer') || q.includes('special') || q.includes('concession') || q.includes('tasty') || q.includes('dine') || q.includes('cash') || q.includes('pay') || q.includes('card')) {
      return `🌮 **Estadio Azteca Dining & Payment Guide:**
• **Authentic CDMX Food:** Indulge in warm **Tacos de Canasta** (basket tacos), **Tacos al Pastor**, melted Quesadillas, and savory **Esquites** (corn cups with mayo and lime).
• **Beverages:** Ice-cold Mexican draft beers, sodas, and waters are sold directly at concession stands and by stadium vendors.
• **Payment:** A combination of cash and cards are accepted at various stalls. It is highly recommended to keep some Mexican Pesos (cash) on hand for street-style vendors.`;
    }
    if (q.includes('safety') || q.includes('emergency') || q.includes('medical') || q.includes('lost') || q.includes('police') || q.includes('security') || q.includes('first aid') || q.includes('rule') || q.includes('restrict') || q.includes('law')) {
      return `🚨 **Estadio Azteca Security & Safety:**
• **Strict Searches:** High-intensity search checks are conducted at entry gates.
• **Confiscations:** Large belts with metal buckles, coins, umbrellas, and lasers are often confiscated. Dress lightly!
• **Atmosphere:** Super passionate and loud. Keep neutral or wear a Mexico/host-country jersey.
• **Medical Support:** First aid stations are staffed by paramedics near Sections 100 and 300.`;
    }
    if (q.includes('gate') || q.includes('entrance') || q.includes('entry') || q.includes('door')) {
      return `🎟️ **Estadio Azteca Gates & Entry:**
• **Key Gates:** Entry is sorted by **Gate A (Insurgentes)**, **Gate B (Calzada de Tlalpan)**, **Gate C (Clubes)**, and **Gate D (Palcos)**. Check your ticket for the assigned zone.
• **Timing:** Arrive at least **2.5 hours early** to comfortably pass through the multiple rings of security.`;
    }
    return `🇲🇽 **Welcome to Estadio Azteca (Mexico City) Fan Guide:**
• **Clear Bags:** Clear plastic bags under **30x15x30 cm** only. No backpacks.
• **Transit:** Take **Metro Line 2 to Tasqueña**, then transfer to the **Tren Ligero** directly to Estadio Azteca. Leave 2 hours early!
• **Local Food:** Feast on Tacos al Pastor, Tacos de Canasta, and Esquites. Keep cash handy!
• **Security Check:** Belts with large metal buckles are often confiscated at gates.`;
  }

  // SoFi Stadium (los_angeles)
  if (cityId === 'los_angeles') {
    if (q.includes('parking') || q.includes('park') || q.includes('car') || q.includes('garage') || q.includes('lot') || q.includes('drive')) {
      return `🚗 **SoFi Stadium Parking Guide (Los Angeles):**
• **100% Pre-Booked Only:** Parking passes must be booked online in advance via the SoFi Stadium site. Drive-up parking is not available.
• **Zones:** Parking is divided into color zones (Blue, Green, Brown, Orange, Red, Pink). Make sure to navigate directly to your assigned zone's gate.
• **Tailgating:** Tailgating is **only** allowed in designated spaces within the **Pink Zone** parking lots (Lots L, N, P) with a valid tailgating parking permit.
• **Rideshare:** Located at the transit center on Prairie Avenue (between Kelso St and Hardy St).`;
    }
    if (q.includes('bag') || q.includes('pack') || q.includes('purse') || q.includes('clutch') || q.includes('bring') || q.includes('allow') || q.includes('restrict')) {
      return `🎒 **SoFi Stadium Bag Policy (Los Angeles):**
• **Strict NFL Clear Bag Policy:** Only clear plastic, vinyl, or PVC bags max **12" x 6" x 12"** are allowed.
• **Small Clutches:** One non-clear clutch or wristlet under **4.5" x 6.5"** is permitted.
• **Prohibited:** Backpacks, diaper bags, clear backpacks with multiple pockets, and fanny packs are strictly prohibited.`;
    }
    if (q.includes('transit') || q.includes('train') || q.includes('subway') || q.includes('bus') || q.includes('get to') || q.includes('transport') || q.includes('route') || q.includes('direction') || q.includes('uber') || q.includes('rideshare') || q.includes('taxi')) {
      return `🚇 **SoFi Stadium Transit Guide:**
• **Metro & Shuttle (Recommended):** Take the **Metro C Line** to Hawthorne/Lennox Station or the **K Line** to Downtown Inglewood, then hop on the free dedicated stadium shuttle buses.
• **Rideshare (Uber/Lyft):** Designated zone is at the transit center on Prairie Avenue. Traffic post-game is heavy; prepare for high surge pricing.
• **Mandatory Pre-Booked Parking:** Drive-up parking is not available. You must pre-book parking passes online.`;
    }
    if (q.includes('food') || q.includes('eat') || q.includes('drink') || q.includes('beer') || q.includes('special') || q.includes('concession') || q.includes('tasty') || q.includes('dine') || q.includes('cash') || q.includes('pay') || q.includes('card')) {
      return `🍔 **SoFi Stadium Dining & Cashless Rules:**
• **Local Culinary Favorites:** Try the iconic **LA Street Dogs** (bacon-wrapped danger dogs), Korean BBQ tacos, Birria Quesatacos, and California double cheeseburgers.
• **Cashless Stadium:** SoFi is **100% cashless**. Only mobile payments and cards are accepted. Cash-to-card kiosks are present at main entries.`;
    }
    if (q.includes('safety') || q.includes('emergency') || q.includes('medical') || q.includes('lost') || q.includes('police') || q.includes('security') || q.includes('first aid') || q.includes('rule') || q.includes('restrict') || q.includes('law')) {
      return `🚨 **SoFi Stadium Safety & Rules:**
• **Metal Detectors:** State-of-the-art walk-through security screeners are active.
• **Prohibited:** Banners with rigid poles, outside food/drinks, and professional cameras are prohibited.
• **First Aid:** Located near Sections 120, 230, and 320 for any medical assistance.`;
    }
    if (q.includes('gate') || q.includes('entrance') || q.includes('entry') || q.includes('door')) {
      return `🎟️ **SoFi Stadium Gates:**
• **Major Gates:** Entering is organized via **Gate 1 (American Airlines Plaza)**, **Gate 5 (Century Blvd)**, **Gate 8 (Prairie Ave)**, and **Gate 11 (VIP)**.
• **Timing:** Arrive **2 hours early** to easily navigate the massive structure and find your seats.`;
    }
    return `🇺🇸 **Welcome to SoFi Stadium (Los Angeles) Fan Guide:**
• **NFL Clear Bag Rules:** Clear bags up to **12" x 6" x 12"** only. Small clutches max **4.5" x 6.5"**.
• **Transit:** Take **Metro C Line to Hawthorne/Lennox** and catch the free stadium shuttle.
• **Food:** Try LA Street Dogs, Korean BBQ tacos, and craft beers.
• **100% Cashless:** Prepare cards or Apple Pay. No cash accepted at stalls.`;
  }

  // BC Place (vancouver)
  if (cityId === 'vancouver') {
    if (q.includes('parking') || q.includes('park') || q.includes('car') || q.includes('garage') || q.includes('lot') || q.includes('drive')) {
      return `🚗 **BC Place Parking Guide (Vancouver):**
• **No On-Site Public Parking:** BC Place does not have public parking lots on-site during major matchdays.
• **Nearby Lots:** Limited pay-parking garages are available in the surrounding Yaletown and Gastown downtown areas, but they fill up fast and have high event-day rates.
• **Alternative Transit (Best option):** Park further away at a SkyTrain station with a "Park & Ride" lot, and take the SkyTrain directly to **Stadium-Chinatown** or **Yaletown-Roundhouse** station. It's cheap, fast, and traffic-free.`;
    }
    if (q.includes('bag') || q.includes('pack') || q.includes('purse') || q.includes('clutch') || q.includes('bring') || q.includes('allow') || q.includes('restrict')) {
      return `🎒 **BC Place Bag Policy (Vancouver):**
• **Clear Bags Only:** Only clear plastic bags not exceeding **12" x 6" x 12"** are allowed.
• **Small Clutches:** One small non-clear clutch or wristlet up to **4.5" x 6.5"** is permitted.
• **Banned Bags:** Backpacks, diaper bags, briefcases, and luggage are strictly prohibited inside the stadium.`;
    }
    if (q.includes('transit') || q.includes('train') || q.includes('subway') || q.includes('bus') || q.includes('get to') || q.includes('transport') || q.includes('route') || q.includes('direction') || q.includes('uber') || q.includes('rideshare') || q.includes('taxi')) {
      return `🚇 **BC Place Transit Guide:**
• **SkyTrain (Excellent & Fast):** Take the SkyTrain Expo Line directly to the **Stadium-Chinatown Station** or Canada Line to **Yaletown-Roundhouse Station**. Both are under a 5-minute walk.
• **Highly Walkable:** BC Place is located right in the downtown peninsula and is extremely walkable from most downtown hotels.
• **Cycling:** Super bike-friendly! Mobi bike share stations and free temporary bike valets are available nearby.`;
    }
    if (q.includes('food') || q.includes('eat') || q.includes('drink') || q.includes('beer') || q.includes('special') || q.includes('concession') || q.includes('tasty') || q.includes('dine') || q.includes('cash') || q.includes('pay') || q.includes('card')) {
      return `🍁 **BC Place Dining & Payment:**
• **Canadian Specialties:** Try authentic loaded Canadian **Poutine**, premium cured Salmon Candy, Nanaimo bars, and delicious **Japadogs** (Japanese-fusion hot dogs).
• **Drinks:** Try regional craft beers from British Columbia breweries and local Okanagan Valley wines.
• **Payment:** 100% cashless. Only credit cards and mobile tap are accepted.`;
    }
    if (q.includes('safety') || q.includes('emergency') || q.includes('medical') || q.includes('lost') || q.includes('police') || q.includes('security') || q.includes('first aid') || q.includes('rule') || q.includes('restrict') || q.includes('law')) {
      return `🚨 **BC Place Safety & Rules:**
• **Roof Status:** The stadium features a state-of-the-art retractable roof. It may be opened or closed depending on local weather; check forecast.
• **Cameras:** Cameras with professional detachable lenses are not permitted.
• **First Aid:** Located on Level 1 (near Section 112) and Level 4 (near Section 415).`;
    }
    if (q.includes('gate') || q.includes('entrance') || q.includes('entry') || q.includes('door')) {
      return `🎟️ **BC Place Gate Information:**
• **Gates:** Assigned entry gates are **Gate A (Robson St)**, **Gate C (Pacific Blvd)**, **Gate E (Griffiths Way)**, and **Gate H (Terry Fox Plaza)**.
• **Timing:** Arrive at least **2 hours before kickoff** to pass security lines smoothly.`;
    }
    return `🇨🇦 **Welcome to BC Place (Vancouver) Fan Guide:**
• **Clear Bags:** Bags must be clear plastic, max **12" x 6" x 12"**. No backpacks.
• **Transit:** Excellent SkyTrain access via **Stadium-Chinatown** or **Yaletown-Roundhouse** stations.
• **Food:** Eat Canadian Poutine, sweet salmon candy, and Japanese Japadogs.
• **Cashless:** 100% card-only. Multi-lingual support in English and French is available.`;
  }

  // Estadio BBVA (monterrey)
  if (cityId === 'monterrey') {
    if (q.includes('parking') || q.includes('park') || q.includes('car') || q.includes('garage') || q.includes('lot') || q.includes('drive')) {
      return `🚗 **Estadio BBVA Parking Guide (Monterrey):**
• **Permit Holders Only:** On-site parking lots at "El Gigante de Acero" are strictly reserved for season ticket holders and pre-purchased parking pass holders.
• **No Cash Parking:** There is no cash public parking available at the stadium gates on matchday.
• **Where to Park:** Fans without permits are advised to park in secure public parking garages in downtown Monterrey or near **Metro Line 1 stations (such as Exposición)** and walk or take the metro.`;
    }
    if (q.includes('bag') || q.includes('pack') || q.includes('purse') || q.includes('clutch') || q.includes('bring') || q.includes('allow') || q.includes('restrict')) {
      return `🎒 **Estadio BBVA Bag Policy (Monterrey):**
• **Small Clear Bags Only:** Bags must be clear and not exceed **30 x 30 cm** in size.
• **Banned:** Backpacks, large duffels, briefcases, and large umbrellas are strictly prohibited. Clutch purses under **11.5x16.5 cm** are permitted.`;
    }
    if (q.includes('transit') || q.includes('train') || q.includes('subway') || q.includes('bus') || q.includes('get to') || q.includes('transport') || q.includes('route') || q.includes('direction') || q.includes('uber') || q.includes('rideshare') || q.includes('taxi')) {
      return `🚇 **Estadio BBVA Transit Guide:**
• **Metro Line 1 (Recommended):** Take Metro Line 1 directly to **Exposición Station**. From there, follow the safe, shaded, and dedicated 15-minute walking corridor straight to the stadium entrance.
• **Congestion warning:** Rideshares (Uber/DiDi) are available but Avenida Pablo Livas experiences intense bumper-to-bumper congestion. Walking from the Metro is much faster!`;
    }
    if (q.includes('food') || q.includes('eat') || q.includes('drink') || q.includes('beer') || q.includes('special') || q.includes('concession') || q.includes('tasty') || q.includes('dine') || q.includes('cash') || q.includes('pay') || q.includes('card')) {
      return `🥩 **Estadio BBVA Dining & Drinks:**
• **Regio BBQ Feast:** Feast on **Cabrito** (roast goat) skewers, savory **Arrachera** (skirt steak) tacos, delicious Tacos de Trompo, and local sweet Glorias (goat milk candies).
• **Drinks:** Local Mexican lagers and draft beers are served cold.
• **Cashless Status:** Mixed. Most concession stands accept cards, but some street food and local stalls require cash (Mexican Pesos).`;
    }
    if (q.includes('safety') || q.includes('emergency') || q.includes('medical') || q.includes('lost') || q.includes('police') || q.includes('security') || q.includes('first aid') || q.includes('rule') || q.includes('restrict') || q.includes('law')) {
      return `🚨 **Estadio BBVA Security & Rules:**
• **Chills & AC:** Estadio BBVA is known as "El Gigante de Acero" (The Giant of Steel) and has stunning views of the Cerro de la Silla mountain. AC (Clima) is highly appreciated in hot weather.
• **Atmosphere:** Passionate local football culture (Rayados vs Tigres rivalry). Keep it friendly and positive.
• **First Aid:** Paramount medical assistance is situated in the main stadium rings near Gates 1 and 3.`;
    }
    if (q.includes('gate') || q.includes('entrance') || q.includes('entry') || q.includes('door')) {
      return `🎟️ **Estadio BBVA Gate Information:**
• **Major Gates:** Entry points are **Gate 1 (Norte)**, **Gate 2 (Oriente)**, **Gate 3 (Sur)**, and **Gate 4 (Poniente)**.
• **Timing:** Arrive **2.5 hours early** to clear the checkpoints.`;
    }
    return `🇲🇽 **Welcome to Estadio BBVA (Monterrey) Fan Guide:**
• **Clear Bags:** Only small clear bags under **30 x 30 cm** allowed.
• **Transit:** Take **Metro Line 1 to Exposición** station and walk the dedicated 15-minute path.
• **Local Food:** Try Cabrito, Arrachera tacos, and local Regio draft beers.
• **Scenery:** Admire the breath-taking views of the Cerro de la Silla mountain directly from your seats.`;
  }

  // Universal Default Fallback
  return `⚽ **FIFA World Cup 2026 Matchday Fan Guide:**
• **Clear Bag Policy:** Bags must be clear plastic, vinyl, or PVC, and not exceed **12" x 6" x 12"** (30x15x30 cm). Small non-clear clutches up to **4.5" x 6.5"** are allowed.
• **Cashless Stadiums:** Most North American World Cup stadiums are 100% cashless. Bring credit/debit cards or load Apple Pay/Google Pay.
• **Arrive Early:** Gates open 2 hours before kickoff. Arrive **2.5 hours prior** to pass airport-style security comfortably.
• **Transit:** Public transport (Metro/train/buses) is highly recommended over rideshare to bypass massive highway delays.`;
}

app.post('/api/copilot', async (req, res) => {
  const { messages, cityId } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const lastMessageText = messages[messages.length - 1]?.text || "";

  // If no GEMINI_API_KEY is configured or it is the mock key, directly use the premium local fallback
  if (!apiKey || apiKey === 'MOCK_KEY') {
    const fallbackResponse = getSmartLocalResponse(lastMessageText, cityId);
    return res.json({ text: fallbackResponse });
  }

  const currentCityGrounding = cityId ? stadiumKnowledge[cityId] : 'All FIFA World Cup 2026 venues (USA, Mexico, Canada).';

  const systemInstruction = `
    You are "FanPilot AI", an elite FIFA World Cup 2026 Stadium Companion and Travel Assistant.
    Your mission is to help international fans navigate stadium entry, understand local laws/customs, solve transport issues, and overcome language barriers.
    
    Current City Grounding Info:
    ${currentCityGrounding}

    Guidelines:
    - Keep answers concise, highly practical, bulleted, and tailored to match-day pressure.
    - If asked about stadium rules (bags, bottles, cameras, cash vs card), rely strictly on the grounded stadium details provided above. If a city/stadium isn't explicitly listed, mention general FIFA rules (clear bags only, no bottles, cashless payments preferred).
    - Be enthusiastic about football, friendly, and supportive of all global cultures!
    - Suggest local phrasebook categories if relevant.
    - Maintain a humble, professional, clear tone. Avoid technical developer details.
  `;

  // Map messages to Gemini SDK contents format
  const contents = messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Copilot API error:', error);
    // On any API or network failure, we gracefully return the highly detailed local fallback with 200 OK
    const fallbackResponse = getSmartLocalResponse(lastMessageText, cityId);
    res.json({ text: fallbackResponse });
  }
});

export { app, stadiumKnowledge, ai };
