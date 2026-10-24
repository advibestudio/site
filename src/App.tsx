import { lazy, Suspense, useEffect, useState } from 'react';
import { StoreProvider } from '@/lib/store';
import PublicSite from '@/pages/PublicSite';

// The admin dashboard is a separate download: ordinary visitors never fetch it,
// which keeps the public site small and quick on slow connections.
const Admin = lazy(() => import('@/pages/admin/Admin'));
// The "AI video ads: the full breakdown" page (#/ai-video) is also a separate download.
const AiVideoPage = lazy(() => import('@/pages/AiVideoPage'));

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
  const isCase = hash.startsWith('#/ai-video');

  useEffect(() => {
    if (isCase) return; // that page sets its own title
    document.title = isAdmin
      ? 'Admin — AdVibe Studio'
      : 'AdVibe Studio — AI Video Ads That Turn Attention Into Orders';
  }, [isAdmin, isCase]);

  return (
    <StoreProvider>
      {isAdmin ? (
        <Suspense fallback={<div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', color: '#888', font: '15px system-ui' }}>Loading admin…</div>}>
          <Admin />
        </Suspense>
      ) : isCase ? (
        <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#faf9f4' }} />}>
          <AiVideoPage />
        </Suspense>
      ) : (
        <PublicSite />
      )}
    </StoreProvider>
  );
}
