import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Download, Upload, Trash2, User, Target, ShieldCheck, Database } from 'lucide-react';
import { PageHeader } from '@/components/common.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label, Slider } from '@/components/ui/primitives.jsx';
import { Dialog } from '@/components/ui/dialog.jsx';
import { useSettings } from '@/lib/hooks.js';
import { exportAll, importAll, wipeEverything } from '@/lib/db.js';

function Section({ icon: Icon, title, children }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-muted-foreground" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export default function Settings() {
  const [settings, update] = useSettings();
  const [wipeOpen, setWipeOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const importRef = useRef(null);

  async function doExport() {
    const data = await exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leicester-footprint-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  }

  async function doImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      await importAll(payload, { merge: true });
      toast.success('Data imported and merged');
    } catch (err) {
      toast.error(err.message || 'Could not import that file');
    } finally {
      if (importRef.current) importRef.current.value = '';
    }
  }

  async function doWipe() {
    if (confirmText !== 'CLEAR') return;
    await wipeEverything();
    setWipeOpen(false);
    setConfirmText('');
    toast.success('All data cleared');
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Your profile, targets and data — all stored on this device" />

      <Section icon={User} title="Profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" value={settings.displayName} onChange={(e) => update({ displayName: e.target.value })} placeholder="Optional" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pc">Postcode prefix</Label>
            <Input id="pc" value={settings.postcodePrefix} onChange={(e) => update({ postcodePrefix: e.target.value.toUpperCase() })} placeholder="LE1" />
          </div>
        </div>
      </Section>

      <Section icon={Target} title="Tracking">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Weekly target</Label>
            <span className="text-sm font-medium">{settings.weeklyTargetKg} kg CO₂e</span>
          </div>
          <Slider
            min={20}
            max={200}
            step={5}
            value={settings.weeklyTargetKg}
            onChange={(e) => update({ weeklyTargetKg: Number(e.target.value) })}
          />
          <p className="text-xs text-muted-foreground">
            Context: the average UK person's total footprint is roughly 240 kg CO₂e/week across all
            consumption. This target covers only what the app tracks.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Electricity price (£/kWh)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={settings.electricityPricePerKwh}
            onChange={(e) => update({ electricityPricePerKwh: Number(e.target.value) })}
          />
          <p className="text-xs text-muted-foreground">Used to estimate kWh when you only know the £ spent.</p>
        </div>
      </Section>

      <Section icon={ShieldCheck} title="Privacy &amp; data">
        <p className="text-sm text-muted-foreground">
          Leicester Footprint has no backend. Everything you log lives in this browser's storage on
          this device. Nothing is uploaded, and clearing your browser data erases it. Receipt OCR and
          barcode processing run locally; only the Open Food Facts lookup makes a network request, and
          only when you search a barcode.
        </p>
      </Section>

      <Section icon={Database} title="Export &amp; import">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={doExport}>
            <Download className="size-4" /> Export data (JSON)
          </Button>
          <Button variant="outline" onClick={() => importRef.current?.click()}>
            <Upload className="size-4" /> Import data
          </Button>
          <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={doImport} />
        </div>
      </Section>

      <Section icon={Trash2} title="Danger zone">
        <p className="text-sm text-muted-foreground">
          Permanently delete every journey, reading, receipt, product and group on this device.
        </p>
        <Button variant="destructive" onClick={() => setWipeOpen(true)}>
          <Trash2 className="size-4" /> Clear all data
        </Button>
      </Section>

      <Dialog open={wipeOpen} onClose={() => setWipeOpen(false)} title="Clear all data?" description="This cannot be undone. Type CLEAR to confirm.">
        <div className="space-y-3">
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Type CLEAR" />
          <div className="flex gap-2">
            <Button variant="destructive" onClick={doWipe} disabled={confirmText !== 'CLEAR'} className="flex-1">
              Delete everything
            </Button>
            <Button variant="outline" onClick={() => setWipeOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
