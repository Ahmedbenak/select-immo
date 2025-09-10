'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function PublierPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    title: '',
    price_xof: '',
    listing_type: 'location',
    property_type: 'appartement',
    city: 'Abidjan',
    commune: '',
    bedrooms: '',
    description: ''
  });
  const [files, setFiles] = useState([]); // <-- pas de <File[]>
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Guard: nécessite connexion
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) router.push('/login');
      else setUser(data.user);
    });
  }, [router]);

  async function onSubmit(e) { // <-- pas de React.FormEvent
    e.preventDefault();
    if (!user) return;
    setErr('');
    setLoading(true);

    try {
      // 1) créer l'annonce en brouillon
      const { data: listing, error } = await supabase
        .from('listings')
        .insert({
          owner_id: user.id,
          status: 'published',
          title: form.title?.trim() || null,
          price_xof: Number(form.price_xof || 0),
          listing_type: form.listing_type,
          property_type: form.property_type,
          city: form.city || null,
          commune: form.commune || null,
          bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
          description: form.description || null
        })
        .select('*')
        .single();

      if (error) {
        console.error('INSERT LISTING ERROR', error);
        setErr(error.message);
        setLoading(false);
        return;
      }

      // 2) upload des images + insertion listing_images
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
          is_primary: i === 0
        });
        if (ins.error) console.error('INSERT IMAGE ROW ERROR', ins.error);
      }

      alert('Annonce publiée avec succès !');
      router.push(`/listing/${listing.id}`);
    } catch (e) {
      console.error('SUBMIT FATAL ERROR', e);
      setErr(e?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null; // court-circuit pendant la redirection

  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-bold mb-1">Publier une annonce</h1>
        <p className="text-sm text-slate-600 mb-4">
          Remplis les infos du bien et ajoute des photos. L’annonce sera créée comme <b>brouillon</b>.
        </p>

        {/* Affichage conditionnel de l'erreur */}
        {err && (
          <p className="text-red-600 mb-3 font-medium" role="alert" aria-live="polite">
            {err}
          </p>
        )}

        <form onSubmit={onSubmit} className="grid gap-3">
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Titre"
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Prix (XOF)"
              onChange={(e) => setForm((f) => ({ ...f, price_xof: e.target.value }))}
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Chambres"
              onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              className="border rounded-lg px-3 py-2"
              onChange={(e) => setForm((f) => ({ ...f, listing_type: e.target.value }))}
              defaultValue="location"
            >
              <option value="location">Location</option>
              <option value="vente">Vente</option>
            </select>
            <select
              className="border rounded-lg px-3 py-2"
              onChange={(e) => setForm((f) => ({ ...f, property_type: e.target.value }))}
              defaultValue="appartement"
            >
              <option>appartement</option>
              <option>maison</option>
              <option>villa</option>
              <option>studio</option>
              <option>terrain</option>
              <option>bureau</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Ville (ex: Abidjan)"
              defaultValue="Abidjan"
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Commune (ex: Cocody)"
              onChange={(e) => setForm((f) => ({ ...f, commune: e.target.value }))}
            />
          </div>

          <textarea
            rows={5}
            className="border rounded-lg px-3 py-2"
            placeholder="Description"
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          <div>
            <label className="text-sm mb-1 block">Photos (jpeg/png, plusieurs autorisées)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
          </div>

          <button
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Envoi…' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </section>
  );
}
