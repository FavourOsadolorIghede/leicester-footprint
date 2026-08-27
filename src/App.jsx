import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useTheme } from './lib/theme.jsx';
import { AppLayout } from './components/AppLayout.jsx';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';

const Track = lazy(() => import('./pages/Track.jsx'));
const Receipts = lazy(() => import('./pages/Receipts.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const Leicester = lazy(() => import('./pages/Leicester.jsx'));
const Groups = lazy(() => import('./pages/Groups.jsx'));
const Learn = lazy(() => import('./pages/Learn.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function App() {
  const { isDark } = useTheme();
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="track" element={<Track />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="products" element={<Products />} />
            <Route path="leicester" element={<Leicester />} />
            <Route path="groups" element={<Groups />} />
            <Route path="learn" element={<Learn />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster position="top-center" richColors theme={isDark ? 'dark' : 'light'} />
    </>
  );
}
