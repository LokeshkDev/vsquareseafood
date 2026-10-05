/**
 * Tanglish & Tamil Auto-Translator Helper
 * Translates English Seafood & Kitchen Dish names into accurate Tamil script and Tanglish.
 */

// 1. Longest exact phrases checked first
const EXACT_PHRASES = [
  // Prawns & Shellfish
  { keywords: ['white sea prawns', 'white sea prawn', 'white prawns', 'white prawn'], tamil: 'வெள்ளை இறால்', tanglish: 'Vellai Eraal' },
  { keywords: ['tiger prawns', 'tiger prawn', 'tiger shrimp'], tamil: 'டைகர் இறால்', tanglish: 'Tiger Eraal' },
  { keywords: ['jumbo prawns', 'jumbo prawn', 'big prawns'], tamil: 'பெரிய இறால்', tanglish: 'Periya Eraal' },
  { keywords: ['small prawns', 'baby prawns', 'tiny prawns'], tamil: 'சிறிய இறால்', tanglish: 'Siriya Eraal' },
  { keywords: ['sea prawns', 'kadal eraal'], tamil: 'கடல் இறால்', tanglish: 'Kadal Eraal' },
  { keywords: ['prawns', 'prawn', 'shrimp'], tamil: 'இறால்', tanglish: 'Eraal' },

  // Crabs & Lobsters
  { keywords: ['blue sea crab', 'blue crab', 'kadal nandu'], tamil: 'நீலக் கடல் நண்டு', tanglish: 'Neelak Kadal Nandu' },
  { keywords: ['mud crab', 'kal nandu'], tamil: 'கல் நண்டு', tanglish: 'Kal Nandu' },
  { keywords: ['crab', 'crabs', 'nandu'], tamil: 'நண்டு', tanglish: 'Nandu' },
  { keywords: ['lobster', 'sea lobster'], tamil: 'சிங்கி இறால்', tanglish: 'Singi Eraal' },

  // Fishes
  { keywords: ['vanjaram / seer fish', 'vanjaram seer fish', 'seer fish / vanjaram', 'seer fish', 'vanjaram fish', 'vanjaram', 'king fish'], tamil: 'வஞ்சரம் மீன்', tanglish: 'Vanjaram Meen' },
  { keywords: ['black pomfret', 'black vavval', 'karuppu vavval'], tamil: 'கருப்பு வவ்வால்', tanglish: 'Karuppu Vavval' },
  { keywords: ['white pomfret', 'vellai vavval'], tamil: 'வெள்ளை வவ்வால்', tanglish: 'Vellai Vavval' },
  { keywords: ['pomfret', 'vavval'], tamil: 'வவ்வால் மீன்', tanglish: 'Vavval Meen' },
  { keywords: ['red snapper', 'sankara', 'sankara fish', 'sankara meen'], tamil: 'சங்கரா மீன்', tanglish: 'Sankara Meen' },
  { keywords: ['asian sea bass', 'sea bass', 'barramundi', 'koduva', 'koduva fish'], tamil: 'கொடுவா மீன்', tanglish: 'Koduva Meen' },
  { keywords: ['freshwater dam rohu', 'dam rohu', 'rohu fish', 'rohu'], tamil: 'அணை ரோஹு மீன்', tanglish: 'Dam Rohu Meen' },
  { keywords: ['squid', 'squid rings', 'cuttlefish', 'kanava', 'kanavai'], tamil: 'கணவாய்', tanglish: 'Kanavai' },
  { keywords: ['nethili', 'nethili fish', 'anchovy', 'anchovies'], tamil: 'நெத்திலி மீன்', tanglish: 'Nethili Meen' },
  { keywords: ['sheela', 'sheela fish', 'barracuda'], tamil: 'சீலா மீன்', tanglish: 'Sheela Meen' },
  { keywords: ['mathi', 'mathi fish', 'sardine', 'sardines'], tamil: 'மத்தி மீன்', tanglish: 'Mathi Meen' },
  { keywords: ['kilangan', 'lady fish'], tamil: 'கிழங்கான் மீன்', tanglish: 'Kilangan Meen' },
  { keywords: ['tilapia', 'jilepi', 'jilebi fish'], tamil: 'ஜிலாபி மீன்', tanglish: 'Jilepi Meen' },
  { keywords: ['keluthi', 'catfish'], tamil: 'கெளுத்தி மீன்', tanglish: 'Keluthi Meen' },
  { keywords: ['tuna', 'tuna fish', 'soorai'], tamil: 'சூரை மீன்', tanglish: 'Soorai Meen' },
  { keywords: ['sea fish'], tamil: 'கடல் மீன்', tanglish: 'Kadal Meen' },
  { keywords: ['river fish', 'freshwater fish'], tamil: 'ஆற்று மீன்', tanglish: 'Aatru Meen' },
  { keywords: ['ready to cook', 'marinated steaks', 'marinated fish'], tamil: 'சமைக்க தயார் மீன்', tanglish: 'Ready To Cook Meen' },
  { keywords: ['seafood combos', 'seafood combo', 'family pack'], tamil: 'சீஃபுட் காம்போ', tanglish: 'Seafood Combo' },

  // Cloud Kitchen Dishes
  { keywords: ['kasimedu fish curry meal', 'kasimedu meen kuzhambu meal', 'kasimedu meal'], tamil: 'காசிமேடு மீன் குழம்பு சாப்பாடு', tanglish: 'Kasimedu Meen Kuzhambu Saappadu' },
  { keywords: ['kasimedu'], tamil: 'காசிமேடு', tanglish: 'Kasimedu' },
  { keywords: ['royal seafood thali', 'seafood thali'], tamil: 'ராயல் சீஃபுட் சாப்பாடு', tanglish: 'Royal Seafood Saappadu' },
  { keywords: ['claypot meen kuzhambu', 'claypot fish curry'], tamil: 'மண்பானை மீன் குழம்பு', tanglish: 'Manpaanai Meen Kuzhambu' },
  { keywords: ['meen kuzhambu', 'fish curry'], tamil: 'மீன் குழம்பு', tanglish: 'Meen Kuzhambu' },
  { keywords: ['chettinad crab masala', 'chettinad nandu masala'], tamil: 'செட்டிநாடு நண்டு மசாலா', tanglish: 'Chettinad Nandu Masala' },
  { keywords: ['vanjaram tawa fry'], tamil: 'வஞ்சரம் தவா வறுவல்', tanglish: 'Vanjaram Tawa Fry' },
  { keywords: ['prawn pepper roast'], tamil: 'இறால் மிளகு வறுவல்', tanglish: 'Eraal Pepper Roast' },
  { keywords: ['crispy nethili 65'], tamil: 'நெத்திலி 65 வறுவல்', tanglish: 'Nethili 65 Fry' },
  { keywords: ['prawn dum biryani'], tamil: 'இறால் தம் பிரியாணி', tanglish: 'Eraal Dum Biryani' },
  { keywords: ['seer fish biryani', 'vanjaram biryani'], tamil: 'வஞ்சரம் மீன் பிரியாணி', tanglish: 'Vanjaram Meen Biryani' },
  { keywords: ['chettinad nandu rasam', 'nandu rasam'], tamil: 'செட்டிநாடு நண்டு ரசம்', tanglish: 'Chettinad Nandu Rasam' },
];

// 2. Individual word fallback mappings
const WORD_MAP = {
  'white': 'வெள்ளை',
  'black': 'கருப்பு',
  'red': 'சிவப்பு',
  'blue': 'நீலக்',
  'green': 'பச்சை',
  'fresh': 'புதிய',
  'sea': 'கடல்',
  'river': 'ஆற்று',
  'dam': 'அணை',
  'big': 'பெரிய',
  'large': 'பெரிய',
  'jumbo': 'பெரிய',
  'small': 'சிறிய',
  'tiny': 'சிறிய',
  'prawn': 'இறால்',
  'prawns': 'இறால்',
  'shrimp': 'இறால்',
  'fish': 'மீன்',
  'fishes': 'மீன்',
  'crab': 'நண்டு',
  'crabs': 'நண்டு',
  'squid': 'கணவாய்',
  'lobster': 'சிங்கி இறால்',
  'curry': 'குழம்பு',
  'gravy': 'குழம்பு',
  'fry': 'வறுவல்',
  'roast': 'வறுவல்',
  'meal': 'சாப்பாடு',
  'meals': 'சாப்பாடு',
  'thali': 'சாப்பாடு',
  'rice': 'சாதம்',
  'biryani': 'பிரியாணி',
  'soup': 'சூப்',
  'rasam': 'ரசம்',
  'masala': 'மசாலா',
  'kasimedu': 'காசிமேடு',
  'chettinad': 'செட்டிநாடு',
  'claypot': 'மண்பானை',
};

/**
 * Translates an English product/category name into accurate Tamil script.
 * @param {string} englishName - The English product or category name
 * @returns {string} Tamil script translation
 */
export function translateToTanglishTamil(englishName) {
  if (!englishName || typeof englishName !== 'string') return '';
  const cleanStr = englishName.trim().toLowerCase();

  // 1. Check exact multi-word phrase matches first
  for (const item of EXACT_PHRASES) {
    for (const kw of item.keywords) {
      if (cleanStr === kw) {
        return item.tamil;
      }
    }
  }

  // 2. Check phrase inclusion matches
  for (const item of EXACT_PHRASES) {
    for (const kw of item.keywords) {
      if (cleanStr.includes(kw)) {
        return item.tamil;
      }
    }
  }

  // 3. Word-by-word intelligent mapping fallback
  const words = cleanStr.split(/[\s\/-]+/);
  let translatedWords = [];

  for (const word of words) {
    if (!word) continue;
    if (WORD_MAP[word]) {
      translatedWords.push(WORD_MAP[word]);
    } else {
      // Keep capitalized word if no direct mapping exists
      translatedWords.push(word.charAt(0).toUpperCase() + word.slice(1));
    }
  }

  return translatedWords.join(' ');
}
