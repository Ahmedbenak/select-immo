'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Header() {
  const [user, setUser] = useState(null);

  // 👉 Remplace par ton vrai compte
  const INSTAGRAM_URL = 'https://www.instagram.com/select_immo_ci/';

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
        {/* Groupe gauche : Titre + icône Instagram */}
        <div className="flex items-center gap-2">
          <Link href="/" className="font-semibold">
            Select Immo CI
          </Link>

          {/* Icône Instagram colorée (gradient), cliquable */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ouvrir Instagram"
            title="Instagram"
            className="inline-flex h-5 w-5 items-center justify-center hover:opacity-90 active:scale-95 transition"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="igGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f58529"/>
                  <stop offset="25%" stopColor="#feda77"/>
                  <stop offset="50%" stopColor="#dd2a7b"/>
                  <stop offset="75%" stopColor="#8134af"/>
                  <stop offset="100%" stopColor="#515bd4"/>
                </linearGradient>
              </defs>
              {/* Fond arrondi en dégradé */}
              <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#igGradient)"/>
              {/* Caméra blanche */}
              <path fill="#fff" d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm0 5.2a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4z"/>
              <circle cx="17.3" cy="6.7" r="1.1" fill="#fff"/>
              <rect x="6.2" y="6.2" width="11.6" height="11.6" rx="3.2" ry="3.2" fill="none" stroke="#fff" strokeWidth="1.3"/>
            </svg>
          </a>
        </div>

        {/* Catégories (centre) */}
        <nav className="hidden sm:flex gap-4 text-gray-700">
          <Link href="/">Accueil</Link>
          <Link href="/publier">Publier</Link>
        </nav>

        {/* Auth (droite) */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-gray-700">Bonjour</span>
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
