import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Leaf className="size-6" />
      </span>
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="max-w-sm text-muted-foreground">
        That route doesn't exist. Head back to your dashboard.
      </p>
      <Button asChild>
        <Link to="/app">Go to dashboard</Link>
      </Button>
    </div>
  );
}
