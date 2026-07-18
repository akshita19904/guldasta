/**
 * Guldasta Recommendation Scoring Engine — v3
 *
 * Dimensions and weights:
 *   Interest match       28%  — keyword overlap between person interests and product tags/name
 *   Budget fit           22%  — within range = 100, decays linearly above max
 *   Occasion fit         18%  — product tags matched against occasion keywords
 *   Relationship fit     15%  — category/tag affinity per relationship type
 *   Gender/age fit       10%  — penalises strongly mismatched products (e.g. new mum for a teen male)
 *   Past gift penalty     4%  — penalise exact repeats and recent same-category gifts
 *   Popularity            3%  — normalised platform-wide units sold
 */

export interface ProductForScoring {
  _id: string;
  name: string;
  price: number;
  category: string;
  tags: string[];
  isCustomizable: boolean;
  inStock: boolean;
}

export interface PersonContext {
  relationship: string;
  interests: string[];
  notes: string;
  age?: number;
  gender?: string;
}

export interface PastGift {
  productId?: string;
  title: string;
  category: string;
  occasion?: string;
  createdAt: Date;
}

export interface ScoringInput {
  product: ProductForScoring;
  person: PersonContext;
  occasion: string;
  budgetMin: number;
  budgetMax: number;
  pastGifts: PastGift[];
  popularityScore: number;
}

export interface ScoreBreakdown {
  total: number;
  interestMatch: number;
  budgetFit: number;
  occasionFit: number;
  relationshipFit: number;
  genderAgeFit: number;
  pastGiftPenalty: number;
  popularity: number;
}

// ---------- Occasion keyword map ----------
const OCCASION_TAGS: Record<string, string[]> = {
  birthday: ['birthday', 'celebration', 'cake', 'bouquet', 'personalised', 'hamper', 'combo', 'fun', 'gift'],
  anniversary: ['anniversary', 'romantic', 'personalised', 'experience', 'bouquet', 'combo', 'couple'],
  wedding: ['wedding', 'personalised', 'hamper', 'experience', 'combo', 'couple'],
  "valentine's day": ['romantic', 'bouquet', 'personalised', 'experience', 'chocolate', 'couple'],
  diwali: ['hamper', 'sweets', 'combo', 'diwali', 'festive', 'indian'],
  holi: ['holi', 'celebration', 'combo', 'festive'],
  'raksha bandhan': ['rakhi', 'combo', 'hamper', 'personalised', 'sibling'],
  christmas: ['christmas', 'hamper', 'combo', 'personalised', 'festive'],
  'thank you': ['personalised', 'hamper', 'plant', 'experience', 'thoughtful'],
  'get well soon': ['plant', 'hamper', 'bouquet', 'wellness', 'care'],
  graduation: ['experience', 'personalised', 'hamper', 'achievement', 'celebration'],
  'baby shower': ['personalised', 'hamper', 'combo', 'baby', 'new born'],
};

// ---------- Relationship affinity ----------
// Tighter mapping — categories NOT in the list score 0 on category match
const RELATIONSHIP_AFFINITY: Record<string, { categories: string[]; tags: string[] }> = {
  Partner: {
    categories: ['Personalised', 'Experiences', 'Bouquets', 'Combos'],
    tags: ['romantic', 'luxury', 'personalised', 'experience', 'bouquet', 'couple', 'anniversary'],
  },
  Family: {
    categories: ['Hampers', 'Cakes', 'Combos', 'Personalised', 'Plants'],
    tags: ['hamper', 'sweets', 'cake', 'celebration', 'personalised', 'festive', 'family'],
  },
  'Best Friend': {
    categories: ['Experiences', 'Personalised', 'Combos', 'Hampers', 'Bouquets'],
    tags: ['fun', 'experience', 'personalised', 'celebration', 'combo', 'friendship', 'cheerful'],
  },
  Friend: {
    categories: ['Plants', 'Hampers', 'Bouquets', 'Combos'],
    tags: ['plant', 'hamper', 'cheerful', 'birthday', 'friendship', 'fun'],
  },
  Colleague: {
    categories: ['Plants', 'Hampers', 'Personalised'],
    tags: ['plant', 'hamper', 'professional', 'personalised', 'desk', 'office'],
  },
  Mentor: {
    categories: ['Plants', 'Hampers', 'Experiences', 'Personalised'],
    tags: ['plant', 'experience', 'personalised', 'hamper', 'thoughtful', 'premium'],
  },
  Other: {
    categories: ['Hampers', 'Plants', 'Combos', 'Bouquets'],
    tags: ['hamper', 'plant', 'combo', 'cheerful'],
  },
};

// ---------- Gender/age affinity ----------
// Products strongly associated with a specific demographic get flagged here.
// This is used to PENALISE mismatches, not to exclude — a male can still
// get a spa experience, but a "New Mum Hamper" should score near-zero for a teen male.

const FEMALE_LEANING_TAGS = new Set([
  'feminine', 'new mum', 'postpartum', 'nursing', 'baby shower',
  'jewellery', 'necklace', 'cushion', 'embroidered',
]);

const MALE_LEANING_TAGS = new Set([
  'masculine', 'for him', 'watch', 'engraved watch',
]);

const STRONGLY_FEMALE_NAMES = [
  'new mum pamper hamper', 'custom name necklace', 'embroidered cushion cover',
];

const STRONGLY_MALE_NAMES: string[] = [];

// Products appropriate for any age — no penalty applied
const TEEN_FRIENDLY_CATEGORIES = new Set(['Experiences', 'Cakes', 'Personalised', 'Combos', 'Hampers']);

// Products strongly adult/couple-oriented — penalise for teens
const ADULT_ORIENTED_TAGS = new Set([
  'romantic', 'couple', 'anniversary', 'wine', 'sommelier', 'spa', 'luxury',
]);

function scoreGenderAgeFit(
  product: ProductForScoring,
  gender?: string,
  age?: number
): number {
  let score = 100;
  const productNameLower = product.name.toLowerCase();
  const allTags = new Set(product.tags.map(t => t.toLowerCase()));

  // ── Gender mismatch penalties ──
  if (gender === 'male') {
    const isFemaleProduct =
      STRONGLY_FEMALE_NAMES.some(n => productNameLower.includes(n)) ||
      [...FEMALE_LEANING_TAGS].filter(t => allTags.has(t)).length >= 2;

    if (isFemaleProduct) score -= 70; // heavy penalty, not full exclusion
  }

  if (gender === 'female') {
    const isMaleProduct =
      STRONGLY_MALE_NAMES.some(n => productNameLower.includes(n)) ||
      [...MALE_LEANING_TAGS].filter(t => allTags.has(t)).length >= 2;

    if (isMaleProduct) score -= 50;
  }

  // ── Age mismatch penalties ──
  if (age !== undefined && age < 22) {
    // Teens and young adults: penalise romantic/couple/wine experiences
    const adultTagMatches = [...ADULT_ORIENTED_TAGS].filter(t => allTags.has(t)).length;
    if (adultTagMatches >= 2) {
      score -= 40; // moderate penalty — a 20-year-old can still get a spa gift
    }

    // Very young (under 16): also deprioritise expensive luxury items
    if (age < 16 && product.price > 2000) {
      score -= 20;
    }
  }

  if (age !== undefined && age > 55) {
    // Older adults: mild boost for hampers, plants, personalised — already covered
    // by interest/relationship match, nothing extra needed here
  }

  return Math.max(0, score);
}

// ---------- Helpers ----------
function normalise(str: string): string { return str.toLowerCase().trim(); }
function tokenise(str: string): string[] {
  return str.toLowerCase().split(/[\s,._\-\/]+/).filter(Boolean);
}

function overlapScore(query: string[], catalog: string[]): number {
  if (!query.length || !catalog.length) return 0;
  const catalogSet = new Set(catalog.map(normalise));
  const matches = query.filter(q => catalogSet.has(normalise(q))).length;
  return matches / query.length;
}

// ---------- Interest match ----------
function scoreInterestMatch(product: ProductForScoring, interests: string[]): number {
  // No interests stored → return 0, not 30.
  // Returning 30 as a "neutral" score was the bug — it meant everyone with
  // no interests got the same score, making all products rank equally on this dimension.
  if (!interests.length) return 0;

  const interestTokens = interests.flatMap(i => tokenise(i));
  const productTokens = [
  ...product.tags.flatMap(t => tokenise(t)),
  normalise(product.category),
  ...tokenise(product.name),
];

  // Partial match bonus: if any interest token appears anywhere in product text
  const directScore = overlapScore(interestTokens, productTokens);

  // Synonym expansion for common interests
  const synonymMap: Record<string, string[]> = {
    cars: ['automotive', 'driving', 'speed', 'experience', 'adventure'],
    movies: ['entertainment', 'cinema', 'film', 'fun', 'experience'],
    music: ['concert', 'experience', 'entertainment', 'creative'],
    gaming: ['fun', 'entertainment', 'experience', 'creative'],
    travel: ['experience', 'adventure', 'outdoor', 'exploration'],
    fitness: ['gym', 'sport', 'active', 'wellness', 'health'],
    cooking: ['culinary', 'food', 'kitchen', 'chef', 'recipe'],
    reading: ['books', 'intellectual', 'cosy', 'journal'],
    art: ['creative', 'painting', 'illustration', 'aesthetic'],
    photography: ['camera', 'creative', 'art', 'experience'],
    nature: ['plant', 'outdoor', 'green', 'garden'],
    fashion: ['jewellery', 'personalised', 'wearable', 'accessories'],
    coffee: ['hamper', 'gourmet', 'premium', 'cosy'],
    tech: ['experience', 'gadget', 'fun', 'entertainment'],
  };

  let synonymScore = 0;
  for (const interest of interests) {
    const key = normalise(interest);
    const synonyms = synonymMap[key] || [];
    if (synonyms.length > 0) {
      const match = overlapScore(synonyms, productTokens);
      synonymScore = Math.max(synonymScore, match * 0.6); // synonyms count for 60% of a direct match
    }
  }

  const combined = Math.min(1, directScore + synonymScore);
  return Math.round(combined * 100);
}

// ---------- Budget fit ----------
function scoreBudgetFit(price: number, min: number, max: number): number {
  if (price >= min && price <= max) return 100;
  if (price < min) {
    const gap = min - price;
    const penalty = Math.min(gap / min, 1);
    return Math.round((1 - penalty * 0.5) * 100);
  }
  const overage = price - max;
  const penalty = Math.min(overage / max, 1);
  return Math.round((1 - penalty) * 100);
}

// ---------- Occasion fit ----------
function scoreOccasionFit(product: ProductForScoring, occasion: string): number {
  const occasionKey = normalise(occasion);
  const keywords = OCCASION_TAGS[occasionKey] || tokenise(occasion);
  const productTokens = [
    ...product.tags.map(normalise),
    normalise(product.category),
    ...tokenise(product.name),
  ];
  return Math.round(overlapScore(keywords, productTokens) * 100);
}

// ---------- Relationship fit ----------
function scoreRelationshipFit(product: ProductForScoring, relationship: string): number {
  const affinity = RELATIONSHIP_AFFINITY[relationship] || RELATIONSHIP_AFFINITY['Other'];
  const categoryMatch = affinity.categories.includes(product.category) ? 1 : 0;
  const tagMatches = overlapScore(affinity.tags, product.tags);
  return Math.round((categoryMatch * 0.6 + tagMatches * 0.4) * 100);
}

// ---------- Past gift penalty ----------
function scorePastGiftPenalty(product: ProductForScoring, pastGifts: PastGift[]): number {
  if (!pastGifts.length) return 100;
  const now = Date.now();
  const msPerDay = 1000 * 60 * 60 * 24;
  let penalty = 0;

  for (const gift of pastGifts) {
    const daysAgo = (now - new Date(gift.createdAt).getTime()) / msPerDay;
    const isExactRepeat =
      gift.productId === product._id ||
      normalise(gift.title) === normalise(product.name);

    if (isExactRepeat) {
      const fadedPenalty = Math.max(0, 1 - daysAgo / 730);
      penalty = Math.max(penalty, 0.9 * fadedPenalty + 0.2);
    }
    if (gift.category === product.category && daysAgo < 90) {
      const fadedPenalty = Math.max(0, 1 - daysAgo / 90) * 0.4;
      penalty = Math.max(penalty, fadedPenalty);
    }
  }

  return Math.round((1 - Math.min(penalty, 1)) * 100);
}

// ---------- Main scoring function ----------
export function scoreProduct(input: ScoringInput): ScoreBreakdown {
  const { product, person, occasion, budgetMin, budgetMax, pastGifts, popularityScore } = input;

  const interestMatch   = scoreInterestMatch(product, person.interests);
  const budgetFit       = scoreBudgetFit(product.price, budgetMin, budgetMax);
  const occasionFit     = scoreOccasionFit(product, occasion);
  const relationshipFit = scoreRelationshipFit(product, person.relationship);
  const genderAgeFit    = scoreGenderAgeFit(product, person.gender, person.age);
  const pastGiftPenalty = scorePastGiftPenalty(product, pastGifts);
  const popularity      = Math.round(Math.min(popularityScore, 100));

  const total = Math.round(
    interestMatch   * 0.28 +
    budgetFit       * 0.22 +
    occasionFit     * 0.18 +
    relationshipFit * 0.15 +
    genderAgeFit    * 0.10 +
    pastGiftPenalty * 0.04 +
    popularity      * 0.03
  );

  return { total, interestMatch, budgetFit, occasionFit, relationshipFit, genderAgeFit, pastGiftPenalty, popularity };
}

// ---------- Rank function ----------
export function rankProducts(
  products: ProductForScoring[],
  personContext: PersonContext,
  occasion: string,
  budgetMin: number,
  budgetMax: number,
  pastGifts: PastGift[],
  popularityMap: Record<string, number>
): Array<ProductForScoring & { scoreBreakdown: ScoreBreakdown }> {
  const scored = products.map(product => ({
    ...product,
    scoreBreakdown: scoreProduct({
      product,
      person: personContext,
      occasion,
      budgetMin,
      budgetMax,
      pastGifts,
      popularityScore: popularityMap[product._id] || 0,
    }),
  }));
  return scored.sort((a, b) => b.scoreBreakdown.total - a.scoreBreakdown.total);
}