import { useEffect, useState } from 'react';
import { StoreProvider } from '@/lib/store';
import PublicSite from '@/pages/PublicSite';
import Admin from '@/pages/admin/Admin';

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
      {isAdmin ? <Admin /> : <PublicSite />}
    </StoreProvider>
  );
}
