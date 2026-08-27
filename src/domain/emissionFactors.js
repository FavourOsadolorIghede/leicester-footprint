/**
 * Emission factors & CO₂e estimation methodology.
 *
 * All numbers are ESTIMATES based on published UK average factors. They exist to
 * guide greener choices, not to produce exact carbon accounting.
 *
 * Sources / basis:
 *  - Travel: UK Government (DESNZ/DEFRA) greenhouse-gas conversion factors, well-to-wheel,
 *    average vehicle occupancy, kg CO₂e per passenger-km.
 *  - Energy: UK grid average electricity intensity and natural-gas combustion, kg CO₂e per kWh.
 *  - Food: peer-reviewed life-cycle assessments (cradle-to-retail), kg CO₂e per kg of product.
 *
 * Round everything to 2 dp so totals stay readable.
 */

const r2 = (n) => Math.round(n * 100) / 100;

/** kg CO₂e per km travelled (per passenger). */
export const TRAVEL_FACTORS = {
  walk: 0,
  bike: 0,
  ebike: 0.006,
  bus: 0.089,
  coach: 0.028,
  rail: 0.035,
  tram: 0.029,
  car_petrol: 0.171,
  car_diesel: 0.168,
  car_hybrid: 0.12,
  car_electric: 0.053,
  car_average: 0.149,
  motorbike: 0.114,
  taxi: 0.149,
  plane_domestic: 0.246,
  plane_short: 0.156,
  plane_long: 0.195,
};

/** kg CO₂e per kWh. */
export const ENERGY_FACTORS = {
  electricity_uk: 0.207,
  gas_uk: 0.182,
};

/** kg CO₂e per kg of food product (cradle-to-retail). */
export const FOOD_FACTORS = {
  beef: 27,
  lamb: 24,
  pork: 6.1,
  chicken: 5.7,
  turkey: 5.5,
  fish: 5.4,
  shellfish: 6,
  cheese: 13.5,
  butter: 12,
  milk: 1.3,
  yogurt: 1.5,
  cream: 3.9,
  eggs: 3,
  tofu: 2,
  beans: 0.8,
  lentils: 0.7,
  nuts: 0.3,
  rice: 2.7,
  pasta: 1.2,
  bread: 1.3,
  cereals: 1.2,
  vegetables: 0.4,
  fruit: 0.5,
  potatoes: 0.3,
  salad: 0.3,
  coffee: 8,
  tea: 0.2,
  juice: 0.8,
  wine: 1.5,
  beer: 0.8,
  snacks: 2.5,
  chocolate: 4.5,
  sweets: 1.5,
  ready_meals: 3.5,
  food_average: 2.5,
  unknown: 2.5,
};

/**
 * When we only know a price (from a receipt) and not a weight, we estimate an
 * implied mass. Rough UK basket average: ~£3.20 spent per kg of grocery food.
 */
export const SPEND_TO_MASS_KG_PER_GBP = 1 / 3.2;

/**
 * Very rough origin adjustment. Air-freighted imports carry a real premium;
 * most sea/road freight adds little next to production emissions. Honest and
 * conservative — the app is clear that exact origins can't be known.
 */
export const ORIGIN_MULTIPLIER = {
  uk: 0.95,
  imported: 1.15,
  unknown: 1,
};

/** Keyword → food key routing for free-text item names (receipts, barcodes). */
const CATEGORY_KEYWORDS = {
  meat: ['beef', 'lamb', 'pork', 'chicken', 'turkey', 'bacon', 'sausage', 'ham', 'mince', 'steak', 'burger'],
  fish: ['fish', 'salmon', 'tuna', 'cod', 'prawns', 'shrimp', 'seafood'],
  dairy: ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'eggs'],
  vegetables: ['vegetables', 'carrots', 'broccoli', 'peas', 'beans', 'onion', 'tomato', 'pepper', 'mushroom', 'spinach', 'lettuce'],
  fruit: ['fruit', 'apple', 'banana', 'orange', 'berries', 'grapes'],
  grains: ['bread', 'rice', 'pasta', 'cereal', 'flour', 'oats'],
  beverages: ['coffee', 'tea', 'juice', 'wine', 'beer', 'water', 'cola', 'drink'],
  snacks: ['crisps', 'chocolate', 'biscuits', 'sweets', 'candy', 'chips'],
};

export const FOOD_LABELS = {
  beef: 'Beef',
  lamb: 'Lamb',
  pork: 'Pork',
  chicken: 'Chicken / Poultry',
  turkey: 'Turkey',
  fish: 'Fish',
  shellfish: 'Shellfish',
  cheese: 'Cheese',
  butter: 'Butter',
  milk: 'Milk',
  yogurt: 'Yogurt',
  cream: 'Cream',
  eggs: 'Eggs',
  tofu: 'Tofu / Plant protein',
  beans: 'Beans / Pulses',
  lentils: 'Lentils',
  nuts: 'Nuts',
  rice: 'Rice',
  pasta: 'Pasta',
  bread: 'Bread / Baked goods',
  cereals: 'Cereals',
  vegetables: 'Vegetables',
  fruit: 'Fruit',
  potatoes: 'Potatoes',
  salad: 'Salad',
  coffee: 'Coffee',
  tea: 'Tea',
  juice: 'Juice / Soft drinks',
  wine: 'Wine',
  beer: 'Beer',
  snacks: 'Snacks',
  chocolate: 'Chocolate',
  sweets: 'Sweets',
  ready_meals: 'Ready meals',
  food_average: 'Food (average)',
  unknown: 'Unknown',
};

export const TRAVEL_MODES = [
  { value: 'walk', label: 'Walking', factor: 0, icon: 'footprints' },
  { value: 'bike', label: 'Cycling', factor: 0, icon: 'bike' },
  { value: 'ebike', label: 'E-bike / Scooter', factor: 0.006, icon: 'zap' },
  { value: 'bus', label: 'Bus', factor: 0.089, icon: 'bus' },
  { value: 'rail', label: 'Train', factor: 0.035, icon: 'train-front' },
  { value: 'tram', label: 'Tram', factor: 0.029, icon: 'tram-front' },
  { value: 'car_petrol', label: 'Car (Petrol)', factor: 0.171, icon: 'car' },
  { value: 'car_diesel', label: 'Car (Diesel)', factor: 0.168, icon: 'car' },
  { value: 'car_hybrid', label: 'Car (Hybrid)', factor: 0.12, icon: 'car' },
  { value: 'car_electric', label: 'Car (Electric)', factor: 0.053, icon: 'car' },
  { value: 'car_average', label: 'Car (Average)', factor: 0.149, icon: 'car' },
  { value: 'taxi', label: 'Taxi', factor: 0.149, icon: 'car' },
  { value: 'motorbike', label: 'Motorbike', factor: 0.114, icon: 'bike' },
];

/** kg CO₂e for a journey of `km` by `mode`. Unknown modes fall back to an average car. */
export function travelCo2e(mode, km) {
  const factor = TRAVEL_FACTORS[mode] ?? TRAVEL_FACTORS.car_average;
  return r2((Number(km) || 0) * factor);
}

/** kg CO₂e for electricity + gas use, in kWh. */
export function energyCo2e(electricityKwh = 0, gasKwh = 0) {
  const e = (Number(electricityKwh) || 0) * ENERGY_FACTORS.electricity_uk;
  const g = (Number(gasKwh) || 0) * ENERGY_FACTORS.gas_uk;
  return r2(e + g);
}

/** Rough kWh implied by money spent on energy, given a unit price (£/kWh). */
export function spendToKwh(gbp, pricePerKwh = 0.28) {
  if (!gbp || !pricePerKwh) return 0;
  return Math.round((Number(gbp) / pricePerKwh) * 10) / 10;
}

/** kg CO₂e for `kg` of a food identified by `key`. */
export function foodCo2e(key, kg = 1) {
  const factor = FOOD_FACTORS[key] ?? FOOD_FACTORS.unknown;
  return r2((Number(kg) || 0) * factor);
}

/** kg CO₂e implied by spending `gbp` on a food identified by `key`. */
export function foodCo2eFromSpend(key, gbp) {
  const kg = (Number(gbp) || 0) * SPEND_TO_MASS_KG_PER_GBP;
  return foodCo2e(key, kg);
}

/** Best-guess food key for a free-text product name. */
export function classifyFood(name) {
  const t = String(name || '').toLowerCase();
  for (const [group, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (!words.some((w) => t.includes(w))) continue;
    switch (group) {
      case 'meat':
        if (t.includes('beef') || t.includes('steak') || t.includes('mince')) return 'beef';
        if (t.includes('lamb')) return 'lamb';
        if (t.includes('pork') || t.includes('bacon') || t.includes('ham')) return 'pork';
        return 'chicken';
      case 'fish':
        return 'fish';
      case 'dairy':
        if (t.includes('milk')) return 'milk';
        if (t.includes('cheese')) return 'cheese';
        if (t.includes('butter')) return 'butter';
        if (t.includes('eggs')) return 'eggs';
        if (t.includes('yogurt')) return 'yogurt';
        return 'milk';
      case 'vegetables':
        return 'vegetables';
      case 'fruit':
        return 'fruit';
      case 'grains':
        if (t.includes('rice')) return 'rice';
        if (t.includes('pasta')) return 'pasta';
        return 'bread';
      case 'beverages':
        if (t.includes('coffee')) return 'coffee';
        if (t.includes('tea')) return 'tea';
        if (t.includes('wine')) return 'wine';
        if (t.includes('beer')) return 'beer';
        return 'juice';
      case 'snacks':
        if (t.includes('chocolate')) return 'chocolate';
        return 'snacks';
      default:
        return 'unknown';
    }
  }
  return 'unknown';
}

export function foodLabel(key) {
  return FOOD_LABELS[key] || key;
}

export function foodOptions() {
  return Object.keys(FOOD_FACTORS).map((value) => ({
    value,
    label: foodLabel(value),
    factor: FOOD_FACTORS[value],
  }));
}

/**
 * Context figure only — the average UK person's footprint is roughly
 * 12,700 kg CO₂e/year ≈ 244 kg/week across all consumption. We show a
 * conservative "trackable categories" slice as a weekly reference.
 */
export const UK_WEEKLY_REFERENCE_KG = 110;
