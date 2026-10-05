import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const CATEGORIES = [
  { id: 'sea-fish', name: 'Sea Fish', tamilName: 'கடல் மீன்', slug: 'sea-fish', icon: 'Waves', sortOrder: 1 },
  { id: 'prawns', name: 'Prawns', tamilName: 'இறால்', slug: 'prawns', icon: 'Shrimp', sortOrder: 2 },
  { id: 'crabs-squid', name: 'Crab & Squid', tamilName: 'நண்டு & கணவா', slug: 'crabs-squid', icon: 'Shell', sortOrder: 3 },
  { id: 'freshwater', name: 'Freshwater Fish', tamilName: 'ஆற்று மீன்', slug: 'freshwater', icon: 'Fish', sortOrder: 4 },
  { id: 'combos', name: 'Seafood Combos', tamilName: 'காம்போஸ்', slug: 'combos', icon: 'Package', sortOrder: 5 },
  { id: 'ready-to-cook', name: 'Ready to Cook', tamilName: 'மசாலா மீன்', slug: 'ready-to-cook', icon: 'Flame', sortOrder: 6 },
  { id: 'cloud-kitchen', name: 'Cloud Kitchen (Hot Food)', tamilName: 'சமைத்த உணவு', slug: 'cloud-kitchen', icon: 'UtensilsCrossed', sortOrder: 7 },
];

const SEED_PRODUCTS = [
  // ─── SEA FISH ───
  {
    name: 'Seer Fish / Vanjaram',
    localName: 'வஞ்சரம் மீன்',
    slug: 'vanjaram-seer-fish-steaks',
    categoryId: 'sea-fish',
    type: 'RAW',
    basePrice: 699,
    grossWeight: '500g',
    netWeight: '400g - 420g',
    serves: '2-3 people',
    harborSource: 'Kasimedu Fishing Harbor, Chennai (4:30 AM Catch)',
    storageTemp: '0°C - 4°C in crushed ice',
    badge: "Today's Catch",
    isFreshCatch: true,
    isPopular: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 342,
    description: 'The undisputed king of South Indian seafood. Our Vanjaram (Indo-Pacific King Mackerel) is harbor-fresh, firm-fleshed with a delicate oily texture that crisps up heavenly when pan-fried.',
    cookingTips: 'Marinate with red chili, turmeric, ginger-garlic paste and lemon for 20 mins. Shallow fry on an iron tawa with coconut oil.',
    imageUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80',
    variants: [
      { sku: 'VANJARAM-500G-FRY', weightValue: 0.5, cutType: 'FRY_CUT', cleaningOption: 'fry-cut', price: 699, compareAtPrice: 799 },
      { sku: 'VANJARAM-500G-CURRY', weightValue: 0.5, cutType: 'CURRY_CUT', cleaningOption: 'curry-cut', price: 679, compareAtPrice: 779 },
      { sku: 'VANJARAM-1KG-FRY', weightValue: 1.0, cutType: 'FRY_CUT', cleaningOption: 'fry-cut', price: 1349, compareAtPrice: 1549 },
    ],
  },
  {
    name: 'Black Pomfret / Karuppu Vavval',
    localName: 'கருப்பு வவ்வால்',
    slug: 'black-pomfret-karuppu-vavval',
    categoryId: 'sea-fish',
    type: 'RAW',
    basePrice: 489,
    grossWeight: '500g',
    netWeight: '380g - 410g',
    serves: '2 people',
    harborSource: 'Kasimedu Harbor (Daily Boat Landing)',
    storageTemp: 'Chilled 1°C - 3°C',
    badge: 'Popular',
    isFreshCatch: true,
    isPopular: true,
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 198,
    description: 'Distinctive dark-skinned sea delicacy with rich, buttery dark meat. Best suited for fiery Chettinad fish curry and deep tawa fry.',
    cookingTips: 'Deep slash the sides, coat thoroughly in masala paste and pan fry over medium-high heat with curry leaves.',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    variants: [
      { sku: 'POMFRET-500G-WHOLE', weightValue: 0.5, cutType: 'WHOLE', cleaningOption: 'whole-cleaned', price: 489, compareAtPrice: 550 },
      { sku: 'POMFRET-500G-FRY', weightValue: 0.5, cutType: 'FRY_CUT', cleaningOption: 'fry-cut', price: 519, compareAtPrice: 580 },
    ],
  },
  {
    name: 'White Pomfret / Vella Vavval',
    localName: 'வெள்ளை வவ்வால்',
    slug: 'white-pomfret-vella-vavval',
    categoryId: 'sea-fish',
    type: 'RAW',
    basePrice: 649,
    grossWeight: '500g',
    netWeight: '420g - 440g',
    serves: '2 people',
    harborSource: 'Kasimedu Harbor Deep Sea Trawler',
    storageTemp: 'Chilled 0°C - 4°C',
    badge: 'Premium Catch',
    isFreshCatch: true,
    isPopular: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 220,
    description: 'Super soft, snow-white tender meat with a delicate sweet taste. Extremely low in bones, making it ideal for elders and children.',
    cookingTips: 'Steam with ginger-scallion soya or gently pan-fry with light turmeric and salt.',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    variants: [
      { sku: 'WHITE-POMFRET-500G', weightValue: 0.5, cutType: 'WHOLE', cleaningOption: 'whole-cleaned', price: 649, compareAtPrice: 720 },
      { sku: 'WHITE-POMFRET-1KG', weightValue: 1.0, cutType: 'WHOLE', cleaningOption: 'whole-cleaned', price: 1249, compareAtPrice: 1399 },
    ],
  },
  {
    name: 'Sankara / Red Snapper',
    localName: 'சங்கரா மீன்',
    slug: 'sankara-red-snapper-curry-cut',
    categoryId: 'sea-fish',
    type: 'RAW',
    basePrice: 389,
    grossWeight: '500g',
    netWeight: '380g - 400g',
    serves: '2-3 people',
    harborSource: 'Coromandel Coastal Boats via Kasimedu',
    storageTemp: 'Chilled in crushed ice',
    badge: 'Family Favorite',
    isFreshCatch: true,
    isPopular: true,
    isFeatured: false,
    rating: 4.7,
    reviewsCount: 184,
    description: 'Prized for its firm, sweet and flaky white flesh with ruby-pink skin. The signature fish for traditional Tamil Nadu village-style Meen Kuzhambu.',
    cookingTips: 'Simmer gently in a terracotta pot with tamarind, shallots and crushed garlic for maximum flavor absorption.',
    imageUrl: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80',
    variants: [
      { sku: 'SANKARA-500G-CURRY', weightValue: 0.5, cutType: 'CURRY_CUT', cleaningOption: 'curry-cut', price: 389, compareAtPrice: 440 },
      { sku: 'SANKARA-1KG-CURRY', weightValue: 1.0, cutType: 'CURRY_CUT', cleaningOption: 'curry-cut', price: 749, compareAtPrice: 850 },
    ],
  },
  {
    name: 'White Anchovy / Nethili',
    localName: 'நெத்திலி மீன்',
    slug: 'white-anchovy-nethili-cleaned',
    categoryId: 'sea-fish',
    type: 'RAW',
    basePrice: 249,
    grossWeight: '500g',
    netWeight: '450g (Head & Gills Removed)',
    serves: '3-4 people',
    harborSource: 'Kasimedu Coastal Shore Seines',
    storageTemp: 'Chilled 1°C - 3°C',
    badge: 'Crispy Fry Special',
    isFreshCatch: true,
    isPopular: true,
    isFeatured: false,
    rating: 4.8,
    reviewsCount: 295,
    description: 'Tiny, flavorful coastal silver fish. Cleaned with head and gut removed, ready for high-heat crispy deep fry. High in calcium and natural omega-3.',
    cookingTips: 'Coat in rice flour, chili powder, and curry leaf paste. Deep fry in hot oil until golden crisp.',
    imageUrl: 'https://images.unsplash.com/photo-1510130387422-82ebd332a64e?auto=format&fit=crop&w=800&q=80',
    variants: [
      { sku: 'NETHILI-500G-CLEANED', weightValue: 0.5, cutType: 'CLEANED', cleaningOption: 'whole-cleaned', price: 249, compareAtPrice: 290 },
      { sku: 'NETHILI-1KG-CLEANED', weightValue: 1.0, cutType: 'CLEANED', cleaningOption: 'whole-cleaned', price: 479, compareAtPrice: 560 },
    ],
  },
  {
    name: 'Asian Sea Bass / Bhetki / Koduva',
    localName: 'கொடுவா மீன்',
    slug: 'asian-sea-bass-koduva-fillet',
    categoryId: 'sea-fish',
    type: 'RAW',
    basePrice: 599,
    grossWeight: '500g',
    netWeight: '350g (Boneless Fillet)',
    serves: '2 people',
    harborSource: 'Pulicat & Ennore Backwaters',
    storageTemp: '0°C - 4°C in crushed ice',
    badge: 'Chef Choice',
    isFreshCatch: true,
    isPopular: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 167,
    description: 'Thick, luscious boneless fillets with buttery large flakes. Perfect for fish fingers, continental baking, and South Indian tawa roast.',
    cookingTips: 'Sear in butter with black pepper and lime, or crumb fry with tartar sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80',
    variants: [
      { sku: 'KODUVA-500G-FILLET', weightValue: 0.5, cutType: 'FILLET', cleaningOption: 'fillet', price: 599, compareAtPrice: 699 },
      { sku: 'KODUVA-500G-CURRY', weightValue: 0.5, cutType: 'CURRY_CUT', cleaningOption: 'curry-cut', price: 549, compareAtPrice: 620 },
    ],
  },

  // ─── PRAWNS ───
  {
    name: 'Jumbo Tiger Prawns / Karuppu Viraal Eraal',
    localName: 'வரி இறால்',
    slug: 'jumbo-tiger-prawns-kasimedu',
    categoryId: 'prawns',
    type: 'RAW',
    basePrice: 549,
    grossWeight: '500g (15-20 Prawns)',
    netWeight: '350g (Peeled & Deveined)',
    serves: '2-3 people',
    harborSource: 'Bay of Bengal Deep Sea Traps via Kasimedu',
    storageTemp: 'Packed in food-grade gel ice',
    badge: 'Bestseller',
    isFreshCatch: true,
    isPopular: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 421,
    description: 'Juicy, sweet and firm sea tiger prawns. Cleaned, deveined with tail on for gourmet presentations.',
    cookingTips: 'Do not overcook! Toss in garlic butter or pepper masala for no more than 3-4 minutes until pink and curved.',
    imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
    variants: [
      { sku: 'PRAWNS-500G-DEVEINED', weightValue: 0.5, cutType: 'CLEANED', cleaningOption: 'whole-cleaned', price: 549, compareAtPrice: 620 },
      { sku: 'PRAWNS-1KG-DEVEINED', weightValue: 1.0, cutType: 'CLEANED', cleaningOption: 'whole-cleaned', price: 1049, compareAtPrice: 1199 },
    ],
  },
  {
    name: 'Sea White Prawns / Vella Eraal',
    localName: 'வெள்ளை இறால்',
    slug: 'sea-white-prawns-vella-eraal',
    categoryId: 'prawns',
    type: 'RAW',
    basePrice: 429,
    grossWeight: '500g (30-40 Prawns)',
    netWeight: '360g Peeled',
    serves: '2-3 people',
    harborSource: 'Kasimedu Coastal Net Landings',
    storageTemp: 'Food-grade gel ice packs',
    badge: 'Daily Favorite',
    isFreshCatch: true,
    isPopular: true,
    isFeatured: false,
    rating: 4.8,
    reviewsCount: 198,
    description: 'Medium-sized succulent white prawns with natural coastal sweetness. Ideal for spicy prawn thokku and biryani.',
    cookingTips: 'Sauté with fennel, shallots, and crushed pepper until aromatic.',
    imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=800&q=80',
    variants: [
      { sku: 'WHITE-PRAWNS-500G', weightValue: 0.5, cutType: 'CLEANED', cleaningOption: 'whole-cleaned', price: 429, compareAtPrice: 490 },
      { sku: 'WHITE-PRAWNS-1KG', weightValue: 1.0, cutType: 'CLEANED', cleaningOption: 'whole-cleaned', price: 829, compareAtPrice: 950 },
    ],
  },

  // ─── CRAB & SQUID ───
  {
    name: 'Live Blue Sea Crab / Neelakkal Nandu',
    localName: 'நீலக்கால் நண்டு',
    slug: 'blue-sea-crab-live-chennai',
    categoryId: 'crabs-squid',
    type: 'RAW',
    basePrice: 429,
    grossWeight: '500g (3-4 Crabs)',
    netWeight: '450g net after cleaning',
    serves: '2 people',
    harborSource: 'Pulicat Lake & Kasimedu Coastal Traps',
    storageTemp: 'Kept moist & chilled until dispatch',
    badge: 'Live Quality',
    isFreshCatch: true,
    isPopular: true,
    isFeatured: true,
    rating: 4.7,
    reviewsCount: 156,
    description: 'Sweet, tender blue swimmer crabs packed with rich claw meat. Cleaned with top shell cracked and gills removed upon request.',
    cookingTips: 'Ideal for Chettinad Nandu Masala or Peppery Crab Soup (Rasam) with plenty of crushed black pepper and garlic.',
    imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
    variants: [
      { sku: 'CRAB-500G-CLEANED', weightValue: 0.5, cutType: 'CLEANED', cleaningOption: 'whole-cleaned', price: 429, compareAtPrice: 499 },
      { sku: 'CRAB-1KG-CLEANED', weightValue: 1.0, cutType: 'CLEANED', cleaningOption: 'whole-cleaned', price: 819, compareAtPrice: 949 },
    ],
  },
  {
    name: 'Fresh Sea Squid / Oosi Kanawa',
    localName: 'ஊசி கணவா',
    slug: 'fresh-sea-squid-oosi-kanawa',
    categoryId: 'crabs-squid',
    type: 'RAW',
    basePrice: 379,
    grossWeight: '500g',
    netWeight: '360g (Cleaned Rings & Tubes)',
    serves: '2 people',
    harborSource: 'Kasimedu Deep Sea Boats',
    storageTemp: 'Chilled 1°C - 3°C',
    badge: 'Chewy & Tender',
    isFreshCatch: true,
    isPopular: false,
    isFeatured: false,
    rating: 4.6,
    reviewsCount: 88,
    description: 'Tender squid tubes and tentacles cleaned, ink sac removed, and cut into neat calamari rings.',
    cookingTips: 'Flash fry for 2 minutes with garlic butter or cook slow in rich tomato tamarind masala.',
    imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    variants: [
      { sku: 'SQUID-500G-RINGS', weightValue: 0.5, cutType: 'SLICE', cleaningOption: 'curry-cut', price: 379, compareAtPrice: 430 },
    ],
  },

  // ─── FRESHWATER ───
  {
    name: 'River Rohu / Kannadi Kendai',
    localName: 'ரோகு மீன்',
    slug: 'river-rohu-kannadi-kendai',
    categoryId: 'freshwater',
    type: 'RAW',
    basePrice: 289,
    grossWeight: '500g',
    netWeight: '420g (Steaks & Head Pieces)',
    serves: '2 people',
    harborSource: 'Freshwater Farm Lake Deliveries',
    storageTemp: '0°C - 4°C in crushed ice',
    badge: 'Freshwater Classic',
    isFreshCatch: true,
    isPopular: false,
    isFeatured: false,
    rating: 4.6,
    reviewsCount: 94,
    description: 'Traditional freshwater carp fish with soft meat and distinct rich sweetness. Ideal for light gravies and shallow tawa fry.',
    cookingTips: 'Marinate in turmeric and mustard oil, pan-fry with green chilies.',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    variants: [
      { sku: 'ROHU-500G-CURRY', weightValue: 0.5, cutType: 'CURRY_CUT', cleaningOption: 'curry-cut', price: 289, compareAtPrice: 330 },
      { sku: 'ROHU-1KG-CURRY', weightValue: 1.0, cutType: 'CURRY_CUT', cleaningOption: 'curry-cut', price: 549, compareAtPrice: 620 },
    ],
  },

  // ─── COMBOS ───
  {
    name: 'Weekend Seafood Feast Combo',
    localName: 'வார இறுதி கடல் விருந்து',
    slug: 'weekend-seafood-feast-combo',
    categoryId: 'combos',
    type: 'RAW',
    basePrice: 1199,
    grossWeight: '1.5 kg Total Assortment',
    netWeight: '1.2 kg Net Cleaned Meat',
    serves: '4-5 people',
    harborSource: 'Kasimedu Morning Harbor Catch',
    storageTemp: 'Chilled insulated cooler pack',
    badge: 'Best Value Combo',
    isFreshCatch: true,
    isPopular: true,
    isFeatured: true,
    rating: 5.0,
    reviewsCount: 312,
    description: 'Ultimate family seafood pack: 500g Seer Fish Steaks (Vanjaram) + 500g Tiger Prawns (Cleaned) + 500g Blue Sea Crab. Complete weekend feast.',
    cookingTips: 'Fish for tawa fry, prawns for pepper roast, crabs for spicy pepper soup.',
    imageUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80',
    variants: [
      { sku: 'COMBO-WEEKEND-FEAST', weightValue: 1.5, cutType: 'OTHER', price: 1199, compareAtPrice: 1450 },
    ],
  },

  // ─── READY TO COOK ───
  {
    name: 'Tawa Masala Marinated Vanjaram Steaks',
    localName: 'மசாலா தடவிய வஞ்சரம்',
    slug: 'ready-to-cook-marinated-vanjaram',
    categoryId: 'ready-to-cook',
    type: 'READY_TO_COOK',
    basePrice: 749,
    grossWeight: '500g (4 Thick Slices)',
    netWeight: '500g (Vacuum Sealed)',
    serves: '2-3 people',
    harborSource: 'Freshly marinated with home-ground Chettinad spices',
    storageTemp: 'Keep refrigerated at 2°C - 4°C',
    badge: 'Ready in 5 Mins',
    isFreshCatch: true,
    isPopular: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 289,
    description: 'Pre-marinated in hand-ground Kashmiri chili, turmeric, ginger-garlic, curry leaf paste and lemon juice. Zero preservatives. Just pan-fry.',
    cookingTips: 'Heat 2 tbsp oil on a flat tawa. Fry on medium flame for 3 mins each side. Garnish with fried curry leaves.',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    variants: [
      { sku: 'RTC-VANJARAM-500G', weightValue: 0.5, cutType: 'FRY_CUT', price: 749, compareAtPrice: 849 },
    ],
  },
  {
    name: 'Spicy Garlic Pepper Prawns (Marinated)',
    localName: 'மிளகு பூண்டு மசாலா இறால்',
    slug: 'ready-to-cook-garlic-pepper-prawns',
    categoryId: 'ready-to-cook',
    type: 'READY_TO_COOK',
    basePrice: 589,
    grossWeight: '450g Pack',
    netWeight: '400g Peeled Prawns',
    serves: '2-3 people',
    harborSource: 'Chef crafted marinade from V2 Kitchen',
    storageTemp: 'Chilled vacuum tray',
    badge: 'Quick Toss',
    isFreshCatch: true,
    isPopular: true,
    isFeatured: false,
    rating: 4.8,
    reviewsCount: 174,
    description: 'Peeled tiger prawns tossed in crushed Tellicherry black pepper, roasted garlic flakes, and cold-pressed coconut oil marinade.',
    cookingTips: 'Toss in a smoking hot pan with a spoonful of ghee for 3-4 minutes. Do not add water.',
    imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
    variants: [
      { sku: 'RTC-PRAWNS-450G', weightValue: 0.45, cutType: 'CLEANED', price: 589, compareAtPrice: 660 },
    ],
  },

  // ─── CLOUD KITCHEN (HOT FOOD) ───
  {
    name: 'Madras Fish Curry Meals (Meen Kuzhambu Sadham)',
    localName: 'மீன் குழம்பு சாப்பாடு',
    slug: 'madras-fish-curry-meals-cloud-kitchen',
    categoryId: 'cloud-kitchen',
    type: 'KITCHEN',
    basePrice: 229,
    grossWeight: '1 Full Meal Box',
    netWeight: 'Serves 1 person generously',
    serves: '1 person',
    harborSource: 'Cooked fresh at V2 Cloud Kitchen, Royapuram',
    storageTemp: 'Delivered in thermal insulated hot packs (65°C+)',
    badge: 'Chef Special',
    isFreshCatch: false,
    isPopular: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 512,
    description: 'Authentic Madras harbor-style Meen Kuzhambu made in traditional terracotta pots using fresh catch of the day, served with piping hot Ponni rice, spicy Nethili fry, rasam & appalam.',
    cookingTips: 'Delivered ready to eat! Microwave for 45 seconds if consuming later.',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    variants: [
      { sku: 'MEAL-VANJARAM-COMBO', weightValue: 1.0, cutType: 'OTHER', price: 229, compareAtPrice: 279 },
      { sku: 'MEAL-DOUBLE-FISH-COMBO', weightValue: 1.0, cutType: 'OTHER', price: 299, compareAtPrice: 349 },
    ],
  },
  {
    name: 'Thalassery Seafood Dum Biryani',
    localName: 'தலச்சேரி கடல் பிரியாணி',
    slug: 'thalassery-seafood-dum-biryani',
    categoryId: 'cloud-kitchen',
    type: 'KITCHEN',
    basePrice: 349,
    grossWeight: '750g Container',
    netWeight: 'Generous 1-2 portions',
    serves: '1-2 people',
    harborSource: 'Slow-cooked in dum sealed copper handis',
    storageTemp: 'Piping hot 70°C in insulated thermal pouch',
    badge: 'Bestseller Meal',
    isFreshCatch: false,
    isPopular: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 438,
    description: 'Aromatic short-grain Kaima rice cooked in Malabar style with juicy sea prawns, tender seer fish fillets, fried shallots, cashews and mint.',
    cookingTips: 'Best enjoyed warm with onion raita and date lemon pickle provided in the box.',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    variants: [
      { sku: 'BIRYANI-SEAFOOD-SINGLE', weightValue: 0.75, cutType: 'OTHER', price: 349, compareAtPrice: 399 },
    ],
  },
];

async function main() {
  console.log('🌱 Starting comprehensive V2 Seafood database seed on Lightsail...');

  // 1. Create Super Admin User
  const adminEmail = 'admin@vsquareseafood.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('AdminPassword123!', 12);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        phone: '9876543210',
        passwordHash,
        firstName: 'V2',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log(`✅ Super Admin created: ${admin.email} (Password: AdminPassword123!)`);
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  // 2. Create Categories
  console.log('📂 Seeding categories...');
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        tamilName: cat.tamilName,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
      },
      create: {
        id: cat.id,
        name: cat.name,
        tamilName: cat.tamilName,
        slug: cat.slug,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
  }
  console.log(`✅ ${CATEGORIES.length} categories seeded`);

  // 3. Create Products and Variants with Inventory
  console.log('🐟 Seeding products and initial inventory...');
  for (const item of SEED_PRODUCTS) {
    const { variants, imageUrl, ...productFields } = item;

    const product = await prisma.product.upsert({
      where: { slug: productFields.slug },
      update: {
        name: productFields.name,
        localName: productFields.localName,
        basePrice: productFields.basePrice,
        grossWeight: productFields.grossWeight,
        netWeight: productFields.netWeight,
        serves: productFields.serves,
        harborSource: productFields.harborSource,
        storageTemp: productFields.storageTemp,
        cookingTips: productFields.cookingTips,
        badge: productFields.badge,
        isFreshCatch: productFields.isFreshCatch,
        isPopular: productFields.isPopular,
        isFeatured: productFields.isFeatured,
        rating: productFields.rating,
        reviewsCount: productFields.reviewsCount,
      },
      create: {
        ...productFields,
        status: 'ACTIVE',
      },
    });

    // Product image
    const existingImg = await prisma.productImage.findFirst({
      where: { productId: product.id },
    });
    if (!existingImg && imageUrl) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          r2Key: `products/${product.id}/default.webp`,
          publicUrl: imageUrl,
          isPrimary: true,
          altText: product.name,
        },
      });
    }

    // Variants and stock
    for (const v of variants) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          price: v.price,
          compareAtPrice: v.compareAtPrice,
        },
        create: {
          productId: product.id,
          sku: v.sku,
          weightValue: v.weightValue,
          cutType: v.cutType,
          cleaningOption: v.cleaningOption,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          isAvailable: true,
        },
      });

      // Seed initial inventory (35 units per variant)
      await prisma.inventory.upsert({
        where: { productVariantId: variant.id },
        update: {},
        create: {
          productVariantId: variant.id,
          availableQuantity: 35,
          lowStockThreshold: 5,
        },
      });
    }
  }
  console.log(`✅ ${SEED_PRODUCTS.length} diverse seafood products seeded with live variants & stock`);

  // 4. Create Delivery Rules
  console.log('🚚 Seeding delivery rules...');
  const deliveryRules = [
    { name: 'Free Delivery for Orders ₹999+', strategy: 'FREE_ABOVE_AMOUNT', minAmount: 999, charge: 0, priority: 10 },
    { name: 'Standard Chennai Delivery', strategy: 'FLAT', charge: 49, priority: 1 },
  ];

  for (const rule of deliveryRules) {
    const existing = await prisma.deliveryRule.findFirst({ where: { name: rule.name } });
    if (!existing) {
      await prisma.deliveryRule.create({ data: rule });
    }
  }
  console.log('✅ Delivery rules seeded');

  // 5. Create Welcome Coupon
  console.log('🎟️ Seeding welcome coupon...');
  await prisma.coupon.upsert({
    where: { code: 'FIRSTORDER' },
    update: {},
    create: {
      code: 'FIRSTORDER',
      type: 'PERCENTAGE',
      value: 10,
      minOrderValue: 499,
      maxDiscount: 100,
      usageLimit: 1000,
      perUserLimit: 1,
      isActive: true,
    },
  });
  console.log('✅ Welcome coupon FIRSTORDER seeded (10% off up to ₹100)');

  // 6. Create Default Banners
  console.log('🖼️ Seeding banners...');
  const banners = [
    {
      title: 'Kasimedu Harbor Fresh Catch',
      subtitle: 'Delivered in 90 Minutes across Chennai',
      imageUrl: '/web-banner.png',
      r2Key: 'banners/web-banner.png',
      placement: 'home_hero',
      sortOrder: 1,
    },
    {
      title: 'Cloud Kitchen & Live Catering',
      subtitle: 'Authentic South Indian Seafood Experience',
      imageUrl: '/web-banner-2.png',
      r2Key: 'banners/web-banner-2.png',
      placement: 'home_hero',
      sortOrder: 2,
    },
  ];

  for (const banner of banners) {
    const existing = await prisma.banner.findFirst({ where: { r2Key: banner.r2Key } });
    if (!existing) {
      await prisma.banner.create({ data: banner });
    }
  }
  console.log('✅ Banners seeded');

  console.log('✨ Seed completed successfully with full catalog on Lightsail MySQL!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
