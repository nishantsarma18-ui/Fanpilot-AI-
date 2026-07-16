import { HostCity, MatchInfo, PhraseCategory, Phrase } from './types';

export const hostCities: HostCity[] = [
  {
    id: 'mexico_city',
    name: 'Mexico City',
    country: 'Mexico',
    stadium: 'Estadio Azteca',
    stadiumCapacity: '87,523',
    gates: ['Gate A - Insurgentes', 'Gate B - Calzada de Tlalpan', 'Gate C - Clubes', 'Gate D - Palcos'],
    transportationTips: [
      'Take the Metro Line 2 to Tasqueña station, then transfer to the Tren Ligero (Light Rail) to Estadio Azteca station.',
      'Allow at least 1.5 to 2 hours of travel time due to match-day traffic in the south of the city.',
      'Authorized taxis (Ubers or Sitio cabs) have designated drop-off points near the gate entrances.'
    ],
    bagPolicy: 'Only clear plastic bags (max 30x15x30 cm) or small clutches/purses (max 11.5x16.5 cm). No backpacks or professional cameras are allowed.',
    specialities: ['Tacos al Pastor', 'Tlayudas', 'Chilaquiles', 'Esquites'],
    localSlang: [
      { term: '¡Chela!', meaning: 'Beer', context: 'Used universally to order a cold beer. "¡Tráeme una chela, por favor!"' },
      { term: '¡Chido!', meaning: 'Cool / Awesome', context: 'To express excitement or approval about a play or chant. "¡Qué chido gol!"' },
      { term: 'El Ref / El Árbitro', meaning: 'The Referee', context: 'The person in charge of officiating. Expect colorful phrases if they make a bad call!' },
      { term: 'La Porra / El Hincha', meaning: 'The fan club / Supporters', context: 'The organized support group leading the stadium chants.' },
      { term: '¡Híjole!', meaning: 'Wow / Oh my!', context: 'Expression of shock or near-miss. "¡Híjole, casi es gol!"' }
    ]
  },
  {
    id: 'los_angeles',
    name: 'Los Angeles',
    country: 'USA',
    stadium: 'SoFi Stadium',
    stadiumCapacity: '70,240',
    gates: ['Gate 1 - American Airlines Plaza', 'Gate 5 - Century Boulevard', 'Gate 8 - Prairie Avenue', 'Gate 11 - VIP Club Entrance'],
    transportationTips: [
      'Take the Metro C Line to Hawthorne/Lennox Station, then board the free dedicated World Cup shuttle directly to SoFi Stadium.',
      'Rideshare (Uber/Lyft) has a dedicated pickup zone at the transit center on Prairie Ave, expect high surge pricing post-match.',
      'Pre-booking stadium parking is mandatory; drive-up parking is not available.'
    ],
    bagPolicy: 'Strict NFL-style Clear Bag Policy. Clear vinyl, plastic, or PVC bags not exceeding 12x6x12 inches, or small clutch bags max 4.5x6.5 inches.',
    specialities: ['LA Street Dogs (Danger Dogs)', 'Korean BBQ Tacos', 'Birria Quesatacos', 'California Burgers'],
    localSlang: [
      { term: 'Danger Dog', meaning: 'Bacon-wrapped street hot dog', context: 'The ultimate post-match snack sold by street vendors outside the stadium.' },
      { term: 'The 405 / The 105', meaning: 'Major Freeways', context: 'Locals refer to highways with "the" prepended. "Take the 105 to Prairie Ave."' },
      { term: 'Pitch', meaning: 'Football field', context: 'Standard terminology used by local fans, though soccer is also common.' },
      { term: 'Tailgating', meaning: 'Pre-match parking lot partying', context: 'A major American pre-game tradition of eating and drinking by car trunks.' }
    ]
  },
  {
    id: 'vancouver',
    name: 'Vancouver',
    country: 'Canada',
    stadium: 'BC Place',
    stadiumCapacity: '54,500',
    gates: ['Gate A - Robson Street', 'Gate C - Pacific Boulevard', 'Gate E - Griffiths Way', 'Gate H - Terry Fox Plaza'],
    transportationTips: [
      'Use the SkyTrain: Stadium-Chinatown Station (Expo Line) or Yaletown-Roundhouse Station (Canada Line) are both within a 5-minute walk.',
      'Vancouver is highly bike-friendly; use the Mobi bike share and park at designated stadium valet stations.',
      'TransLink buses running along Georgia St. have increased frequency on match days.'
    ],
    bagPolicy: 'Clear bags only, max size 12x6x12 inches. One small clutch purse max 4.5x6.5 inches is permitted.',
    specialities: ['Poutine', 'Salmon Candy', 'Japadog (Japanese-style Hot Dogs)', 'Nanaimo Bars'],
    localSlang: [
      { term: 'Double-Double', meaning: 'Coffee with 2 creams, 2 sugars', context: 'Standard order at Tim Hortons to fuel up before a morning kickoff.' },
      { term: 'Loonie / Toonie', meaning: '$1 / $2 Coins', context: 'Local currency terminology. "You\'ll need a loonie for the locker storage."' },
      { term: 'Skytrain', meaning: 'The rapid transit rail system', context: 'Vancouver\'s light rail network. "Take the Skytrain back to Waterfront."' },
      { term: 'Toque', meaning: 'Beanie / Winter hat', context: 'Warm knit cap worn during chilly late-evening match fixtures.' }
    ]
  },
  {
    id: 'new_york',
    name: 'New York/New Jersey',
    country: 'USA',
    stadium: 'MetLife Stadium',
    stadiumCapacity: '82,500',
    gates: ['Verizon Gate', 'MetLife Gate', 'Pepsi Gate', 'Bud Light Gate'],
    transportationTips: [
      'Take the NJ Transit Meadowlands Rail Line from Penn Station (New York) with a quick transfer at Secaucus Junction directly to the stadium.',
      'Coach USA operates the 351 Express Bus service from Port Authority Bus Terminal directly to MetLife Stadium on match days.',
      'Rideshare drop-off is in Lot E, but pickup wait times can exceed 90 minutes; taking the train is highly recommended.'
    ],
    bagPolicy: 'All bags must be clear plastic, vinyl, or PVC and not exceed 12x6x12 inches. Small purse or clutch must be 4.5x6.5 inches or smaller.',
    specialities: ['NY-Style Pizza Slice', 'Jersey Taylor Ham/Pork Roll', 'Pastrami on Rye', 'Soft Pretzels'],
    localSlang: [
      { term: 'Pork Roll / Taylor Ham', meaning: 'Iconic NJ breakfast meat', context: 'The local culinary debate. Order it on a roll with egg and cheese before the game.' },
      { term: 'The City', meaning: 'Manhattan / New York City', context: 'When locals say "going into the city", they always mean Manhattan.' },
      { term: 'Secaucus Junction', meaning: 'The transit bottleneck', context: 'The key train transfer station. Follow the sea of jerseys here!' },
      { term: 'Stand in line / On line', meaning: 'Waiting in queue', context: 'Locals say "standing on line" instead of "in line". "The queue for concessions is long, stand on line early."' }
    ]
  },
  {
    id: 'monterrey',
    name: 'Monterrey',
    country: 'Mexico',
    stadium: 'Estadio BBVA (El Gigante de Acero)',
    stadiumCapacity: '53,500',
    gates: ['Gate 1 Norte', 'Gate 2 Oriente', 'Gate 3 Sur', 'Gate 4 Poniente'],
    transportationTips: [
      'Take Metro Line 1 to Exposición station, which is a 15-minute walk along the scenic park path to the stadium.',
      'Rideshares are widely available, but traffic on Avenida Pablo Livas becomes highly congested; walking from the metro is faster.',
      'A shuttle bus is scheduled to connect downtown Monterrey hotels to the stadium plaza.'
    ],
    bagPolicy: 'No backpacks, large purses, or bags. Small clear bags (max 30x30 cm) or hand clutches are allowed.',
    specialities: ['Cabrito (Roast Goat)', 'Arrachera (Skirt Steak)', 'Tacos de Trompo', 'Glorias (Goat milk candy)'],
    localSlang: [
      { term: 'La Raya / Rayados', meaning: 'Local soccer passion', context: 'Refers to the home stadium identity. Wear blue and white stripes to blend in!' },
      { term: 'Carne Asada', meaning: 'Barbecue gathering', context: 'The ultimate Monterrey ritual before any big football fixture.' },
      { term: 'Clima', meaning: 'Air conditioning', context: 'Monterrey gets extremely hot. "¡Prende el clima!" (Turn on the AC!)' },
      { term: 'Chiripa', meaning: 'Fluke / Lucky play', context: 'When a goal is scored purely by luck. "Fue un gol de chiripa."' }
    ]
  }
];

export const matches: MatchInfo[] = [
  {
    id: 'match_1',
    teamA: 'Mexico',
    teamAFlag: '🇲🇽',
    teamB: 'Italy',
    teamBFlag: '🇮🇹',
    date: '2026-06-11',
    time: '18:00',
    venue: 'Estadio Azteca',
    cityId: 'mexico_city'
  },
  {
    id: 'match_2',
    teamA: 'USA',
    teamAFlag: '🇺🇸',
    teamB: 'Japan',
    teamBFlag: '🇯🇵',
    date: '2026-06-12',
    time: '19:30',
    venue: 'SoFi Stadium',
    cityId: 'los_angeles'
  },
  {
    id: 'match_3',
    teamA: 'Canada',
    teamAFlag: '🇨🇦',
    teamB: 'Morocco',
    teamBFlag: '🇲🇦',
    date: '2026-06-13',
    time: '17:00',
    venue: 'BC Place',
    cityId: 'vancouver'
  },
  {
    id: 'match_4',
    teamA: 'Argentina',
    teamAFlag: '🇦🇷',
    teamB: 'Spain',
    teamBFlag: '🇪🇸',
    date: '2026-06-14',
    time: '20:00',
    venue: 'MetLife Stadium',
    cityId: 'new_york'
  },
  {
    id: 'match_5',
    teamA: 'Mexico',
    teamAFlag: '🇲🇽',
    teamB: 'Germany',
    teamBFlag: '🇩🇪',
    date: '2026-06-18',
    time: '16:00',
    venue: 'Estadio BBVA',
    cityId: 'monterrey'
  }
];

export const phraseCategories: PhraseCategory[] = [
  { id: 'matchday', label: 'Match Day & Stadium', icon: 'Ticket' },
  { id: 'food_drink', label: 'Food, Drink & Ordering', icon: 'Utensils' },
  { id: 'transit', label: 'Transit & Directions', icon: 'Compass' },
  { id: 'chants', label: 'Football Chants & Slang', icon: 'Megaphone' },
  { id: 'emergencies', label: 'Emergency & Safety', icon: 'ShieldAlert' }
];

export const phrasebookData: Record<string, Record<string, Phrase[]>> = {
  mexico_city: {
    matchday: [
      { original: "Where is my seat block?", translation: "¿Dónde está mi sección de asientos?", phonetic: "Dohn-deh ehs-tah mee sek-syohn deh ah-syen-tohs", context: "Ask a stadium steward for seating assistance." },
      { original: "What gate should I enter?", translation: "¿Por qué puerta debo entrar?", phonetic: "Pohr keh pwer-tah deh-boh en-trar", context: "Ask when arriving at Azteca plaza." },
      { original: "Is there a bag locker here?", translation: "¿Hay casilleros para guardar mochilas?", phonetic: "Eye kah-see-yeh-rohs pah-rah gwar-dar moh-chee-lahs", context: "If your bag exceeds Azteca size restrictions." },
      { original: "Come on Mexico!", translation: "¡Vamos México!", phonetic: "Bah-mohs Meh-hee-koh", context: "The classic general fan encouragement chant." }
    ],
    food_drink: [
      { original: "Two pastor tacos and a cold beer, please.", translation: "Dos tacos al pastor y una chela bien fría, por favor.", phonetic: "Dohs tah-kohs ahl pahs-tor ee oo-nah cheh-lah byen free-ah pohr fah-bor", context: "Order the signature CDMX street foods." },
      { original: "Is this very spicy?", translation: "¿Esto pica mucho?", phonetic: "Ehs-toh pee-kah moo-choh", context: "Essential question for international fans trying Mexican salsa." },
      { original: "Do you accept credit card?", translation: "¿Aceptan tarjeta de crédito?", phonetic: "Ah-sep-tahn tar-heh-tah deh kreh-dee-toh", context: "Important for stadium food stalls." }
    ],
    transit: [
      { original: "Where is the light rail station?", translation: "¿Dónde está la estación del tren ligero?", phonetic: "Dohn-deh ehs-tah lah ehs-tah-syohn dehl tren lee-heh-roh", context: "Find your way back to Tasqueña station." },
      { original: "How much is the taxi ride?", translation: "¿Cuánto cuesta el viaje en taxi?", phonetic: "Kwan-toh kwes-tah el byah-heh en tahk-see", context: "Ask before getting into a local taxi." },
      { original: "Which platform is for downtown?", translation: "¿Qué andén va para el centro?", phonetic: "Keh ahn-den bah pah-rah el sen-troh", context: "Ensure you take the subway in the correct direction." }
    ],
    chants: [
      { original: "Cielito Lindo (Ay, ay, ay, ay, sing and don't cry!)", translation: "Cielito Lindo (¡Ay, ay, ay, ay, canta y no llores!)", phonetic: "Kye-lee-toh Leen-doh (Eye eye eye eye, kahn-tah ee noh yoh-rehs)", context: "The famous, emotional Mexican anthem sung at matches." },
      { original: "He did a dive!", translation: "¡Se tiró un clavado!", phonetic: "Seh tee-roh oon klah-bah-doh", context: "When an opposing player simulates a foul." }
    ],
    emergencies: [
      { original: "I need a doctor.", translation: "Necesito un médico.", phonetic: "Neh-seh-see-toh oon meh-dee-koh", context: "Urgent medical assistance request." },
      { original: "Where is the police station / officer?", translation: "¿Dónde hay un oficial de policía?", phonetic: "Dohn-deh eye oon oh-fee-syahl deh poh-lee-see-ah", context: "Safety concerns or reporting theft." },
      { original: "I am lost, can you help me?", translation: "Estoy perdido, ¿me puede ayudar?", phonetic: "Ehs-toy pehr-dee-doh, meh pweh-deh ah-yoo-dar", context: "Ask a local or host volunteer for guidance." }
    ]
  },
  vancouver: {
    matchday: [
      { original: "Where is the stadium entrance?", translation: "Where is the stadium entrance? / Où est l'entrée du stade?", phonetic: "Oo eh lahn-tray du stahd", context: "BC Place is fully bilingual (English and French)." },
      { original: "Where can I purchase a match programme?", translation: "Où puis-je acheter un programme de match?", phonetic: "Oo pwee-zh ah-sh-tay un pro-grah-m duh mah-ch", context: "To get your official souvenir booklet." }
    ],
    food_drink: [
      { original: "A poutine and a craft beer, please.", translation: "Une poutine et une bière de microbrasserie, s'il vous plaît.", phonetic: "Oon poo-teen ay oon byair duh mee-kroh-brahs-ree, seel voo play", context: "Order Canada's signature dish and premium local beers." }
    ],
    transit: [
      { original: "Where is the nearest SkyTrain station?", translation: "Where is the nearest SkyTrain station?", phonetic: "N/A", context: "The quickest way to travel back to Vancouver downtown." }
    ],
    chants: [
      { original: "Go Canada Go!", translation: "Allez Canada Allez !", phonetic: "Ah-lay Kah-nah-dah Ah-lay", context: "The bilingual support chant of the Voyageurs (Canadian supporters group)." }
    ],
    emergencies: [
      { original: "I lost my passport.", translation: "J'ai perdu mon passeport.", phonetic: "Zhay pair-du mohn pahs-pohr", context: "Ask for consular assistance." }
    ]
  }
};

// Generic fallback phrasebook for US/Canada locations that speak primarily English
export const genericEnglishPhrasebook: Record<string, Phrase[]> = {
  matchday: [
    { original: "Where is my seat?", translation: "Where is my seat?", phonetic: "N/A", context: "Help locator for rows." },
    { original: "What gate is this?", translation: "What gate is this?", phonetic: "N/A", context: "Verify entry gates." },
    { original: "Is there any fan zone?", translation: "Is there any fan zone nearby?", phonetic: "N/A", context: "Locate sponsor hubs." }
  ],
  food_drink: [
    { original: "Are there vegetarian options?", translation: "Are there vegetarian options?", phonetic: "N/A", context: "Ordering food inside modern USA arenas." },
    { original: "Where is the draft beer stand?", translation: "Where is the draft beer stand?", phonetic: "N/A", context: "Locating drinks." }
  ],
  transit: [
    { original: "Where is the rideshare zone?", translation: "Where is the rideshare zone?", phonetic: "N/A", context: "Find Uber/Lyft pickup points." },
    { original: "How do I buy a train ticket?", translation: "How do I buy a train ticket?", phonetic: "N/A", context: "Paying for transit." }
  ],
  chants: [
    { original: "I believe that we will win!", translation: "I believe that we will win!", phonetic: "N/A", context: "The classic United States national team soccer chant." }
  ],
  emergencies: [
    { original: "Where is first aid?", translation: "Where is first aid?", phonetic: "N/A", context: "Seek urgent medical support inside stadium concourses." }
  ]
};
