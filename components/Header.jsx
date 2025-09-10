'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

export default function Header() {
  const [user, setUser] = useState(null);

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
        
        {/* Groupe gauche : Logo + Titre + Instagram */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image 
              src="/logo.png"   // ton image dans /public/logo.png
              alt="Logo Select Immo" 
              width={100} 
              height={100} 
            />
            <span>Select Immo CI</span>
          </Link>

          {/* Icône Instagram */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ouvrir Instagram"
            title="Instagram"
            className="inline-flex h-5 w-5 items-center justify-center hover:opacity-90 active:scale-95 transition"
          >
            {/* SVG déjà dans ton code */}
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
