// app/components/Header.js
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const INSTAGRAM_URL = 'https://www.instagram.com/select_immo_ci/';

  useEffect(() => {
    // État initial
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));

    // Se mettre à jour sur login/logout/refresh
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      router.refresh(); // force la mise à jour visuelle
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 bg-gray-100 border-b">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        {/* Groupe gauche : Logo + Titre + Instagram */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image
              src="/logo.png"     // /public/logo.png
              alt="Logo Select Immo"
              width={100}
              height={100}
              className="rounded"
              priority
            />
            <span className="text-sm sm:text-base">Select Immo CI</span>
          </Link>

          {/* Icône Instagram en couleur */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ouvrir Instagram Select Immo CI"
            className="inline-flex h-5 w-5 items-center justify-center hover:opacity-90 active:scale-95 transition"
            title="Instagram"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <defs>
                <linearGradient id="igGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f58529" />
                  <stop offset="30%" stopColor="#feda77" />
                  <stop offset="60%" stopColor="#dd2a7b" />
                  <stop offset="80%" stopColor="#8134af" />
                  <stop offset="100%" stopColor="#515bd4" />
                </linearGradient>
              </defs>
              <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="url(#igGrad)" />
              <rect x="6.5" y="6.5" width="11" height="11" rx="3.5" fill="none" stroke="white" strokeWidth="2" />
              <circle cx="12" cy="12" r="3.5" fill="none" stroke="white" strokeWidth="2" />
              <circle cx="16.8" cy="7.2" r="1.2" fill="white" />
            </svg>
          </a>
        </div>

        {/* Liens centre */}
        <nav className="hidden sm:flex gap-4 text-gray-700">
          <Link href="/" className="hover:underline">Accueil</Link>
          <Link href="/publier" className="hover:underline">Publier</Link>
        </nav>

        {/* Auth droite */}
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
