import mongoose from 'mongoose';
import dotenv from 'dotenv';
import https from 'https';
import Product from '../models/Product';

dotenv.config();

// ── Pexels image fetcher ─────────────────────────────────────────────────────
function fetchPexelsImage(query: string): Promise<string> {
  return new Promise((resolve) => {
    const apiKey = process.env.PEXELS_API_KEY || '';
    if (!apiKey) {
      console.warn(`  ⚠  PEXELS_API_KEY not set — skipping image for "${query}"`);
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

const catalog = [
  // ─────────────── BOUQUETS (8) ───────────────
  {
    name: 'Rose & Lily Bouquet',
    description: 'A classic arrangement of fresh red roses and white lilies — timeless, romantic, and always the right choice. Hand-tied with seasonal greens and wrapped in soft tissue.',
    price: 899,
    category: 'Bouquets',
    imageUrl: '/images/products/bouquets/rose-lily-bouquet.jpg',
    tags: ['romantic', 'fresh flowers', 'roses', 'lilies', 'anniversary', 'valentine', 'classic', 'elegant'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      colors: ['Red & White', 'Pink & White', 'Red & Pink'],
      sizes: [
        { label: 'Small (12 stems)', priceModifier: 0 },
        { label: 'Medium (20 stems)', priceModifier: 200 },
        { label: 'Large (30 stems)', priceModifier: 500 },
      ],
    },
  },
  {
    name: 'Sunflower Cheer Bunch',
    description: 'Bright, bold sunflowers guaranteed to light up any room. Perfect for birthdays, graduations, or just because — these cheerful blooms carry warmth and positivity.',
    price: 649,
    category: 'Bouquets',
    imageUrl: '/images/products/bouquets/sunflower-cheer-bunch.jpg',
    tags: ['cheerful', 'birthday', 'sunflowers', 'bright', 'fun', 'friendship', 'congratulations', 'yellow'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Pastel Dream Bouquet',
    description: 'Soft pink carnations, peach roses, and lavender wrapped in dreamy pastel paper. A gentle, thoughtful gift that suits every relationship and every occasion.',
    price: 799,
    category: 'Bouquets',
    imageUrl: '/images/products/bouquets/pastel-dream-bouquet.jpg',
    tags: ['pastel', 'soft', 'carnations', 'roses', 'lavender', 'feminine', 'mother', 'friendship'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      colors: ['Blush Pink', 'Peach', 'Lilac Mix'],
    },
  },
  {
    name: 'White Orchid Elegance',
    description: 'A potted white Phalaenopsis orchid — sophisticated, long-lasting, and a gift that keeps giving for months. Presented in a matte ceramic pot with moss dressing.',
    price: 1499,
    category: 'Bouquets',
    imageUrl: '/images/products/bouquets/white-orchid-elegance.jpg',
    tags: ['orchid', 'elegant', 'luxury', 'white', 'long lasting', 'home decor', 'premium', 'sophisticated'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Dried Wildflower Bunch',
    description: 'A curated mix of dried pampas, bunny tail grass, and preserved blooms — an everlasting arrangement that looks beautiful in any home. Zero maintenance, maximum impact.',
    price: 1099,
    category: 'Bouquets',
    imageUrl: '/images/products/bouquets/dried-wildflower-bunch.jpg',
    tags: ['dried flowers', 'boho', 'pampas', 'everlasting', 'home decor', 'aesthetic', 'unique', 'trendy'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Red Rose Dozen',
    description: 'Twelve premium long-stem red roses — the original, unbeatable declaration. Each rose is hand-selected for bloom perfection and wrapped in luxury black packaging.',
    price: 1299,
    category: 'Bouquets',
    imageUrl: '/images/products/bouquets/red-rose-dozen.jpg',
    tags: ['roses', 'romantic', 'red', 'valentine', 'anniversary', 'love', 'classic', 'premium'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      sizes: [
        { label: '12 Roses', priceModifier: 0 },
        { label: '24 Roses', priceModifier: 800 },
        { label: '50 Roses', priceModifier: 2500 },
      ],
    },
  },
  {
    name: 'Tulip Spring Bunch',
    description: 'Vibrant mixed tulips in red, yellow, orange and purple — fresh from the farm and bursting with spring energy. A cheerful, modern choice for someone who loves colour.',
    price: 849,
    category: 'Bouquets',
    imageUrl: '/images/products/bouquets/tulip-spring-bunch.jpg',
    tags: ['tulips', 'colourful', 'spring', 'cheerful', 'birthday', 'fresh', 'vibrant', 'modern'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Monsoon Greens Bouquet',
    description: 'Lush tropical leaves — monstera, bird of paradise, and banana — arranged into a bold, dramatic statement piece. For someone who loves plants more than flowers.',
    price: 749,
    category: 'Bouquets',
    imageUrl: '/images/products/bouquets/monsoon-greens-bouquet.jpg',
    tags: ['tropical', 'green', 'monstera', 'bold', 'nature lover', 'plant lover', 'unique', 'dramatic'],
    inStock: true,
    isCustomizable: false,
  },

  // ─────────────── HAMPERS (8) ───────────────
  {
    name: 'Mixed Macaron Box',
    description: 'Twelve French macarons in assorted flavours — pistachio, raspberry, lemon, salted caramel and more — presented in a signature gift box with a ribbon.',
    price: 799,
    category: 'Hampers',
    imageUrl: '/images/products/hampers/mixed-macaron-box.jpg',
    tags: ['sweet', 'premium', 'macarons', 'french', 'dessert', 'birthday', 'celebration', 'indulgent'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Self-Care Spa Hamper',
    description: 'A thoughtfully curated wellness kit: bath salts, a scented candle, face mask, lip balm, and a soft scrunchie — everything needed for a proper self-care evening.',
    price: 1499,
    category: 'Hampers',
    imageUrl: '/images/products/hampers/self-care-spa-hamper.jpg',
    tags: ['wellness', 'relaxation', 'spa', 'self care', 'candle', 'bath', 'feminine', 'birthday'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Gourmet Chai & Biscuit Box',
    description: 'A cosy gift of four premium loose-leaf chai blends, artisanal biscuits, and a hand-painted ceramic mug. The perfect send-home treat for a tea lover.',
    price: 999,
    category: 'Hampers',
    imageUrl: '/images/products/hampers/gourmet-chai-biscuit-box.jpg',
    tags: ['chai', 'tea', 'biscuits', 'cosy', 'mug', 'home', 'warm', 'desi'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Chocolate Lovers Hamper',
    description: 'A decadent collection of premium dark, milk and white chocolates, chocolate-dipped almonds, and a rich hot chocolate mix — every chocoholic\'s dream.',
    price: 1699,
    category: 'Hampers',
    imageUrl: '/images/products/hampers/chocolate-lovers-hamper.jpg',
    tags: ['chocolate', 'indulgent', 'sweet', 'premium', 'birthday', 'celebration', 'hamper', 'luxury'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'New Mum Pamper Hamper',
    description: 'A nurturing gift set for new mothers: soothing body butter, a sleep mist pillow spray, herbal nursing tea, a journal, and a personalised keepsake card.',
    price: 2199,
    category: 'Hampers',
    imageUrl: '/images/products/hampers/new-mum-pamper-hamper.jpg',
    tags: ['new mum', 'baby shower', 'wellness', 'mother', 'nurturing', 'premium', 'postpartum', 'care'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Diwali Celebration Hamper',
    description: 'A festive gift featuring premium dry fruits, assorted mithai, diyas, and a hand-block-printed tote — a beautiful tribute to the season of lights.',
    price: 1899,
    category: 'Hampers',
    imageUrl: '/images/products/hampers/diwali-celebration-hamper.jpg',
    tags: ['diwali', 'festive', 'mithai', 'dry fruits', 'indian', 'celebration', 'traditional', 'seasonal'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Bookworm\'s Delight Box',
    description: 'The perfect gift for a reader: a scented soy candle (library scent), a pretty bookmark, a reading journal, and a cosy pair of socks — everything for a reading nook.',
    price: 1199,
    category: 'Hampers',
    imageUrl: '/images/products/hampers/bookworm-delight-box.jpg',
    tags: ['books', 'reading', 'candle', 'cosy', 'journal', 'intellectual', 'gift for reader', 'unique'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Fitness & Wellness Kit',
    description: 'A gift for the health-conscious: a protein shaker, resistance bands, a herbal energy supplement, and a motivational journal — everything to fuel their next goal.',
    price: 1799,
    category: 'Hampers',
    imageUrl: '/images/products/hampers/fitness-wellness-kit.jpg',
    tags: ['fitness', 'gym', 'health', 'wellness', 'active', 'sport', 'protein', 'motivation'],
    inStock: true,
    isCustomizable: false,
  },

  // ─────────────── EXPERIENCES (8) ───────────────
  {
    name: 'Couple Spa Experience',
    description: 'A luxurious side-by-side spa session for two — includes a 60-minute Swedish massage, facial, and herbal foot soak. Bookable at partnered spas across the city.',
    price: 3499,
    category: 'Experiences',
    imageUrl: '/images/products/experiences/couple-spa-experience.jpg',
    tags: ['anniversary', 'romantic', 'spa', 'couple', 'luxury', 'relaxation', 'wellness', 'pampering'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Pottery Class for Two',
    description: 'A 2-hour hands-on pottery session for two — guided by a professional potter, you\'ll each create and glaze your own piece to take home. Messy, fun, and unforgettable.',
    price: 2199,
    category: 'Experiences',
    imageUrl: '/images/products/experiences/pottery-class-for-two.jpg',
    tags: ['fun', 'creative', 'couple', 'art', 'hands-on', 'unique', 'pottery', 'date night'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Stargazing Night Experience',
    description: 'A curated late-evening stargazing session on the outskirts of the city — includes telescope access, a constellation guide, and a hot thermos of chai under the stars.',
    price: 2799,
    category: 'Experiences',
    imageUrl: '/images/products/experiences/stargazing-night-experience.jpg',
    tags: ['romantic', 'unique', 'outdoors', 'night', 'stars', 'couple', 'adventure', 'memorable'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Cooking Masterclass',
    description: 'A 3-hour hands-on cooking class with a professional chef — choose from Italian, Thai, or Indian cuisines. You cook, you eat, you learn. Perfect for a food lover.',
    price: 3199,
    category: 'Experiences',
    imageUrl: '/images/products/experiences/cooking-masterclass.jpg',
    tags: ['cooking', 'food lover', 'chef', 'culinary', 'fun', 'skill', 'couple', 'friends'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      colors: ['Italian Cuisine', 'Thai Cuisine', 'Indian Cuisine'],
    },
  },
  {
    name: 'Wine & Cheese Tasting',
    description: 'An elegant guided tasting session exploring five wines paired with artisan cheeses and charcuterie. Hosted by a certified sommelier in an intimate setting.',
    price: 2499,
    category: 'Experiences',
    imageUrl: '/images/products/experiences/wine-cheese-tasting.jpg',
    tags: ['wine', 'cheese', 'tasting', 'elegant', 'adult', 'romantic', 'sophisticated', 'date night'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Photography Walk',
    description: 'A 3-hour guided photography walk through the city\'s most photogenic corners — led by a professional photographer who\'ll teach composition, light, and storytelling.',
    price: 1999,
    category: 'Experiences',
    imageUrl: '/images/products/experiences/photography-walk.jpg',
    tags: ['photography', 'creative', 'art', 'outdoors', 'skill', 'camera', 'unique', 'hobby'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Sunset Kayaking',
    description: 'A 90-minute guided kayaking experience at sunset — glide across calm water as the sky turns golden. No experience needed. Life jackets and equipment included.',
    price: 1799,
    category: 'Experiences',
    imageUrl: '/images/products/experiences/sunset-kayaking.jpg',
    tags: ['adventure', 'outdoors', 'water', 'sunset', 'active', 'kayaking', 'nature', 'couple'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Art Jamming Session',
    description: 'A 2-hour free-flow painting session in a relaxed studio — all materials provided, no experience needed. Paint anything you want, take your canvas home.',
    price: 1499,
    category: 'Experiences',
    imageUrl: '/images/products/experiences/art-jamming-session.jpg',
    tags: ['art', 'painting', 'creative', 'relaxing', 'fun', 'studio', 'canvas', 'expressive'],
    inStock: true,
    isCustomizable: false,
  },

  // ─────────────── CAKES (8) ───────────────
  {
    name: 'Red Velvet Cake',
    description: 'A classic red velvet with layers of moist sponge and cream cheese frosting — rich, indulgent, and always crowd-pleasing. Available in half or full kg.',
    price: 1099,
    category: 'Cakes',
    imageUrl: '/images/products/cakes/red-velvet-cake.jpg',
    tags: ['birthday', 'classic', 'red velvet', 'cream cheese', 'celebration', 'cake', 'indulgent', 'popular'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      sizes: [
        { label: 'Half kg', priceModifier: 0 },
        { label: '1 kg', priceModifier: 400 },
        { label: '2 kg', priceModifier: 1000 },
      ],
      addOns: [
        { name: 'Custom message on cake', price: 100 },
        { name: 'Add candles', price: 50 },
        { name: 'Add sparklers', price: 150 },
      ],
    },
  },
  {
    name: 'Chocolate Truffle Cake',
    description: 'Layers of dark chocolate sponge, ganache, and chocolate shavings — for the chocoholic who deserves the real thing. Dense, fudgy, and deeply satisfying.',
    price: 1199,
    category: 'Cakes',
    imageUrl: '/images/products/cakes/chocolate-truffle-cake.jpg',
    tags: ['birthday', 'celebration', 'chocolate', 'truffle', 'ganache', 'indulgent', 'rich', 'popular'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      sizes: [
        { label: 'Half kg', priceModifier: 0 },
        { label: '1 kg', priceModifier: 400 },
        { label: '2 kg', priceModifier: 1100 },
      ],
      addOns: [
        { name: 'Custom message on cake', price: 100 },
        { name: 'Add candles', price: 50 },
        { name: 'Add sparklers', price: 150 },
      ],
    },
  },
  {
    name: 'Photo Cake',
    description: 'Your favourite photo printed on an edible sheet and placed on a vanilla or chocolate base — a personalised cake that turns every birthday into a memory.',
    price: 1399,
    category: 'Cakes',
    imageUrl: '/images/products/cakes/photo-cake.jpg',
    tags: ['personalised', 'photo', 'birthday', 'custom', 'unique', 'sentimental', 'keepsake', 'celebration'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      colors: ['Vanilla Base', 'Chocolate Base', 'Butterscotch Base'],
      sizes: [
        { label: 'Half kg', priceModifier: 0 },
        { label: '1 kg', priceModifier: 400 },
      ],
      addOns: [
        { name: 'Upload your photo (we print it)', price: 0 },
        { name: 'Add candles', price: 50 },
      ],
    },
  },
  {
    name: 'Cupcake Box (12)',
    description: 'Twelve beautifully frosted cupcakes in assorted flavours and pastel colours — great for sharing, office parties, or a birthday that calls for something a little different.',
    price: 899,
    category: 'Cakes',
    imageUrl: '/images/products/cakes/cupcake-box.jpg',
    tags: ['cupcakes', 'birthday', 'sharing', 'celebration', 'colourful', 'party', 'office', 'fun'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      addOns: [
        { name: 'Custom name tag on each cupcake', price: 150 },
        { name: 'Add candles', price: 50 },
      ],
    },
  },
  {
    name: 'Jar Cakes Set (4)',
    description: 'Four mini layered cake jars in classic flavours: red velvet, oreo, lemon and blueberry. Individually sealed and portable — perfect for delivery gifting.',
    price: 699,
    category: 'Cakes',
    imageUrl: '/images/products/cakes/jar-cakes-set.jpg',
    tags: ['jar cake', 'mini', 'assorted', 'cute', 'delivery', 'birthday', 'unique', 'set'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Mango Rasmalai Cake',
    description: 'A fusion showstopper: layers of mango sponge soaked in saffron-infused rasmalai cream, topped with fresh mango slices and edible gold. A true Indian celebration cake.',
    price: 1799,
    category: 'Cakes',
    imageUrl: '/images/products/cakes/mango-rasmalai-cake.jpg',
    tags: ['mango', 'rasmalai', 'fusion', 'indian', 'festive', 'premium', 'celebration', 'unique'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      sizes: [
        { label: '1 kg', priceModifier: 0 },
        { label: '2 kg', priceModifier: 900 },
      ],
    },
  },
  {
    name: 'Black Forest Cake',
    description: 'The timeless classic — layers of chocolate sponge, whipped cream, and cherries, dusted with dark chocolate shavings. Some gifts never go out of style.',
    price: 1099,
    category: 'Cakes',
    imageUrl: '/images/products/cakes/black-forest-cake.jpg',
    tags: ['black forest', 'cherry', 'chocolate', 'classic', 'birthday', 'celebration', 'cream', 'popular'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      sizes: [
        { label: 'Half kg', priceModifier: 0 },
        { label: '1 kg', priceModifier: 400 },
      ],
      addOns: [
        { name: 'Add candles', price: 50 },
        { name: 'Custom message on cake', price: 100 },
      ],
    },
  },
  {
    name: 'Designer Fondant Cake',
    description: 'A fully custom fondant cake designed around a theme of your choice — floral, geometric, character, or abstract. Our bakers will work from your brief.',
    price: 2499,
    category: 'Cakes',
    imageUrl: '/images/products/cakes/designer-fondant-cake.jpg',
    tags: ['custom', 'fondant', 'designer', 'luxury', 'premium', 'unique', 'themed', 'personalised'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      sizes: [
        { label: '1 kg', priceModifier: 0 },
        { label: '2 kg', priceModifier: 1000 },
        { label: '3 kg', priceModifier: 2000 },
      ],
      addOns: [
        { name: 'Theme consultation call', price: 0 },
        { name: 'Add edible photo topper', price: 200 },
      ],
    },
  },

  // ─────────────── PERSONALISED (8) ───────────────
  {
    name: 'Custom Name Necklace',
    description: 'A delicate gold or silver-plated necklace with a name or word of your choice in cursive script — a wearable keepsake that feels intimate and permanent.',
    price: 1299,
    category: 'Personalised',
    imageUrl: '/images/products/personalised/custom-name-necklace.jpg',
    tags: ['jewellery', 'sentimental', 'necklace', 'name', 'custom', 'wearable', 'keepsake', 'feminine'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      colors: ['Gold Plated', 'Silver Plated', 'Rose Gold Plated'],
      addOns: [
        { name: 'Gift box packaging', price: 100 },
        { name: 'Add birthstone charm', price: 250 },
      ],
    },
  },
  {
    name: 'Personalised Photo Frame',
    description: 'A solid wood frame laser-engraved with a name, date, or short message around your favourite photo. A timeless keepsake for milestones, relationships, and memories.',
    price: 549,
    category: 'Personalised',
    imageUrl: '/images/products/personalised/personalised-photo-frame.jpg',
    tags: ['sentimental', 'keepsake', 'photo', 'frame', 'engraved', 'memory', 'wood', 'custom'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      addOns: [
        { name: 'Engrave name + date', price: 150 },
        { name: 'Engrave short message (up to 30 chars)', price: 200 },
      ],
    },
  },
  {
    name: 'Custom Star Map Print',
    description: 'A museum-quality print showing exactly how the night sky looked on a date that matters — a birthday, anniversary, or first meeting. With location and date engraved below.',
    price: 1499,
    category: 'Personalised',
    imageUrl: '/images/products/personalised/custom-star-map-print.jpg',
    tags: ['star map', 'astronomical', 'personalised', 'anniversary', 'romantic', 'art', 'framed', 'meaningful'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      colors: ['Midnight Navy', 'Blush Rose', 'Forest Green', 'Ivory & Gold'],
      sizes: [
        { label: 'A4 Print', priceModifier: 0 },
        { label: 'A3 Framed', priceModifier: 500 },
      ],
      addOns: [
        { name: 'Add custom quote below', price: 100 },
      ],
    },
  },
  {
    name: 'Engraved Watch',
    description: 'A minimalist stainless steel watch with a personal message engraved on the caseback — a sophisticated, lasting gift for milestones, retirements, and landmark birthdays.',
    price: 3499,
    category: 'Personalised',
    imageUrl: '/images/products/personalised/engraved-watch.jpg',
    tags: ['watch', 'engraved', 'luxury', 'milestone', 'masculine', 'retirement', 'premium', 'wearable'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      colors: ['Silver Case', 'Gold Case', 'Black Case'],
      addOns: [
        { name: 'Engrave message on caseback (up to 40 chars)', price: 0 },
        { name: 'Premium gift box', price: 150 },
      ],
    },
  },
  {
    name: 'Custom Illustration Portrait',
    description: 'A hand-drawn digital illustration of a person, couple, pet, or family — in a charming minimal art style. Delivered as a high-res print, ready to frame.',
    price: 1999,
    category: 'Personalised',
    imageUrl: '/images/products/personalised/custom-illustration-portrait.jpg',
    tags: ['illustration', 'portrait', 'custom', 'art', 'couple', 'pet', 'family', 'unique'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      colors: ['Minimal Line Art', 'Watercolour Style', 'Pop Art Style'],
      sizes: [
        { label: 'Digital File Only', priceModifier: 0 },
        { label: 'A4 Print', priceModifier: 200 },
        { label: 'A3 Framed Print', priceModifier: 600 },
      ],
    },
  },
  {
    name: 'Personalised Recipe Book',
    description: 'A beautiful hardcover book filled with blank recipe cards, personalised with a name on the cover and a dedication inside. Perfect for someone who loves to cook.',
    price: 899,
    category: 'Personalised',
    imageUrl: '/images/products/personalised/personalised-recipe-book.jpg',
    tags: ['cooking', 'food lover', 'book', 'recipe', 'personalised', 'kitchen', 'unique', 'sentimental'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      addOns: [
        { name: 'Personalise cover with name', price: 100 },
        { name: 'Add dedication page inside', price: 150 },
      ],
    },
  },
  {
    name: 'Custom City Map Print',
    description: 'A beautifully designed map of any city in the world — the city where they grew up, met someone special, or call home. Printed in a minimalist art style and ready to frame.',
    price: 1299,
    category: 'Personalised',
    imageUrl: '/images/products/personalised/custom-city-map-print.jpg',
    tags: ['map', 'city', 'personalised', 'travel', 'home decor', 'art', 'framed', 'meaningful'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      colors: ['Minimal Black & White', 'Warm Sepia', 'Bold Colour'],
      sizes: [
        { label: 'A4 Print', priceModifier: 0 },
        { label: 'A3 Framed', priceModifier: 500 },
      ],
    },
  },
  {
    name: 'Embroidered Cushion Cover',
    description: 'A plush velvet cushion cover with a name, initials, or short phrase hand-embroidered in your choice of thread colour. A warm, tactile, deeply personal home gift.',
    price: 799,
    category: 'Personalised',
    imageUrl: '/images/products/personalised/embroidered-cushion-cover.jpg',
    tags: ['embroidered', 'cushion', 'home decor', 'name', 'custom', 'cosy', 'handmade', 'personalised'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      colors: ['Dusty Pink', 'Forest Green', 'Midnight Blue', 'Ivory'],
      addOns: [
        { name: 'Embroider name or initials', price: 150 },
        { name: 'Add short phrase (up to 20 chars)', price: 200 },
      ],
    },
  },

  // ─────────────── PLANTS (8) ───────────────
  {
    name: 'Money Plant in Ceramic Pot',
    description: 'A lush, fast-growing money plant in a hand-painted ceramic pot — a classic housewarming or good-luck gift. Thrives indoors with minimal care and light.',
    price: 399,
    category: 'Plants',
    imageUrl: '/images/products/plants/money-plant-ceramic-pot.jpg',
    tags: ['lucky', 'home decor', 'housewarming', 'indoor', 'low maintenance', 'green', 'plant', 'good luck'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Succulent Trio Planter',
    description: 'Three sculptural succulents in a shared terracotta tray — desert plants that thrive on neglect. Perfect for desk gifting, office spaces, or anyone with a busy lifestyle.',
    price: 449,
    category: 'Plants',
    imageUrl: '/images/products/plants/succulent-trio-planter.jpg',
    tags: ['home decor', 'low maintenance', 'succulent', 'desk', 'office', 'terracotta', 'cute', 'minimal'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Peace Lily in White Pot',
    description: 'An elegant peace lily — one of the best air-purifying plants, and one of the easiest to care for. Its white blooms make it a sophisticated, calming gift.',
    price: 599,
    category: 'Plants',
    imageUrl: '/images/products/plants/peace-lily-white-pot.jpg',
    tags: ['peace lily', 'air purifying', 'white', 'elegant', 'indoor', 'wellness', 'calming', 'home decor'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Bonsai Starter Kit',
    description: 'A young bonsai tree with a glazed ceramic pot, training wire, and a care guide booklet — a gift that grows with them, one patient trim at a time.',
    price: 1299,
    category: 'Plants',
    imageUrl: '/images/products/plants/bonsai-starter-kit.jpg',
    tags: ['bonsai', 'zen', 'mindful', 'unique', 'patience', 'hobby', 'japanese', 'premium'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Herb Garden Kit',
    description: 'A starter kit to grow fresh herbs at home — includes seeds (basil, mint, coriander), biodegradable pots, potting mix, and a care guide. For the home cook who has everything.',
    price: 699,
    category: 'Plants',
    imageUrl: '/images/products/plants/herb-garden-kit.jpg',
    tags: ['herbs', 'cooking', 'food lover', 'kitchen', 'grow your own', 'mint', 'basil', 'diy'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Monstera Deliciosa',
    description: 'The iconic split-leaf monstera — a bold, architectural indoor plant that makes any space feel lush and alive. Comes in a designer pot. Easy to care for, impossible to ignore.',
    price: 1099,
    category: 'Plants',
    imageUrl: '/images/products/plants/monstera-deliciosa.jpg',
    tags: ['monstera', 'tropical', 'statement', 'home decor', 'indoor', 'bold', 'aesthetic', 'plant lover'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Lucky Bamboo Arrangement',
    description: 'A classic feng shui lucky bamboo arrangement in a glass vase with pebbles — thought to bring prosperity, health, and happiness. A universally loved gifting staple.',
    price: 499,
    category: 'Plants',
    imageUrl: '/images/products/plants/lucky-bamboo-arrangement.jpg',
    tags: ['lucky bamboo', 'feng shui', 'lucky', 'prosperity', 'desk', 'office', 'desi', 'housewarming'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Glass Terrarium Kit',
    description: 'A geometric glass terrarium with moss, pebbles, and two small succulents — a self-contained little world that sits beautifully on a desk or shelf.',
    price: 849,
    category: 'Plants',
    imageUrl: '/images/products/plants/glass-terrarium-kit.jpg',
    tags: ['terrarium', 'glass', 'geometric', 'aesthetic', 'desk', 'minimal', 'unique', 'succulent'],
    inStock: true,
    isCustomizable: false,
  },

  // ─────────────── COMBOS (8) ───────────────
  {
    name: 'Flowers + Cake Combo',
    description: 'The classic gifting duo — a fresh seasonal bouquet paired with a half-kg chocolate or vanilla cake. The all-occasion combo that never misses.',
    price: 1599,
    category: 'Combos',
    imageUrl: '/images/products/combos/flowers-cake-combo.jpg',
    tags: ['birthday', 'best seller', 'cake', 'flowers', 'combo', 'popular', 'celebration', 'classic'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      colors: ['Chocolate Cake + Mixed Bouquet', 'Vanilla Cake + Rose Bouquet', 'Red Velvet + Sunflowers'],
    },
  },
  {
    name: 'Bouquet + Chocolate Box',
    description: 'A hand-tied rose bouquet paired with a premium assorted chocolate box — the universally loved romantic combo for anniversaries, Valentine\'s Day, and beyond.',
    price: 1299,
    category: 'Combos',
    imageUrl: '/images/products/combos/bouquet-chocolate-box.jpg',
    tags: ['romantic', 'popular', 'chocolate', 'bouquet', 'anniversary', 'valentine', 'combo', 'classic'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Spa Hamper + Rose Bouquet',
    description: 'The ultimate self-care gift combo — a curated spa hamper with a scented candle, bath salts, and face mask, paired with a dozen fresh roses.',
    price: 2499,
    category: 'Combos',
    imageUrl: '/images/products/combos/spa-hamper-rose-bouquet.jpg',
    tags: ['spa', 'wellness', 'roses', 'self care', 'feminine', 'birthday', 'luxury', 'combo'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Cake + Cupcakes Duo',
    description: 'A half-kg signature cake surrounded by six matching mini cupcakes — perfect for when you want a centrepiece and shareable treats at the same time.',
    price: 1399,
    category: 'Combos',
    imageUrl: '/images/products/combos/cake-cupcakes-duo.jpg',
    tags: ['birthday', 'cake', 'cupcakes', 'party', 'celebration', 'sharing', 'fun', 'combo'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      colors: ['Chocolate Theme', 'Vanilla & Pastel', 'Red Velvet Theme'],
    },
  },
  {
    name: 'Plant + Personalised Frame',
    description: 'A lush indoor plant paired with a custom photo frame — a thoughtful combo that brings something living and something lasting into their space.',
    price: 999,
    category: 'Combos',
    imageUrl: '/images/products/combos/plant-personalised-frame.jpg',
    tags: ['plant', 'photo frame', 'personalised', 'housewarming', 'home decor', 'thoughtful', 'combo', 'unique'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      addOns: [
        { name: 'Engrave name on frame', price: 150 },
        { name: 'Upgrade plant to Monstera', price: 300 },
      ],
    },
  },
  {
    name: 'Diwali Mega Combo',
    description: 'A premium festive combo: a Diwali hamper (dry fruits, mithai, diya set) paired with a box of assorted chocolates and a fresh marigold arrangement. A complete celebration in a box.',
    price: 2799,
    category: 'Combos',
    imageUrl: '/images/products/combos/diwali-mega-combo.jpg',
    tags: ['diwali', 'festive', 'premium', 'hamper', 'chocolate', 'marigold', 'indian', 'combo'],
    inStock: true,
    isCustomizable: false,
  },
  {
    name: 'Book Lover\'s Combo',
    description: 'A bookworm\'s delight: a beautiful bookmark, a cosy scented candle, and a bestselling novel wrapped in craft paper with a handwritten tag.',
    price: 1199,
    category: 'Combos',
    imageUrl: '/images/products/combos/book-lovers-combo.jpg',
    tags: ['books', 'reading', 'candle', 'bookmark', 'intellectual', 'cosy', 'unique', 'combo'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      addOns: [
        { name: 'Add a handwritten note from you', price: 0 },
        { name: 'Personalise with their name on the bookmark', price: 100 },
      ],
    },
  },
  {
    name: 'New Baby Combo',
    description: 'A celebration bundle for a new arrival: a soft plush toy, a personalised baby frame, a scented candle for the parents, and a pastel flower arrangement.',
    price: 2199,
    category: 'Combos',
    imageUrl: '/images/products/combos/new-baby-combo.jpg',
    tags: ['baby', 'new born', 'baby shower', 'plush', 'flowers', 'personalised', 'parents', 'combo'],
    inStock: true,
    isCustomizable: true,
    customizationOptions: {
      addOns: [
        { name: 'Personalise the baby frame with name', price: 150 },
        { name: 'Add a handwritten card', price: 0 },
      ],
    },
  },
];

// ── Pexels search queries per product (tuned for best image match) ──────────
const imageQueries: Record<string, string> = {
  'Rose & Lily Bouquet': 'rose lily flower bouquet',
  'Sunflower Cheer Bunch': 'sunflower bouquet bunch',
  'Pastel Dream Bouquet': 'pastel pink flower bouquet',
  'White Orchid Elegance': 'white orchid flower pot',
  'Dried Wildflower Bunch': 'dried pampas flower bouquet',
  'Red Rose Dozen': 'red rose dozen bouquet',
  'Tulip Spring Bunch': 'colourful tulip bouquet',
  'Monsoon Greens Bouquet': 'tropical green leaf arrangement',
  'Mixed Macaron Box': 'french macaron box colourful',
  'Self-Care Spa Hamper': 'spa self care gift hamper',
  'Gourmet Chai & Biscuit Box': 'chai tea gift box ceramic mug',
  'Chocolate Lovers Hamper': 'chocolate gift hamper box',
  'New Mum Pamper Hamper': 'mother pamper gift set wellness',
  'Diwali Celebration Hamper': 'diwali gift hamper festive',
  "Bookworm's Delight Box": 'book candle bookmark gift set',
  'Fitness & Wellness Kit': 'fitness gym gift set wellness',
  'Couple Spa Experience': 'couple spa massage experience',
  'Pottery Class for Two': 'pottery class hands clay',
  'Stargazing Night Experience': 'stargazing night sky telescope',
  'Cooking Masterclass': 'cooking class chef kitchen',
  'Wine & Cheese Tasting': 'wine cheese tasting elegant',
  'Photography Walk': 'photography camera walk city',
  'Sunset Kayaking': 'kayaking sunset water adventure',
  'Art Jamming Session': 'painting art studio canvas',
  'Red Velvet Cake': 'red velvet cake slice',
  'Chocolate Truffle Cake': 'chocolate truffle cake birthday',
  'Photo Cake': 'custom photo cake birthday',
  'Cupcake Box (12)': 'cupcake box assorted colourful',
  'Jar Cakes Set (4)': 'cake jar mini dessert',
  'Mango Rasmalai Cake': 'mango cake indian dessert',
  'Black Forest Cake': 'black forest cake cherry cream',
  'Designer Fondant Cake': 'fondant designer cake custom',
  'Custom Name Necklace': 'gold name necklace jewellery',
  'Personalised Photo Frame': 'photo frame wood personalised',
  'Custom Star Map Print': 'star map night sky print art',
  'Engraved Watch': 'minimalist watch gift box',
  'Custom Illustration Portrait': 'custom portrait illustration art',
  'Personalised Recipe Book': 'recipe book kitchen personalised',
  'Custom City Map Print': 'city map art print minimal',
  'Embroidered Cushion Cover': 'embroidered velvet cushion cover',
  'Money Plant in Ceramic Pot': 'money plant ceramic pot indoor',
  'Succulent Trio Planter': 'succulent trio terracotta planter',
  'Peace Lily in White Pot': 'peace lily white pot indoor',
  'Bonsai Starter Kit': 'bonsai tree ceramic pot',
  'Herb Garden Kit': 'herb garden kit seeds pot',
  'Monstera Deliciosa': 'monstera plant indoor pot',
  'Lucky Bamboo Arrangement': 'lucky bamboo glass vase',
  'Glass Terrarium Kit': 'glass terrarium succulent geometric',
  'Flowers + Cake Combo': 'flowers cake birthday gift combo',
  'Bouquet + Chocolate Box': 'roses chocolate box romantic gift',
  'Spa Hamper + Rose Bouquet': 'spa hamper roses gift set',
  'Cake + Cupcakes Duo': 'cake cupcakes birthday party',
  'Plant + Personalised Frame': 'plant photo frame home gift',
  'Diwali Mega Combo': 'diwali gift hamper festive combo',
  "Book Lover's Combo": 'book candle cosy reading gift',
  'New Baby Combo': 'baby gift set newborn flowers',
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || '');
  console.log('MongoDB connected');

  const hasPexels = !!process.env.PEXELS_API_KEY;
  if (!hasPexels) {
    console.log('\n⚠  PEXELS_API_KEY not found in .env — products will seed without images.');
    console.log('   Get a free key at https://www.pexels.com/api/ and re-run to add images.\n');
  }

  let updated = 0;
  let inserted = 0;

  for (const item of catalog) {
    // Fetch image from Pexels using the tuned query for this product
    const query = imageQueries[item.name] || item.name;
    process.stdout.write(`  → ${item.name} ... `);

    const imageUrl = hasPexels ? await fetchPexelsImage(query) : '';
    const productData = { ...item, imageUrl: imageUrl || item.imageUrl };

    const existing = await Product.findOne({ name: item.name });
    if (existing) {
      await Product.findByIdAndUpdate(existing._id, productData);
      updated++;
      console.log(imageUrl ? `updated ✓ (image fetched)` : `updated ✓`);
    } else {
      await Product.create(productData);
      inserted++;
      console.log(imageUrl ? `inserted ✓ (image fetched)` : `inserted ✓`);
    }

    // Small delay to avoid hitting Pexels rate limits (200 req/hour free tier)
    if (hasPexels) await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nDone — ${inserted} new products added, ${updated} existing products updated.`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});