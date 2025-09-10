'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    location.reload();
  }

  return (
    <header className="sticky top-0 z-50 bg-gray-100 border-b">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" className="font-semibold">
          Select Immo CI
        </Link>

        {/* Catégories (barre grise) */}
        <nav className="hidden sm:flex gap-4 text-gray-700">
          <Link href="/">Accueil</Link>
          <Link href="/publier">Publier</Link>
          {/* Ajoute d’autres catégories si besoin */}
        </nav>

        {/* Auth à droite */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-gray-700">Bonjour</span>
              <button
                onClick={handleSignOut}
                className="text-sm rounded-lg border px-3 py-1 bg-white hover:bg-gray-50"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm rounded-lg border px-3 py-1 bg-white hover:bg-gray-50"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
