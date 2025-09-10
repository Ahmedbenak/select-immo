// app/publier/page.js
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Parse "300 000 xof" -> 300000
function parseXOF(input) {
  const digits = String(input || '').replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export default function PublierPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const [form, setForm] = useState({
    title: '',
    listing_type: 'location',
    property_type: 'appartement',
    price_xof: '',
    city: 'Abidjan',
    commune: '',
    bedrooms: '',
    bathrooms: '',
    furnished: false,
    has_parking: false,
    has_ac: false,
    area_m2: '',
    address: '',
    description: '',
    phone: '',
  });

  // Auth guard
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) router.push('/login');
      else setUser(data.user);
    });
  }, [router]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!user) return;

    setErr('');
    setLoading(true);

    try {
      const priceInt = parseXOF(form.price_xof);

      const payload = {
        owner_id: user.id,
        status: 'published', // ou 'draft' si tu veux une validation
        title: form.title?.trim() || null,
        listing_type: form.listing_type,
        property_type: form.property_type,
        price_xof: priceInt,
        city: form.city || null,
        commune: form.commune || null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        furnished: !!form.furnished,
        has_parking: !!form.has_parking,
        has_ac: !!form.has_ac,
        area_m2: form.area_m2 ? Number(form.area_m2) : null,
        address: form.address || null,
        description: form.description || null,
        phone: form.phone || null,
        email: user.email || null, // pris automatiquement du compte connecté
      };

      const { data: listing, error } = await supabase
        .from('listings')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      // Upload images
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const path = `${listing.id}/${Date.now()}-${f.name}`;
        const up = await supabase.storage.from('listing-images').upload(path, f);
        if (up.error) {
          console.error('UPLOAD ERROR', up.error);
          continue;
        }
        const { data: pub } = supabase.storage.from('listing-images').getPublicUrl(path);
        const ins = await supabase.from('listing_images').insert({
          listing_id: listing.id,
          url: pub.publicUrl,
          is_primary: i === 0,
        });
        if (ins.error) console.error('INSERT IMAGE ROW ERROR', ins.error);
      }

      alert('Annonce publiée avec succès !');
      router.push(`/listing/${listing.id}`);
    } catch (e) {
      console.error(e);
      setErr(e?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-bold mb-1">Publier une annonce</h1>
        <p className="text-sm text-slate-600 mb-4">
          Renseigne les informations du bien et ajoute des photos.</p>

        {err && (
          <p className="text-red-600 mb-3 font-medium" role="alert" aria-live="polite">
            {err}
          </p>
        )}

        <form onSubmit={onSubmit} className="grid gap-4">
          {/* Titre */}
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Titre de l'annonce"
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />

          {/* Offre & Type de bien */}
          <div className="grid grid-cols-2 gap-3">
            <select
              className="border rounded-lg px-3 py-2"
              defaultValue="location"
              onChange={(e) => setForm((f) => ({ ...f, listing_type: e.target.value }))}
            >
              <option value="location">Location</option>
              <option value="vente">Vente</option>
            </select>

            <select
              className="border rounded-lg px-3 py-2"
              defaultValue="appartement"
              onChange={(e) => setForm((f) => ({ ...f, property_type: e.target.value }))}
            >
              <option>appartement</option>
              <option>maison</option>
              <option>villa</option>
              <option>studio</option>
              <option>terrain</option>
              <option>bureau</option>
            </select>
          </div>

          {/* Prix */}
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Prix (Franc CFA) — ex : 300 000"
            value={form.price_xof}
            onChange={(e) => setForm((f) => ({ ...f, price_xof: e.target.value }))}
          />

          {/* Ville & Commune */}
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Ville (ex : Abidjan)"
              defaultValue="Abidjan"
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Commune (ex : Cocody)"
              onChange={(e) => setForm((f) => ({ ...f, commune: e.target.value }))}
            />
          </div>

          {/* Chambres & Salles de bain */}
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Chambres"
              inputMode="numeric"
              onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))}
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Salles de bain"
              inputMode="numeric"
              onChange={(e) => setForm((f) => ({ ...f, bathrooms: e.target.value }))}
            />
          </div>

          {/* Meublé / Parking / Clim */}
          <div className="grid grid-cols-3 gap-3">
            <label className="flex items-center gap-2 border rounded-lg px-3 py-2">
              <input
                type="checkbox"
                checked={form.furnished}
                onChange={(e) => setForm((f) => ({ ...f, furnished: e.target.checked }))}
              />
              <span>Meublé</span>
            </label>
            <label className="flex items-center gap-2 border rounded-lg px-3 py-2">
              <input
                type="checkbox"
                checked={form.has_parking}
                onChange={(e) => setForm((f) => ({ ...f, has_parking: e.target.checked }))}
              />
              <span>Parking</span>
            </label>
            <label className="flex items-center gap-2 border rounded-lg px-3 py-2">
              <input
                type="checkbox"
                checked={form.has_ac}
                onChange={(e) => setForm((f) => ({ ...f, has_ac: e.target.checked }))}
              />
              <span>Climatisation</span>
            </label>
          </div>

          {/* Surface */}
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Surface (m²)"
            inputMode="numeric"
            onChange={(e) => setForm((f) => ({ ...f, area_m2: e.target.value }))}
          />

          {/* Adresse */}
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Adresse (facultatif)"
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />

          {/* Description */}
          <textarea
            rows={5}
            className="border rounded-lg px-3 py-2"
            placeholder="Description"
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          {/* Téléphone */}
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Téléphone"
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />

          {/* Photos — bouton épuré */}
          <div className="flex items-center gap-3">
            <input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
            <label
              htmlFor="photos"
              className="cursor-pointer inline-flex items-center justify-center rounded-lg border px-4 py-2 bg-white hover:bg-slate-50 shadow-sm"
            >
              Sélectionner des photos
            </label>
            <span className="text-sm text-slate-600">
              {files.length === 0
                ? 'Aucun fichier choisi'
                : `${files.length} fichier(s) sélectionné(s)`}
            </span>
          </div>

          <button
            disabled={loading}
            className="mt-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Envoi…' : 'Publier mon annonce'}
          </button>
        </form>
      </div>
    </section>
  );
}
