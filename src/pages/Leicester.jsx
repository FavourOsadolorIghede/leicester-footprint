import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Search,
  ExternalLink,
  MapPin,
  Utensils,
  Route,
  Zap,
  Recycle,
  Users,
  LayoutGrid,
  Plus,
} from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/common.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input, Textarea } from '@/components/ui/primitives.jsx';
import { Dialog } from '@/components/ui/dialog.jsx';
import { cn } from '@/lib/utils.js';
import {
  LEICESTER_PLACES,
  PLACE_THEMES,
  THEME_BADGE,
  filterPlacesByTheme,
  searchPlaces,
} from '@/domain/leicesterPlaces.js';
import { placeSuggestions } from '@/lib/db.js';

const THEME_ICON = {
  all: LayoutGrid,
  food: Utensils,
  travel: Route,
  energy: Zap,
  waste: Recycle,
  community: Users,
};

export default function Leicester() {
  const [theme, setTheme] = useState('all');
  const [query, setQuery] = useState('');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestion, setSuggestion] = useState({ name: '', theme: 'food', notes: '' });

  const places = useMemo(() => {
    const base = query.trim() ? searchPlaces(query) : filterPlacesByTheme(theme);
    return base;
  }, [theme, query]);

  async function submitSuggestion(e) {
    e.preventDefault();
    if (!suggestion.name.trim()) return toast.error('Add a place name');
    await placeSuggestions.add(suggestion);
    toast.success('Thanks! Saved on your device — share it with the project any time.');
    setSuggestion({ name: '', theme: 'food', notes: '' });
    setSuggestOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leicester options"
        subtitle={`${LEICESTER_PLACES.length} local places that cut carbon, waste and cost`}
        action={
          <Button variant="outline" size="sm" onClick={() => setSuggestOpen(true)}>
            <Plus className="size-4" /> Suggest a place
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, tag or benefit"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PLACE_THEMES.map((t) => {
          const Icon = THEME_ICON[t.value];
          const active = theme === t.value && !query;
          return (
            <button
              key={t.value}
              onClick={() => {
                setQuery('');
                setTheme(t.value);
              }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                active ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent'
              )}
            >
              <Icon className="size-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {places.length === 0 ? (
        <EmptyState icon={MapPin} title="Nothing matches" description="Try a different search term or category." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((p) => {
            const Icon = THEME_ICON[p.theme] || MapPin;
            return (
              <Card key={p.id} className="flex h-full flex-col">
                <CardContent className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize', THEME_BADGE[p.theme])}>
                      <Icon className="size-3" />
                      {p.theme}
                    </span>
                  </div>
                  <h3 className="mt-2 font-semibold">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.address}</p>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.notes}</p>
                  {p.why && (
                    <p className="mt-2 rounded-lg bg-muted p-2 text-xs">
                      <span className="font-medium">Why it helps: </span>
                      {p.why}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.tags?.map((tag) => (
                      <span key={tag} className="rounded bg-secondary px-1.5 py-0.5 text-[11px] text-secondary-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Visit website <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={suggestOpen} onClose={() => setSuggestOpen(false)} title="Suggest a Leicester place">
        <form onSubmit={submitSuggestion} className="space-y-3">
          <Input
            value={suggestion.name}
            onChange={(e) => setSuggestion({ ...suggestion, name: e.target.value })}
            placeholder="Place name"
          />
          <select
            value={suggestion.theme}
            onChange={(e) => setSuggestion({ ...suggestion, theme: e.target.value })}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            {PLACE_THEMES.filter((t) => t.value !== 'all').map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <Textarea
            value={suggestion.notes}
            onChange={(e) => setSuggestion({ ...suggestion, notes: e.target.value })}
            placeholder="Why is it a greener choice?"
          />
          <p className="text-xs text-muted-foreground">
            Suggestions are stored only on your device. There is no server to send them to.
          </p>
          <Button type="submit" className="w-full">Save suggestion</Button>
        </form>
      </Dialog>
    </div>
  );
}
