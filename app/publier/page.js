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

// pour des noms de fichiers propres
function slugify(name) {
  return String(name || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export default function PublierPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // === CHANGEMENT: on stocke des objets { file, previewUrl } ===
  const [files, setFiles] = useState([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);

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

  // === CHANGEMENT: sélection de fichiers (max 10, images seulement) ===
  function onSelectFiles(e) {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;

    const onlyImages = picked.filter(f => f.type.startsWith('image/'));
    // fusion avec déjà sélectionnés, puis limite 10
    const merged = [...files, ...onlyImages.map(f => ({ file: f }))].slice(0, 10);

    // ajoute previewUrl
    const withPreview = merged.map(obj => {
      const f = obj.file || obj; // compat
      return {
        file: f,
        previewUrl: obj.previewUrl || URL.createObjectURL(f),
      };
    });

    setFiles(withPreview);
    if (primaryIndex >= withPreview.length) setPrimaryIndex(0);

    // permet de re-choisir les mêmes fichiers si besoin
    e.target.value = '';
  }

  // === CHANGEMENT: suppression d'un fichier sélectionné ===
  function removeFile(idx) {
    setFiles(prev => {
      const next = prev.slice();
      try { URL.revokeObjectURL(next[idx]?.previewUrl); } catch {}
      next.splice(idx, 1);
      // recaler l'index principal si nécessaire
      if (primaryIndex === idx) setPrimaryIndex(0);
      else if (primaryIndex > idx) setPrimaryIndex(primaryIndex - 1);
      return next;
    });
  }

  // === CHANGEMENT: choisir la photo principale ===
  function makePrimary(idx) {
    setPrimaryIndex(idx);
  }

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

      // === CHANGEMENT: upload avec respect de l'index principal ===
      for (let i = 0; i < files.length; i++) {
        const f = files[i]?.file || files[i];
        const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const cleanName = slugify(f?.name || `photo-${i}.jpg`);
        const path = `${listing.id}/${uuid}-${cleanName}`;

        const up = await supabase.storage.from('listing-images').upload(path, f, {
          cacheControl: '3600',
          upsert: false,
        });
        if (up.error) {
          console.error('UPLOAD ERROR', up.error);
          continue;
        }

        const { data: pub } = supabase.storage.from('listing-images').getPublicUrl(path);

        const ins = await supabase.from('listing_images').insert({
          listing_id: listing.id,
          url: pub.publicUrl,
          is_primary: i === primaryIndex, // <= respecte le choix utilisateur
        });
        if (ins.error) console.error('INSERT IMAGE ROW ERROR', ins.error);
      }

      alert('Annonce publiée avec succès !');
      router.push(`/listing/${listing.id}`);
    } catch (e2) {
      console.error(e2);
      setErr(e2?.message || 'Une erreur est survenue.');
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
          Renseigne les informations du bien et ajoute des photos (jusqu’à 10).
        </p>

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
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />

          {/* Offre & Type de bien */}
          <div className="grid grid-cols-2 gap-3">
            <select
              className="border rounded-lg px-3 py-2"
              value={form.listing_type}
              onChange={(e) => setForm((f) => ({ ...f, listing_type: e.target.value }))}
            >
              <option value="location">Location</option>
              <option value="vente">Vente</option>
            </select>

            <select
              className="border rounded-lg px-3 py-2"
              value={form.property_type}
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
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Commune (ex : Cocody)"
              value={form.commune}
              onChange={(e) => setForm((f) => ({ ...f, commune: e.target.value }))}
            />
          </div>

          {/* Chambres & Salles de bain */}
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Chambres"
              inputMode="numeric"
              value={form.bedrooms}
              onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))}
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Salles de bain"
              inputMode="numeric"
              value={form.bathrooms}
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
            value={form.area_m2}
            onChange={(e) => setForm((f) => ({ ...f, area_m2: e.target.value }))}
          />

          {/* Adresse */}
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Adresse (facultatif)"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />

          {/* Description */}
          <textarea
            rows={5}
            className="border rounded-lg px-3 py-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          {/* Téléphone */}
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Téléphone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />

          {/* Photos — bouton épuré + prévisualisation + principale */}
          <div className="grid gap-2">
            <div className="flex items-center gap-3">
              <input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onSelectFiles}
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
                  : `${files.length} fichier(s) sélectionné(s) — maximum 10`}
              </span>
            </div>

            {files.length > 0 && (
              <>
                <p className="text-xs text-gray-600">
                  Clique sur « Définir principale » pour choisir la photo vitrine.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  {files.map((f, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-lg p-2 ${idx === primaryIndex ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <img
                        src={f.previewUrl}
                        alt={`prévisualisation ${idx + 1}`}
                        className="w-full h-32 object-cover rounded"
                        draggable={false}
                      />
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => makePrimary(idx)}
                          className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                        >
                          {idx === primaryIndex ? 'Principale ✓' : 'Définir principale'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Formats image, poids raisonnable recommandé (≤ ~4–6 Mo/photo).</p>
              </>
            )}
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
