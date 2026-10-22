import { lazy, Suspense, useEffect, useState } from 'react';
import { StoreProvider } from '@/lib/store';
import PublicSite from '@/pages/PublicSite';

// The admin dashboard is a separate download: ordinary visitors never fetch it,
// which keeps the public site small and quick on slow connections.
const Admin = lazy(() => import('@/pages/admin/Admin'));

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHashRoute();
  const isAdmin = hash.startsWith('#/admin');

  useEffect(() => {
    document.title = isAdmin
      ? 'Admin — AdVibe Studio'
      : 'AdVibe Studio — AI Video Ads That Turn Attention Into Orders';
  }, [isAdmin]);

  return (
    <StoreProvider>
      {isAdmin ? (
        <Suspense fallback={<div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', color: '#888', font: '15px system-ui' }}>Loading admin…</div>}>
          <Admin />
        </Suspense>
      ) : (
        <PublicSite />
      )}
    </StoreProvider>
  );
}
