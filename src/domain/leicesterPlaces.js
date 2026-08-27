/**
 * A curated directory of Leicester places and services that help residents cut
 * carbon, waste and cost. Static data — no backend, no tracking.
 *
 * `theme` is one of: food | travel | energy | waste | community
 */

export const LEICESTER_PLACES = [
  {
    id: 'p1',
    name: 'Leicester Market',
    theme: 'food',
    address: 'Market Place, Leicester LE1 5HQ',
    url: 'https://www.leicestermarket.co.uk/',
    notes: 'Historic outdoor market with fresh local produce and far less packaging than supermarkets.',
    why: 'Local + seasonal produce cuts transport and packaging emissions.',
    tags: ['market', 'local', 'fresh', 'low-packaging'],
  },
  {
    id: 'p2',
    name: 'Cossington Street Market',
    theme: 'food',
    address: 'Cossington Street, Leicester',
    url: null,
    notes: 'Weekly market with local vendors and fresh produce.',
    why: 'Short supply chains and loose produce reduce waste.',
    tags: ['market', 'local', 'fresh'],
  },
  {
    id: 'p3',
    name: 'Organic Health',
    theme: 'food',
    address: '76 Queens Road, Leicester LE2 1TU',
    url: 'https://www.organic-health.co.uk/',
    notes: 'Organic and natural foods with bulk-buying options.',
    why: 'Buy the amount you need — less spoilage, less packaging.',
    tags: ['organic', 'bulk', 'health'],
  },
  {
    id: 'p4',
    name: 'Leicester Repair Café',
    theme: 'waste',
    address: 'Various locations in Leicester',
    url: 'https://repaircafe.org/',
    notes: 'Free community repair events for electronics, clothing, bikes and more. Check the schedule.',
    why: 'Repairing keeps embodied carbon in use and out of landfill.',
    tags: ['repair', 'free', 'community'],
  },
  {
    id: 'p5',
    name: 'The Bike Park',
    theme: 'waste',
    address: '78 Highcross Street, Leicester LE1 4NN',
    url: 'https://www.thebikepark.com/',
    notes: 'Bike repairs, refurbished bikes and cycling accessories.',
    why: 'A working bike replaces short car trips — the biggest personal win.',
    tags: ['repair', 'bikes', 'refurbished'],
  },
  {
    id: 'p6',
    name: 'Wild Things',
    theme: 'waste',
    address: '4–6 St Martins Walk, Leicester LE1 5DG',
    url: null,
    notes: 'Refill station for cleaning products and toiletries — bring your own containers.',
    why: 'Refilling avoids single-use plastic bottles entirely.',
    tags: ['refill', 'zero-waste', 'cleaning'],
  },
  {
    id: 'p7',
    name: 'The Leicester Eco Shop',
    theme: 'waste',
    address: 'Online & pop-ups',
    url: null,
    notes: 'Eco-friendly products, refill options and sustainable alternatives.',
    why: 'Swaps for everyday disposables add up over a year.',
    tags: ['refill', 'eco', 'sustainable'],
  },
  {
    id: 'p8',
    name: 'British Heart Foundation Furniture & Electrical',
    theme: 'waste',
    address: '35 Rutland Street, Leicester LE1 1RE',
    url: 'https://www.bhf.org.uk/',
    notes: 'Quality second-hand furniture and tested electrical items.',
    why: 'Second-hand furniture avoids the carbon of manufacturing new.',
    tags: ['second-hand', 'furniture', 'charity'],
  },
  {
    id: 'p9',
    name: 'LOROS Charity Shop',
    theme: 'waste',
    address: 'Multiple locations in Leicester',
    url: 'https://www.loros.co.uk/',
    notes: 'Second-hand clothes, books and household items. Supports the local hospice.',
    why: 'Reusing clothing dramatically undercuts new-textile emissions.',
    tags: ['second-hand', 'clothes', 'charity'],
  },
  {
    id: 'p10',
    name: 'Age UK Leicester Shire & Rutland',
    theme: 'waste',
    address: 'Various shops in Leicester',
    url: 'https://www.ageuk.org.uk/',
    notes: 'Second-hand goods, furniture and electrical items.',
    why: 'Keeps usable goods circulating locally.',
    tags: ['second-hand', 'charity', 'furniture'],
  },
  {
    id: 'p11',
    name: 'Santander Cycles Leicester',
    theme: 'travel',
    address: 'Various docking stations',
    url: 'https://www.santandercycles.co.uk/',
    notes: 'Bike-hire scheme with stations across the city centre.',
    why: 'Near-zero-carbon travel for trips under ~5 km.',
    tags: ['bikes', 'hire', 'cycle'],
  },
  {
    id: 'p12',
    name: 'Arriva Bus Leicester',
    theme: 'travel',
    address: 'Across Leicester and Leicestershire',
    url: 'https://www.arrivabus.co.uk/',
    notes: 'Local bus services. Day tickets are often cheaper than driving and parking.',
    why: 'A full bus emits roughly half the CO₂e per passenger of an average car.',
    tags: ['bus', 'public-transport'],
  },
  {
    id: 'p13',
    name: 'Leicester Railway Station',
    theme: 'travel',
    address: 'London Road, Leicester LE2 0QB',
    url: 'https://www.nationalrail.co.uk/',
    notes: 'Rail connections to London, Birmingham, Nottingham and more.',
    why: 'Rail is ~4–5× lower carbon than the equivalent car journey.',
    tags: ['train', 'rail', 'public-transport'],
  },
  {
    id: 'p14',
    name: 'Leicester City Council Energy Advice',
    theme: 'energy',
    address: 'Council offices',
    url: 'https://www.leicester.gov.uk/',
    notes: 'Free energy-efficiency advice and grants for Leicester residents.',
    why: 'Insulation and heating grants cut both bills and emissions.',
    tags: ['advice', 'grants', 'efficiency'],
  },
  {
    id: 'p15',
    name: 'Warm Homes Leicester',
    theme: 'energy',
    address: 'Helpline service',
    url: null,
    notes: 'Support with heating bills, insulation grants and energy advice.',
    why: 'Targeted help for households most affected by energy costs.',
    tags: ['advice', 'support', 'heating'],
  },
  {
    id: 'p16',
    name: 'Transition Leicester',
    theme: 'community',
    address: 'Community hub',
    url: null,
    notes: 'Community group for sustainable-living initiatives and events.',
    why: 'Local action and shared resources multiply individual effort.',
    tags: ['community', 'events', 'sustainable'],
  },
  {
    id: 'p17',
    name: 'Leicester Sustainability Forum',
    theme: 'community',
    address: 'Various venues',
    url: null,
    notes: 'Network of local sustainability groups and initiatives.',
    why: 'Find the group already working on what you care about.',
    tags: ['community', 'network', 'forum'],
  },
  {
    id: 'p18',
    name: 'Environ',
    theme: 'community',
    address: 'Leicester city centre',
    url: 'https://www.environleicester.org.uk/',
    notes: 'Environmental charity with education programmes and community gardens.',
    why: 'Hands-on greening projects across the city.',
    tags: ['charity', 'education', 'gardens'],
  },
  {
    id: 'p19',
    name: "Bobby's Restaurant",
    theme: 'food',
    address: '154–156 Belgrave Road, Leicester LE4 5AT',
    url: null,
    notes: 'Vegetarian Indian restaurant — plant-based options with a lower footprint.',
    why: 'Plant-based meals are typically 4–8× lower carbon than meat dishes.',
    tags: ['vegetarian', 'restaurant', 'plant-based'],
  },
  {
    id: 'p20',
    name: 'The Exchange',
    theme: 'food',
    address: '50 Rutland Street, Leicester LE1 1RD',
    url: null,
    notes: 'Café with vegan options and a sustainable-sourcing focus.',
    why: 'Lower-carbon menu choices in the city centre.',
    tags: ['cafe', 'vegan', 'sustainable'],
  },
];

export const PLACE_THEMES = [
  { value: 'all', label: 'All', icon: 'layout-grid' },
  { value: 'food', label: 'Food', icon: 'utensils' },
  { value: 'travel', label: 'Travel', icon: 'route' },
  { value: 'energy', label: 'Energy', icon: 'zap' },
  { value: 'waste', label: 'Waste & Stuff', icon: 'recycle' },
  { value: 'community', label: 'Community', icon: 'users' },
];

export const THEME_BADGE = {
  food: 'bg-cat-food/15 text-cat-food border-cat-food/30',
  travel: 'bg-cat-travel/15 text-cat-travel border-cat-travel/30',
  energy: 'bg-cat-energy/15 text-cat-energy border-cat-energy/30',
  waste: 'bg-cat-waste/15 text-cat-waste border-cat-waste/30',
  community: 'bg-cat-community/15 text-cat-community border-cat-community/30',
};

export function filterPlacesByTheme(theme) {
  if (!theme || theme === 'all') return LEICESTER_PLACES;
  return LEICESTER_PLACES.filter((p) => p.theme === theme);
}

export function searchPlaces(query) {
  const t = String(query || '').toLowerCase().trim();
  if (!t) return LEICESTER_PLACES;
  return LEICESTER_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(t) ||
      p.notes?.toLowerCase().includes(t) ||
      p.why?.toLowerCase().includes(t) ||
      p.tags?.some((tag) => tag.toLowerCase().includes(t))
  );
}
