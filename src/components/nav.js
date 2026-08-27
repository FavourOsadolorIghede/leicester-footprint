import {
  LayoutDashboard,
  Route,
  ReceiptText,
  ScanBarcode,
  MapPin,
  Users,
  Settings,
  BookOpen,
} from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/track', label: 'Track', icon: Route },
  { to: '/app/receipts', label: 'Receipts', icon: ReceiptText },
  { to: '/app/products', label: 'Products', icon: ScanBarcode },
  { to: '/app/leicester', label: 'Leicester', icon: MapPin },
  { to: '/app/groups', label: 'Groups', icon: Users },
  { to: '/app/learn', label: 'Learn', icon: BookOpen },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

// A trimmed set for the mobile bottom bar.
export const BOTTOM_NAV = ['/app', '/app/track', '/app/receipts', '/app/leicester'].map((to) =>
  NAV_ITEMS.find((i) => i.to === to)
);
