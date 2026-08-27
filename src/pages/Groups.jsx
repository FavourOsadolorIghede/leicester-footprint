import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Users, Plus, Trophy, Copy, Trash2, Check } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/common.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input, Select, Badge } from '@/components/ui/primitives.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.jsx';
import { Dialog } from '@/components/ui/dialog.jsx';
import { useCollection } from '@/lib/hooks.js';
import { groups, challengeCompletions } from '@/lib/db.js';
import { joinCode } from '@/lib/utils.js';
import { CHALLENGES, challengeById } from '@/domain/challenges.js';
import { isToday, isThisWeek } from 'date-fns';

export default function Groups() {
  const { rows: allGroups } = useCollection(groups, 'groups');
  const { rows: completions } = useCollection(challengeCompletions, 'challengeCompletions');
  const [tab, setTab] = useState('groups');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'household', members: '' });
  const [activeGroup, setActiveGroup] = useState('');
  const [challenge, setChallenge] = useState(CHALLENGES[0].id);
  const [member, setMember] = useState('');

  const currentGroup = allGroups.find((g) => g.id === activeGroup) || allGroups[0];

  const leaderboard = useMemo(() => {
    if (!currentGroup) return [];
    const scores = new Map(currentGroup.members.map((m) => [m, 0]));
    for (const c of completions) {
      if (c.groupId !== currentGroup.id) continue;
      scores.set(c.member, (scores.get(c.member) || 0) + (c.points || 0));
    }
    return [...scores.entries()]
      .map(([name, points]) => ({ name, points }))
      .sort((a, b) => b.points - a.points);
  }, [currentGroup, completions]);

  async function createGroup(e) {
    e.preventDefault();
    const members = form.members.split(',').map((m) => m.trim()).filter(Boolean);
    if (!form.name.trim() || members.length === 0) return toast.error('Add a name and at least one member');
    await groups.add({ name: form.name, type: form.type, members, code: joinCode() });
    toast.success('Group created');
    setForm({ name: '', type: 'household', members: '' });
    setCreateOpen(false);
  }

  async function logCompletion(e) {
    e.preventDefault();
    if (!currentGroup || !member) return toast.error('Pick a member');
    const ch = challengeById(challenge);
    await challengeCompletions.add({
      groupId: currentGroup.id,
      member,
      challengeId: ch.id,
      title: ch.title,
      points: ch.points,
    });
    toast.success(`+${ch.points} points for ${member}`);
    setMember('');
  }

  const recent = completions
    .filter((c) => currentGroup && c.groupId === currentGroup.id)
    .slice(0, 6);

  const doneToday = recent.filter((c) => isToday(new Date(c.createdAt))).length;
  const doneWeek = completions.filter(
    (c) => currentGroup && c.groupId === currentGroup.id && isThisWeek(new Date(c.createdAt), { weekStartsOn: 1 })
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Groups & challenges"
        subtitle="Friendly competition with your household, workplace or society — all on-device"
        action={
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New group
          </Button>
        }
      />

      {allGroups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No groups yet"
          description="Create a group, add members by name, and log weekly green challenges to build a leaderboard."
        >
          <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">
            <Plus className="size-4" /> Create your first group
          </Button>
        </EmptyState>
      ) : (
        <>
          {allGroups.length > 1 && (
            <Select value={currentGroup?.id} onChange={(e) => setActiveGroup(e.target.value)} className="sm:w-64">
              {allGroups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </Select>
          )}

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="groups"><Users className="size-4" /> Group</TabsTrigger>
              <TabsTrigger value="challenges"><Trophy className="size-4" /> Challenges</TabsTrigger>
            </TabsList>

            <TabsContent value="groups" className="space-y-4">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base">{currentGroup.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">{currentGroup.type}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard?.writeText(currentGroup.code);
                        toast.success('Join code copied');
                      }}
                    >
                      <Copy className="size-3.5" /> {currentGroup.code}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {currentGroup.members.length} members · {doneWeek} challenges completed this week
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {currentGroup.members.map((m) => (
                      <span key={m} className="rounded-full bg-secondary px-2.5 py-1 text-sm">{m}</span>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-destructive"
                    onClick={() => groups.remove(currentGroup.id).then(() => { setActiveGroup(''); toast('Group deleted'); })}
                  >
                    <Trash2 className="size-4" /> Delete group
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Leaderboard</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {leaderboard.map((row, i) => (
                    <div key={row.name} className="flex items-center justify-between rounded-lg border p-2.5">
                      <span className="flex items-center gap-3">
                        <span className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-cat-energy/20 text-cat-energy' : 'bg-secondary'}`}>
                          {i + 1}
                        </span>
                        {row.name}
                      </span>
                      <span className="font-semibold tabular-nums">{row.points} pts</span>
                    </div>
                  ))}
                  <p className="pt-1 text-xs text-muted-foreground">
                    Points reflect engagement and effort, not exact CO₂e.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="challenges" className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Log a completion</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={logCompletion} className="grid gap-3 sm:grid-cols-3">
                    <Select value={member} onChange={(e) => setMember(e.target.value)}>
                      <option value="">Who?</option>
                      {currentGroup.members.map((m) => <option key={m} value={m}>{m}</option>)}
                    </Select>
                    <Select value={challenge} onChange={(e) => setChallenge(e.target.value)}>
                      {CHALLENGES.map((c) => <option key={c.id} value={c.id}>{c.title} (+{c.points})</option>)}
                    </Select>
                    <Button type="submit"><Check className="size-4" /> Log it</Button>
                  </form>
                  {doneToday > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">{doneToday} completed today</p>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-3 sm:grid-cols-2">
                {CHALLENGES.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                    <span>{c.title}</span>
                    <Badge variant="warning">+{c.points}</Badge>
                  </div>
                ))}
              </div>

              {recent.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Recent activity</CardTitle></CardHeader>
                  <CardContent className="space-y-1.5 text-sm">
                    {recent.map((c) => (
                      <p key={c.id} className="text-muted-foreground">
                        <span className="font-medium text-foreground">{c.member}</span> · {c.title} (+{c.points})
                      </p>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Create a group">
        <form onSubmit={createGroup} className="space-y-3">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Group name" />
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="household">Household</option>
            <option value="workplace">Workplace</option>
            <option value="society">Society / club</option>
          </Select>
          <Input value={form.members} onChange={(e) => setForm({ ...form, members: e.target.value })} placeholder="Members, comma separated (e.g. Sam, Alex, Jo)" />
          <Button type="submit" className="w-full">Create group</Button>
        </form>
      </Dialog>
    </div>
  );
}
