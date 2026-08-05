import mongoose from 'mongoose';
import dotenv from 'dotenv';
import https from 'https';
import Product from '../models/Product';

dotenv.config();

function fetchPexelsImage(query: string): Promise<string> {
  return new Promise((resolve) => {
    const apiKey = process.env.PEXELS_API_KEY || '';
    if (!apiKey) {
      resolve('');
      return;
    }

    const encoded = encodeURIComponent(query);
    const options = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encoded}&per_page=1&orientation=square`,
      method: 'GET',
      headers: { Authorization: apiKey },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const url: string = json?.photos?.[0]?.src?.medium || '';
          resolve(url);
        } catch {
          resolve('');
        }
      });
    });

    req.on('error', () => resolve(''));
    req.end();
  });
}

interface CatalogSeedItem {
  name: string;
  description: string;
  price: number;
  category: string;
  searchQuery: string;
  tags: string[];
  inStock: boolean;
  isCustomizable: boolean;
  imageUrl?: string;
  customizationOptions?: any;
}

const expandedCatalog: CatalogSeedItem[] = [
  // ── 1. BOUQUETS ──
  {
    name: 'Velvet Crimson Rose Crate',
    description: 'Two dozen deeply pigmented red roses presented in a rustic wooden crate with baby eucalyptus and satin ribbon.',
    price: 1899,
    category: 'Bouquets',
    searchQuery: 'red roses crate bouquet',
    tags: ['romantic', 'roses', 'red', 'luxury', 'anniversary', 'valentine', 'elegant'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      colors: ['Deep Red', 'Blush Pink'],
      sizes: [{ label: 'Standard (24 roses)', priceModifier: 0 }, { label: 'Grand (36 roses)', priceModifier: 700 }]
    }
  },
  {
    name: 'Lavender & Wild Herb Posy',
    description: 'Soothing French lavender bundled with dried rosemary and chamomile flowers. Radiates a natural, calming fragrance.',
    price: 849,
    category: 'Bouquets',
    searchQuery: 'lavender bouquet dried flowers',
    tags: ['lavender', 'calming', 'herb', 'aromatic', 'boho', 'friendship', 'get well soon'],
    inStock: true,
    isCustomizable: false
  },
  {
    name: 'Golden Tulip & Carnation Mix',
    description: 'Vibrant yellow tulips paired with white carnations and delicate fern leaves. A bright ray of sunshine in a vase.',
    price: 1299,
    category: 'Bouquets',
    searchQuery: 'yellow tulips bouquet',
    tags: ['tulips', 'cheerful', 'bright', 'yellow', 'birthday', 'congratulations', 'sunshine'],
    inStock: true,
    isCustomizable: false
  },

  // ── 2. HAMPERS ──
  {
    name: 'Artisanal Coffee & Chocolate Trunk',
    description: 'Single-origin South Indian Arabica beans, dark Belgian chocolate truffles, a French press, and ceramic mugs in a leatherette trunk.',
    price: 3499,
    category: 'Hampers',
    searchQuery: 'gourmet coffee hamper dark chocolate',
    tags: ['coffee', 'gourmet', 'chocolate', 'luxury', 'colleague', 'mentor', 'corporate', 'premium'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      addOns: [{ name: 'Brass Coffee Filter', price: 450 }, { name: 'Personalized Mugs', price: 300 }]
    }
  },
  {
    name: 'Organic Wellness & Spa Basket',
    description: 'Handmade lavender body butter, cold-pressed jojoba oil, bamboo bath brush, scented soy candle, and organic herbal teas.',
    price: 2499,
    category: 'Hampers',
    searchQuery: 'spa gift basket lavender candle',
    tags: ['wellness', 'spa', 'self care', 'organic', 'relaxing', 'skincare', 'feminine', 'birthday'],
    inStock: true,
    isCustomizable: false
  },
  {
    name: 'Snack Attack Party Crate',
    description: 'Gourmet flavored makhana, roasted nuts, artisanal tortilla chips, salsa dip, and craft sparkling sodas.',
    price: 1599,
    category: 'Hampers',
    searchQuery: 'gourmet snack hamper chips nuts',
    tags: ['food', 'snacks', 'fun', 'party', 'best friend', 'movie night', 'birthday', 'crunchy'],
    inStock: true,
    isCustomizable: false
  },

  // ── 3. EXPERIENCES ──
  {
    name: 'Stargazing & Camping Night Voucher',
    description: 'An overnight glamping experience for two under the stars with bonfire, outdoor movie screening, and barbecue dinner.',
    price: 4999,
    category: 'Experiences',
    searchQuery: 'glamping bonfire stars night',
    tags: ['experience', 'outdoor', 'adventure', 'camping', 'stargazing', 'couple', 'romantic', 'anniversary'],
    inStock: true,
    isCustomizable: false
  },
  {
    name: 'Pottery & Ceramic Workshop Pass',
    description: 'A 3-hour guided wheel-throwing pottery masterclass for two at a boutique studio, including ceramic pieces to take home.',
    price: 2799,
    category: 'Experiences',
    searchQuery: 'pottery workshop ceramic wheel',
    tags: ['experience', 'creative', 'art', 'pottery', 'workshop', 'hobby', 'date night', 'fun'],
    inStock: true,
    isCustomizable: false
  },
  {
    name: 'Luxury Spa Massage & Facial Package',
    description: '60-minute Swedish full-body aromatherapy massage followed by a hydrating herbal facial at a 5-star spa.',
    price: 3999,
    category: 'Experiences',
    searchQuery: 'spa aromatherapy massage relaxation',
    tags: ['experience', 'spa', 'luxury', 'relaxation', 'wellness', 'massage', 'pamper'],
    inStock: true,
    isCustomizable: false
  },

  // ── 4. CAKES ──
  {
    name: 'Belgian Dark Chocolate Ganache Cake',
    description: 'Rich, moist chocolate sponge layered with 70% dark Belgian chocolate ganache and dusted with Dutch cocoa powder.',
    price: 1199,
    category: 'Cakes',
    searchQuery: 'dark chocolate cake rich',
    tags: ['cake', 'chocolate', 'gourmet', 'delicious', 'birthday', 'celebration', 'decadent'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      sizes: [{ label: '0.5 kg', priceModifier: 0 }, { label: '1.0 kg', priceModifier: 600 }, { label: '2.0 kg', priceModifier: 1600 }]
    }
  },
  {
    name: 'Fresh Mango Cream Layer Cake',
    description: 'Light vanilla chiffon cake filled with fresh Alphonso mango slices and whipped vanilla bean cream.',
    price: 1349,
    category: 'Cakes',
    searchQuery: 'mango cake fresh fruit',
    tags: ['cake', 'mango', 'fruit', 'fresh', 'summer', 'birthday', 'celebration', 'sweet'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      sizes: [{ label: '0.5 kg', priceModifier: 0 }, { label: '1.0 kg', priceModifier: 650 }]
    }
  },

  // ── 5. PERSONALISED ──
  {
    name: 'Monogrammed Full-Grain Leather Journal',
    description: 'Hand-stitched Italian leather notebook with custom foil-stamped initials, refillable lined pages, and pen holder loop.',
    price: 1499,
    category: 'Personalised',
    searchQuery: 'leather journal embossed notebook',
    tags: ['personalised', 'leather', 'journal', 'writer', 'notes', 'executive', 'mentor', 'thoughtful'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      colors: ['Tan Brown', 'Midnight Black', 'Forest Green']
    }
  },
  {
    name: 'Custom Engraved Wooden Watch Stand',
    description: 'Solid walnut wood desktop organizer for watches, phone, keys, and wallet with personalized name laser engraving.',
    price: 1799,
    category: 'Personalised',
    searchQuery: 'wooden desk organizer watch stand',
    tags: ['personalised', 'wood', 'engraved', 'desk', 'watch', 'organizer', 'for him', 'colleague'],
    inStock: true,
    isCustomizable: true
  },

  // ── 6. PLANTS ──
  {
    name: 'Japanese Ficus Bonsai Tree',
    description: 'An 8-year-old curved Ficus Bonsai tree planted in a handcrafted ceramic glazed tray. Symbolizes harmony and peace.',
    price: 2199,
    category: 'Plants',
    searchQuery: 'bonsai tree ceramic pot',
    tags: ['plant', 'bonsai', 'zen', 'green', 'home decor', 'long lasting', 'mentor', 'thoughtful'],
    inStock: true,
    isCustomizable: false
  },
  {
    name: 'Lucky Golden Money Plant Duo',
    description: 'Two lush golden Pothos plants in self-watering geometric matte ceramic planters. Ideal for desks and air purification.',
    price: 799,
    category: 'Plants',
    searchQuery: 'money plant desk ceramic planter',
    tags: ['plant', 'green', 'desk', 'office', 'air purifier', 'lucky', 'housewarming', 'colleague'],
    inStock: true,
    isCustomizable: false
  },

  // ── 7. COMBOS ──
  {
    name: 'Rose Bouquet & Red Velvet Bento Cake',
    description: 'Half-dozen fresh red roses paired with a adorable 250g Red Velvet mini bento cake in a vintage gift box.',
    price: 1499,
    category: 'Combos',
    searchQuery: 'roses and cake gift combo',
    tags: ['combo', 'roses', 'cake', 'red velvet', 'romantic', 'birthday', 'anniversary', 'sweet'],
    inStock: true,
    isCustomizable: false
  },
  {
    name: 'Plant & Scented Candle Harmony Combo',
    description: 'A Jade succulent plant in a marble pot coupled with a hand-poured vanilla sandalwood soy wax candle.',
    price: 1199,
    category: 'Combos',
    searchQuery: 'succulent plant candle combo gift',
    tags: ['combo', 'plant', 'candle', 'cosy', 'fragrance', 'home decor', 'housewarming', 'friendship'],
    inStock: true,
    isCustomizable: false
  }
];

async function seedWebGifts() {
  try {
    const mongoUri = process.env.MONGO_URI || '';
    if (!mongoUri) {
      console.error('❌ MONGO_URI missing in backend/.env');
      process.exit(1);
    }

    console.log('🌱 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas.');

    console.log(`📦 Preparing to add ${expandedCatalog.length} expanded gift catalog items...`);
    let addedCount = 0;

    for (const item of expandedCatalog) {
      const { searchQuery, ...productData } = item;
      
      let imageUrl = productData.imageUrl || '';
      if (!imageUrl && searchQuery) {
        imageUrl = await fetchPexelsImage(searchQuery);
      }

      await Product.findOneAndUpdate(
        { name: productData.name },
        { ...productData, imageUrl: imageUrl || productData.imageUrl || '' },
        { upsert: true, new: true }
      );

      addedCount++;
      console.log(`  └─ [${addedCount}/${expandedCatalog.length}] Processed: ${productData.name}`);
    }

    console.log(`\n🎉 Successfully seeded ${addedCount} internal gift store items into MongoDB!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedWebGifts();
