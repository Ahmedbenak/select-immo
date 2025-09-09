'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ListingDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      // 1) charge l’annonce
      const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', Number(id))
        .eq('status', 'published')
        .single();

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }
      setItem(listing);

      // 2) charge les images liées
      const { data: imgs } = await supabase
        .from('listing_images')
        .select('url, is_primary')
        .eq('listing_id', Number(id))
        .order('is_primary', { ascending: false });

      setImages(imgs || []);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <p>Chargement…</p>
      </main>
    );
  }

  if (err || !item) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md w-full bg-white border rounded-2xl p-6 text-center">
          <p className="text-red-600 mb-3">Impossible d’afficher l’annonce.</p>
          {err && <p className="text-sm text-gray-500">Détail : {err}</p>}
          <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 border rounded-lg">
            ← Retour à l’accueil
          </button>
        </div>
      </main>
    );
  }

  const primary = images.find(i => i.is_primary) || images[0];
  const other = images.filter(i => i !== primary);

  const price = new Intl.NumberFormat('fr-FR').format(item.price_xof || 0);
  const location = [item.commune, item.city].filter(Boolean).join(', ');

  // Liens contact
  const phone = (item.whatsapp || item.phone || '').replace(/\s+/g, '');
  const wa = phone
    ? `https://wa.me/${phone.replace('+','')}?text=${encodeURIComponent(
        `Bonjour, je suis intéressé par votre annonce #${item.id} - ${item.title}`
      )}`
    : null;
  const tel = item.phone ? `tel:${item.phone}` : null;
  const mailto = item.email ? `mailto:${item.email}?subject=${encodeURIComponent(`Annonce #${item.id} - ${item.title}`)}` : null;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-sm underline">← Retour</button>
          <h1 className="text-xl font-bold">Détail de l’annonce</h1>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-3">
        {/* Galerie */}
        <div className="lg:col-span-2">
          {primary ? (
            <img src={primary.url} alt={item.title} className="w-full aspect-video object-cover rounded-2xl border" />
          ) : (
            <div className="w-full aspect-video bg-gray-200 rounded-2xl grid place-items-center text-gray-500 border">
              Pas d’image
            </div>
          )}
          {other.length > 0 && (
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
              {other.map((img, idx) => (
                <img key={idx} src={img.url} alt={`photo ${idx+2}`} className="w-full h-24 object-cover rounded-lg border" />
              ))}
            </div>
          )}
        </div>

        {/* Panneau d’infos */}
        <aside className="bg-white border rounded-2xl p-4 h-fit">
          <h2 className="text-lg font-semibold mb-1">{item.title}</h2>
          <p className="text-sm text-gray-600 mb-3">{location}</p>
          <p className="text-2xl font-bold mb-4">{price} XOF</p>

          <ul className="text-sm text-gray-700 grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
            {item.property_type && <li><b>Type</b> : {item.property_type}</li>}
            {item.listing_type && <li><b>Offre</b> : {item.listing_type}</li>}
            {item.bedrooms != null && <li><b>Chambres</b> : {item.bedrooms}</li>}
            {item.bathrooms != null && <li><b>Sdb</b> : {item.bathrooms}</li>}
            {item.area_m2 != null && <li><b>Surface</b> : {item.area_m2} m²</li>}
            <li><b>Meublé</b> : {item.furnished ? 'Oui' : 'Non'}</li>
            <li><b>Parking</b> : {item.has_parking ? 'Oui' : 'Non'}</li>
            <li><b>Clim</b> : {item.has_ac ? 'Oui' : 'Non'}</li>
          </ul>

          <div className="grid gap-2">
            {wa && <a className="w-full text-center border rounded-lg px-3 py-2" href={wa} target="_blank" rel="noreferrer">Contacter via WhatsApp</a>}
            {tel && <a className="w-full text-center border rounded-lg px-3 py-2" href={tel}>Appeler</a>}
            {mailto && <a className="w-full text-center border rounded-lg px-3 py-2" href={mailto}>Envoyer un email</a>}
          </div>
        </aside>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="bg-white border rounded-2xl p-4">
          <h3 className="text-base font-semibold mb-2">Description</h3>
          <p className="whitespace-pre-line text-gray-800">{item.description || '—'}</p>
        </div>
      </section>
    </main>
  );
}
