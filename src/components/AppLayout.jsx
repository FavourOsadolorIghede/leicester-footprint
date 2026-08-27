import { NavLink, Outlet, Link } from 'react-router-dom';
import { Leaf, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils.js';
import { NAV_ITEMS, BOTTOM_NAV } from './nav.js';
import { ThemeToggle } from './ThemeToggle.jsx';
import { useZoomLock } from '@/lib/hooks.js';

function NavItem({ item, onClick }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        )
      }
    >
      <Icon className="size-[18px] shrink-0" />
      {item.label}
    </NavLink>
  );
}

function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-card/50 lg:flex">
      <Link to="/" className="flex items-center gap-2 px-5 py-5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Leaf className="size-[18px]" />
        </span>
        <span className="font-semibold">Leicester Footprint</span>
      </Link>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}
      </nav>
      <div className="space-y-3 border-t p-4">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Data stays on this device
        </p>
        <ThemeToggle />
      </div>
    </aside>
  );
}

function BottomTabs() {
  return (
    <nav className="safe-b fixed inset-x-0 bottom-0 z-40 flex border-t bg-card/95 backdrop-blur lg:hidden">
      {BOTTOM_NAV.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            <Icon className="size-5" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function AppLayout() {
  useZoomLock();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="safe-t sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Leaf className="size-4" />
            </span>
            <span className="text-sm font-semibold">Leicester Footprint</span>
          </Link>
          <ThemeToggle />
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-10">
          <Outlet />
        </main>
        <BottomTabs />
      </div>
    </div>
  );
}
