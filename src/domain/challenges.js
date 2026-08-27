/** Fixed set of weekly green challenges. Points reflect effort/impact, not exact CO₂e. */
export const CHALLENGES = [
  { id: 'c1', title: 'Car-free day', points: 20, category: 'travel' },
  { id: 'c2', title: 'Walk or cycle a trip under 2 km', points: 10, category: 'travel' },
  { id: 'c3', title: 'Meat-free day', points: 15, category: 'food' },
  { id: 'c4', title: 'Shop at a local market', points: 10, category: 'food' },
  { id: 'c5', title: 'Refill instead of buying new packaging', points: 10, category: 'waste' },
  { id: 'c6', title: 'Repair something instead of replacing it', points: 25, category: 'waste' },
  { id: 'c7', title: 'Lower the thermostat by 1°C for a day', points: 10, category: 'energy' },
  { id: 'c8', title: 'Run appliances only on full loads', points: 5, category: 'energy' },
];

export const challengeById = (id) => CHALLENGES.find((c) => c.id === id);
