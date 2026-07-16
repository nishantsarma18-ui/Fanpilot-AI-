import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize the server-side Google Gen AI client with proper telemetry headers
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY environment variable is not set. AI features will fail.");
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
app.post('/api/copilot', async (req, res) => {
  const { messages, cityId } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
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
    res.status(500).json({
      text: "I am having trouble connecting to my football knowledge base right now. Let me remind you of general FIFA World Cup rules: Only bring clear plastic bags (max 12x6x12 inches), remember stadiums are 100% cashless, and please arrive at least 2.5 hours before kickoff to pass airport-style security safely!"
    });
  }
});

export { app, stadiumKnowledge, ai };
