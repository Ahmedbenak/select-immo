'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('tous'); // 'tous' | 'vente' | 'location'

  async function load(currentFilter = filter) {
    setLoading(true);

    let query = supabase
      .from('listings')
      .select(`
        id, title, price_xof, property_type, city, commune, created_at, listing_type,
        listing_images ( url, is_primary )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(24);

    if (currentFilter !== 'tous') {
      query = query.eq('listing_type', currentFilter);
    }

    const { data, error } = await query;
    if (error) setErr(error.message);
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load('tous'); // chargement initial
  }, []);

  useEffect(() => {
    load(filter); // recharge quand on change de filtre
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const FilterButton = ({ value, children }) => {
    const active = filter === value;
    return (
      <button
        onClick={() => setFilter(value)}
        className={[
          "px-4 py-2 text-sm font-medium transition border",
          active
            ? "bg-black text-white border-black"
            : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
        ].join(' ')}
      >
        {children}
      </button>
    );
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Annonces récentes</h2>

        {/* Boutons filtre Vente / Location */}
        <div className="inline-flex rounded-lg overflow-hidden border border-gray-300">
          <FilterButton value="tous">Tous</FilterButton>
          <FilterButton value="vente">Vente</FilterButton>
          <FilterButton value="location">Location</FilterButton>
        </div>
      </div>

      {err && <p className="text-red-600 mt-3">Erreur : {err}</p>}

      {loading ? (
        <p className="mt-4">Chargement…</p>
      ) : items.length === 0 ? (
        <div className="mt-4 text-slate-600">
          <p>Aucune annonce publiée pour ce filtre.</p>
          <Link href="/publier" className="inline-block mt-2 underline">
            Publier une première annonce
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it, idx) => {
            const primary =
              (it.listing_images || []).find(i => i.is_primary) ||
              (it.listing_images || [])[0];

            const isVente = (it.listing_type || '').toLowerCase() === 'vente';
            const typeLabel = isVente ? 'Vente' : 'Location';
            const typeClasses = isVente
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800';

            return (
              <motion.article
                key={it.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                whileHover={{ y: -2 }}
                className="relative bg-white rounded-2xl overflow-hidden border hover:shadow-sm transition"
              >
                {primary?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primary.url}
                    alt={it.title || 'Annonce'}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 grid place-items-center text-gray-500">
                    Pas d’image
                  </div>
                )}

                <div className="p-3">
                  <h3 className="font-semibold line-clamp-1">{it.title || 'Sans titre'}</h3>
                  <p className="text-sm text-gray-600">
                    {new Intl.NumberFormat('fr-FR').format(it.price_xof)} XOF · {it.property_type}
                  </p>
                  <p className="text-xs text-gray-500">
                    {[it.commune, it.city].filter(Boolean).join(', ')}
                  </p>
                  <Link
                    href={`/listing/${it.id}`}
                    className="inline-block mt-2 text-sm underline"
                  >
                    Voir le détail
                  </Link>
                </div>

                {/* Badge Vente / Location - bas droite */}
                <div
                  className={`pointer-events-none absolute bottom-2 right-2 rounded-lg px-4 py-1.5 text-sm font-semibold shadow-sm ${typeClasses}`}
                  aria-label={`Type d'annonce : ${typeLabel}`}
                >
                  {typeLabel}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}
