import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/lib/theme.jsx';
import { Button } from './ui/button.jsx';

const ICON = { light: Sun, dark: Moon, system: Monitor };
const NEXT = { light: 'dark', dark: 'system', system: 'light' };

export function ThemeToggle({ className }) {
  const { theme, cycle } = useTheme();
  const Icon = ICON[theme] || Monitor;
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      className={className}
      aria-label={`Theme: ${theme}. Switch to ${NEXT[theme]}.`}
      title={`Theme: ${theme}`}
    >
      <Icon className="size-5" />
    </Button>
  );
}
