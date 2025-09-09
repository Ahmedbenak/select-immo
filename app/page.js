'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select(`
        id, title, price_xof, property_type, city, commune, created_at,
        listing_images ( url, is_primary )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(24);

    if (error) setErr(error.message);
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Select Immo CI</h1>
          <a href="#" className="text-sm text-white bg-black px-3 py-1.5 rounded-lg">Publier</a>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold mb-3">Annonces récentes</h2>

        {err && <p className="text-red-600 mb-3">Erreur: {err}</p>}
        {loading ? (
          <p>Chargement…</p>
        ) : items.length === 0 ? (
          <p>Aucune annonce publiée pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((it) => {
              const primary = (it.listing_images || []).find(i => i.is_primary) || (it.listing_images || [])[0];
              return (
                <article key={it.id} className="bg-white rounded-2xl overflow-hidden border hover:shadow-sm transition">
                  {primary?.url ? (
                    <img src={primary.url} alt={it.title} className="w-full h-48 object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 grid place-items-center text-gray-500">Pas d’image</div>
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold line-clamp-1">{it.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Intl.NumberFormat('fr-FR').format(it.price_xof)} XOF · {it.property_type}
                    </p>
                    <p className="text-xs text-gray-500">{[it.commune, it.city].filter(Boolean).join(', ')}</p>
                    <a href={`/listing/${it.id}`} className="inline-block mt-2 text-sm underline">Voir le détail</a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
