import { PageHeader } from '@/components/common.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import {
  TRAVEL_FACTORS,
  ENERGY_FACTORS,
  FOOD_FACTORS,
  foodLabel,
} from '@/domain/emissionFactors.js';

const TRAVEL_ROWS = Object.entries(TRAVEL_FACTORS);
const FOOD_ROWS = Object.entries(FOOD_FACTORS).filter(([k]) => !['food_average', 'unknown'].includes(k));

export default function Learn() {
  return (
    <div className="space-y-6">
      <PageHeader title="How we estimate" subtitle="The methodology and factors behind every number" />

      <Card>
        <CardHeader><CardTitle className="text-base">Method</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Leicester Footprint uses an <strong>attributional</strong> approach: each activity you log
            is multiplied by a published average emission factor to give kilograms of CO₂-equivalent
            (kg CO₂e). It follows the spirit of ISO 14040/14044 lifecycle assessment but is a
            proof-of-concept, not a certified inventory.
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li><strong>Travel:</strong> distance (km) × per-passenger-km factor (well-to-wheel, average occupancy).</li>
            <li><strong>Energy:</strong> electricity kWh × UK grid intensity + gas kWh × combustion factor.</li>
            <li><strong>Food:</strong> mass (kg) × cradle-to-retail lifecycle factor. Where only a price is known, mass is implied at ~£3.20/kg.</li>
          </ul>
          <p>
            Figures are rounded to 0.01 kg. Origin and exact supply chains cannot be derived from a
            receipt or barcode, so imported/UK is a coarse ±15% adjustment at most.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Travel — kg CO₂e / km</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                {TRAVEL_ROWS.map(([k, v]) => (
                  <tr key={k} className="border-b last:border-0">
                    <td className="py-1.5 capitalize">{k.replace(/_/g, ' ')}</td>
                    <td className="py-1.5 text-right tabular-nums">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Energy — kg CO₂e / kWh</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="py-1.5">Electricity (UK grid average)</td>
                  <td className="py-1.5 text-right tabular-nums">{ENERGY_FACTORS.electricity_uk}</td>
                </tr>
                <tr>
                  <td className="py-1.5">Natural gas</td>
                  <td className="py-1.5 text-right tabular-nums">{ENERGY_FACTORS.gas_uk}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Food — kg CO₂e / kg of product</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
            {FOOD_ROWS.map(([k, v]) => (
              <div key={k} className="flex justify-between border-b py-1.5">
                <span>{foodLabel(k)}</span>
                <span className="tabular-nums">{v}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Sources</CardTitle></CardHeader>
        <CardContent className="space-y-1.5 text-sm text-muted-foreground">
          <p>UK Government GHG conversion factors for company reporting (DESNZ/DEFRA).</p>
          <p>UK electricity generation carbon intensity (National Grid ESO / DESNZ).</p>
          <p>Food figures adapted from Poore &amp; Nemecek (2018) and related retail LCA datasets.</p>
          <p>Product data: Open Food Facts (openfoodfacts.org), ODbL.</p>
        </CardContent>
      </Card>
    </div>
  );
}
