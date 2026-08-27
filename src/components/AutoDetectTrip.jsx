import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Play, Square, Navigation, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { ConfidenceBadge } from './common.jsx';
import { journeys } from '@/lib/db.js';
import { kg } from '@/lib/format.js';
import { travelCo2e, TRAVEL_MODES } from '@/domain/emissionFactors.js';
import { analyzeTrack, classifyTrip, watchTrip, stopWatch } from '@/domain/tripDetection.js';

const MODE_CHOICES = [
  { value: 'walk', label: 'Walking' },
  { value: 'bike', label: 'Cycling' },
  { value: 'car_average', label: 'Vehicle' },
];

export function AutoDetectTrip() {
  const [tracking, setTracking] = useState(false);
  const [points, setPoints] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [chosenMode, setChosenMode] = useState('walk');
  const [error, setError] = useState(null);
  const watchId = useRef(null);
  const startedAt = useRef(0);

  useEffect(() => {
    if (!tracking) return undefined;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [tracking]);

  function start() {
    setError(null);
    setResult(null);
    setPoints([]);
    setElapsed(0);
    startedAt.current = Date.now();
    watchId.current = watchTrip(
      (p) => setPoints((prev) => [...prev, p]),
      (err) => {
        setError(
          err.code === 1
            ? 'Location permission denied. Enable location access to auto-detect trips.'
            : 'Could not get your location. Try again outdoors.'
        );
        stop(true);
      }
    );
    if (watchId.current != null) setTracking(true);
  }

  function stop(silent) {
    stopWatch(watchId.current);
    watchId.current = null;
    setTracking(false);
    if (silent) return;
    setPoints((pts) => {
      const metrics = analyzeTrack(pts);
      const { mode, confidence } = classifyTrip(metrics);
      setResult({ metrics, mode, confidence });
      setChosenMode(mode === 'unknown' ? 'walk' : mode);
      return pts;
    });
  }

  async function save() {
    const km = Math.round(result.metrics.distance * 100) / 100;
    const co2eKg = travelCo2e(chosenMode, km);
    await journeys.add({
      mode: chosenMode,
      modeLabel: TRAVEL_MODES.find((m) => m.value === chosenMode)?.label,
      distanceKm: km,
      co2eKg,
      source: 'auto',
      detectedMode: result.mode,
      confidence: result.confidence,
      durationSec: Math.round(result.metrics.duration),
    });
    setResult(null);
    toast.success(`Trip saved · ${km} km · ${kg(co2eKg)} CO₂e`);
  }

  const liveDistance = analyzeTrack(points).distance;

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Navigation className="size-4 text-primary" /> Auto-detect a trip
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="rounded-lg bg-destructive/10 p-2.5 text-sm text-destructive">{error}</p>
        )}

        {!result && (
          <>
            {tracking ? (
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {String(Math.floor(elapsed / 60)).padStart(2, '0')}:
                    {String(elapsed % 60).padStart(2, '0')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {liveDistance.toFixed(2)} km · {points.length} points
                  </p>
                </div>
                <Button variant="destructive" onClick={() => stop(false)}>
                  <Square className="size-4" /> Stop trip
                </Button>
              </div>
            ) : (
              <Button onClick={start} className="w-full">
                <Play className="size-4" /> Start trip
              </Button>
            )}
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              Location is used only while a trip is running and stored on this device.
            </p>
          </>
        )}

        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg bg-muted p-2">
                <p className="font-semibold">{result.metrics.distance.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">km</p>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <p className="font-semibold">{Math.round(result.metrics.duration / 60)}</p>
                <p className="text-xs text-muted-foreground">min</p>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <p className="font-semibold">{result.metrics.avgSpeed.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">km/h avg</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              Detected: <strong className="capitalize">{result.mode.replace('_average', '')}</strong>
              <ConfidenceBadge level={result.confidence} />
            </div>

            <div className="flex gap-2">
              {MODE_CHOICES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setChosenMode(m.value)}
                  className={`flex-1 rounded-lg border p-2 text-sm font-medium ${
                    chosenMode === m.value ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={save} className="flex-1">Save trip</Button>
              <Button variant="outline" onClick={() => setResult(null)}>Discard</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
