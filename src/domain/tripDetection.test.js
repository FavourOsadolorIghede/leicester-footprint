import { describe, it, expect } from 'vitest';
import { haversineKm, analyzeTrack, classifyTrip } from './tripDetection.js';

function track(startLat, startLng, headingKmh, count, gapSec = 15) {
  const pts = [];
  const t0 = Date.now();
  // move north; 1 deg lat ~= 111 km
  const stepDeg = (headingKmh * (gapSec / 3600)) / 111;
  for (let i = 0; i < count; i++) {
    pts.push({
      lat: startLat + stepDeg * i,
      lng: startLng,
      timestamp: t0 + i * gapSec * 1000,
      accuracy: 10,
    });
  }
  return pts;
}

describe('haversineKm', () => {
  it('is ~0 for identical points and positive for distinct ones', () => {
    expect(haversineKm(52.63, -1.13, 52.63, -1.13)).toBeCloseTo(0, 5);
    expect(haversineKm(52.63, -1.13, 52.64, -1.13)).toBeGreaterThan(1);
  });
});

describe('classifyTrip', () => {
  it('calls a slow steady track walking', () => {
    const m = analyzeTrack(track(52.63, -1.13, 5, 12));
    expect(classifyTrip(m).mode).toBe('walk');
  });

  it('calls a mid-speed track cycling', () => {
    const m = analyzeTrack(track(52.63, -1.13, 18, 12));
    expect(classifyTrip(m).mode).toBe('bike');
  });

  it('calls a fast track a vehicle', () => {
    const m = analyzeTrack(track(52.63, -1.13, 50, 12));
    expect(classifyTrip(m).mode).toBe('car_average');
  });

  it('is low confidence for a tiny track', () => {
    const m = analyzeTrack(track(52.63, -1.13, 5, 3));
    expect(classifyTrip(m).confidence).toBe('low');
  });
});
