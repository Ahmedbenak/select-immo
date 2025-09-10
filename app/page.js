'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// Parse "300 000", "300.000", "300k" -> 300000
function parseNumber(input) {
  const s = String(input || '').trim().toLowerCase();
  if (!s) return null;
  if (s.endsWith('k')) {
    const n = parseInt(s.slice(0, -1).replace(/[^\d]/g, ''), 10);
    return Number.isFinite(n) ? n * 1000 : null;
  }
  const n = parseInt(s.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

const initialFilters = {
  listing_type: 'tous',
  property_type: 'tous',
  commune: '',
  price_min: '',
  price_max: '',
  bedrooms_min: '',
  bathrooms_min: '',
  furnished_only: false,
  has_parking_only: false,
  has_ac_only: false,
};

// --- Barre de filtres avec état local (draft) ---
const FiltersBar = React.memo(function FiltersBar({
  show,
  setShow,
  appliedFilters,
  onApply,
  onReset,
}) {
  const [draft, setDraft] = useState(appliedFilters);

  useEffect(() => { setDraft(appliedFilters); }, [appliedFilters]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setDraft((d) => ({ ...d, [name]: value }));
  };

  const onCheck = (e) => {
    const { name, checked } = e.target;
    setDraft((d) => ({ ...d, [name]: checked }));
  };

  // 👉 Déclenche Appliquer si on appuie sur Entrée dans un input texte
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // évite un submit involontaire
      onApply(draft);
    }
  };

  const apply = () => onApply(draft);
  const reset = () => {
    setDraft(initialFilters);
    onReset();
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Annonces récentes</h2>
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
        >
          Filtres
        </button>
      </div>

      {show && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-white/70 border border-gray-200 rounded-xl p-3 shadow-sm">
          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">Type d’offre</label>
            <select
              name="listing_type"
              value={draft.listing_type}
              onChange={onChange}
              className="w-full h-10 border rounded-md px-2"
            >
              <option value="tous">Tous</option>
              <option value="vente">Vente</option>
              <option value="location">Location</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">Type de bien</label>
            <select
              name="property_type"
              value={draft.property_type}
              onChange={onChange}
              className="w-full h-10 border rounded-md px-2"
            >
              <option value="tous">Tous</option>
              <option value="appartement">Appartement</option>
              <option value="maison">Maison</option>
              <option value="villa">Villa</option>
              <option value="studio">Studio</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">Commune</label>
            <input
              type="text"
              name="commune"
              value={draft.commune}
              onChange={onChange}
              onKeyDown={onKeyDown}
              className="w-full h-10 border rounded-md px-2"
              placeholder="Cocody, Marcory…"
            />
          </div>

          <div className="md:col-span-3 grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600">Prix min</label>
              <input
                type="text"
                name="price_min"
                value={draft.price_min}
                onChange={onChange}
                onKeyDown={onKeyDown}
                className="w-full h-10 border rounded-md px-2"
                placeholder="300 000"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Prix max</label>
              <input
                type="text"
                name="price_max"
                value={draft.price_max}
                onChange={onChange}
                onKeyDown={onKeyDown}
                className="w-full h-10 border rounded-md px-2"
                placeholder="1 200 000"
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="text-xs text-gray-600">Chambres ≥</label>
            <input
              type="text"
              name="bedrooms_min"
              value={draft.bedrooms_min}
              onChange={onChange}
              onKeyDown={onKeyDown}
              className="w-full h-10 border rounded-md px-2"
              placeholder="2"
            />
          </div>
          <div className="md:col-span-1">
            <label className="text-xs text-gray-600">Sdb ≥</label>
            <input
              type="text"
              name="bathrooms_min"
              value={draft.bathrooms_min}
              onChange={onChange}
              onKeyDown={onKeyDown}
              className="w-full h-10 border rounded-md px-2"
              placeholder="1"
            />
          </div>

          <div className="md:col-span-3 flex flex-wrap gap-x-4 gap-y-2 items-center">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="furnished_only"
                checked={draft.furnished_only}
                onChange={onCheck}
              /> Meublé
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="has_parking_only"
                checked={draft.has_parking_only}
                onChange={onCheck}
              /> Parking
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="has_ac_only"
                checked={draft.has_ac_only}
                onChange={onCheck}
              /> Clim
            </label>
          </div>

          <div className="md:col-span-12 flex gap-2 justify-end">
            <button
              type="button"
              onClick={apply}
              className="h-10 px-4 rounded-md bg-black text-white"
            >
              Appliquer
            </button>
            <button
              type="button"
              onClick={reset}
              className="h-10 px-4 rounded-md border"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}
    </>
  );
});

// --- Page principale ---
export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async (apply) => {
    setLoading(true);
    setErr('');

    let query = supabase
      .from('listings')
      .select(`
        id, title, price_xof, property_type, city, commune, created_at, listing_type,
        bedrooms, bathrooms, furnished, has_parking, has_ac,
        listing_images ( url, is_primary )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(24);

    if (apply.listing_type !== 'tous') query = query.eq('listing_type', apply.listing_type);
    if (apply.property_type !== 'tous') query = query.eq('property_type', apply.property_type);
    if (apply.commune.trim()) query = query.ilike('commune', `%${apply.commune.trim()}%`);

    const pmin = parseNumber(apply.price_min);
    const pmax = parseNumber(apply.price_max);
    if (pmin !== null) query = query.gte('price_xof', pmin);
    if (pmax !== null) query = query.lte('price_xof', pmax);

    const bmin = parseInt(String(apply.bedrooms_min).replace(/\D/g, ''), 10);
    if (Number.isFinite(bmin)) query = query.gte('bedrooms', bmin);
    const bbmin = parseInt(String(apply.bathrooms_min).replace(/\D/g, ''), 10);
    if (Number.isFinite(bbmin)) query = query.gte('bathrooms', bbmin);

    if (apply.furnished_only) query = query.eq('furnished', true);
    if (apply.has_parking_only) query = query.eq('has_parking', true);
    if (apply.has_ac_only) query = query.eq('has_ac', true);

    const { data, error } = await query;
    if (error) setErr(error.message);
    setItems(data || []);
    setLoading(false);
  }, []);

  const applyNow = useCallback((draft) => {
    setFilters(draft);
    load(draft);
  }, [load]);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    load(initialFilters);
  }, [load]);

  useEffect(() => { load(initialFilters); }, [load]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <FiltersBar
        show={showFilters}
        setShow={setShowFilters}
        appliedFilters={filters}
        onApply={applyNow}
        onReset={resetFilters}
      />

      {err && <p className="text-red-600 mt-3">Erreur : {err}</p>}

      {loading ? (
        <p className="mt-4">Chargement…</p>
      ) : items.length === 0 ? (
        <div className="mt-4 text-slate-600">
          <p>Aucune annonce publiée pour ces filtres.</p>
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
                className="relative bg-white rounded-2xl overflow-hidden shadow-md ring-1 ring-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition duration-200"
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

                <div className="p-4">
                  <h3 className="font-bold text-lg text-black line-clamp-1">
                    {it.title || 'Sans titre'}
                  </h3>

                  <p className="text-sm text-gray-700">
                    {new Intl.NumberFormat('fr-FR').format(it.price_xof)} XOF · {it.property_type}
                    {Number.isFinite(it.bedrooms) && (
                      <span className="text-gray-500"> · {it.bedrooms} ch</span>
                    )}
                    {Number.isFinite(it.bathrooms) && (
                      <span className="text-gray-500"> · {it.bathrooms} sdb</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {[it.commune, it.city].filter(Boolean).join(', ')}
                  </p>
                  <Link
                    href={`/listing/${it.id}`}
                    className="mt-3 mb-6 inline-block rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition"
                  >
                    Voir le détail
                  </Link>
                </div>

                <div
                  className={`pointer-events-none absolute bottom-2 right-2 rounded-lg px-4 py-1.5 text-sm font-semibold shadow-sm ${typeClasses}`}
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
