'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ListingDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState(null);
  const [images, setImages] = useState([]);         // <= images DB (max 10)
  const [currentIdx, setCurrentIdx] = useState(0);  // <= index image active
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      // 1) charge l’annonce (publique uniquement)
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

      // 2) charge les images liées (max 10)
      const { data: imgs, error: imgErr } = await supabase
        .from('listing_images')
        .select('url, is_primary')
        .eq('listing_id', Number(id))
        .order('is_primary', { ascending: false })
        .limit(10);

      if (imgErr) {
        // on n’empêche pas l’affichage si les images échouent
        console.error(imgErr.message);
      }

      // fallback tableau vide + reset index
      const arr = (imgs || []).slice(0, 10);
      setImages(arr);
      setCurrentIdx(0);

      setLoading(false);
    })();
  }, [id]);

  // galerie = images dans l’ordre souhaité (déjà primary -> first via .order)
  const gallery = useMemo(() => images || [], [images]);
  const hasGallery = gallery.length > 0;

  // navigation carousel
  const goNext = useCallback(() => {
    if (!hasGallery) return;
    setCurrentIdx((i) => (i + 1) % gallery.length);
  }, [hasGallery, gallery.length]);

  const goPrev = useCallback(() => {
    if (!hasGallery) return;
    setCurrentIdx((i) => (i - 1 + gallery.length) % gallery.length);
  }, [hasGallery, gallery.length]);

  // clavier ← →
  useEffect(() => {
    if (!hasGallery || gallery.length < 2) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasGallery, gallery.length, goNext, goPrev]);

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
        <div className="max-w-md w-full bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 mb-3">Impossible d’afficher l’annonce.</p>
          {err && <p className="text-sm text-gray-500">Détail : {err}</p>}
          <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 border rounded-lg">
            ← Retour à l’accueil
          </button>
        </div>
      </main>
    );
  }

  const current = hasGallery ? gallery[currentIdx] : null;

  const price = new Intl.NumberFormat('fr-FR').format(item.price_xof || 0);
  const location = [item.commune, item.city].filter(Boolean).join(', ');

  // Liens contact (email retiré pour sécurité)
  const phoneRaw = (item.whatsapp || item.phone || '').replace(/\s+/g, '');
  const wa = phoneRaw
    ? `https://wa.me/${phoneRaw.replace('+','')}?text=${encodeURIComponent(
        `Bonjour, je suis intéressé par votre annonce #${item.id} - ${item.title}`
      )}`
    : null;
  const tel = item.phone ? `tel:${item.phone}` : null;

  const hasAnyContact = Boolean(wa || tel);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg border border-blue-600/60 text-blue-700 text-sm font-medium 
                       bg-transparent hover:bg-blue-50/70 transition"
          >
            ← Retour
          </button>
          <h1 className="text-xl font-bold">Détail de l’annonce</h1>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-3">
        {/* Galerie / Carousel */}
        <div className="lg:col-span-2">
          {current ? (
            <div className="relative group">
              <img
                src={current.url}
                alt={`${item.title} — photo ${currentIdx + 1}/${gallery.length}`}
                className="w-full aspect-video object-cover rounded-2xl border select-none cursor-pointer"
                onClick={gallery.length > 1 ? goNext : undefined}
                draggable={false}
              />

              {/* Compteur */}
              {gallery.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                  {currentIdx + 1} / {gallery.length}
                </div>
              )}

              {/* Flèches */}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    aria-label="Photo précédente"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border bg-white/80 hover:bg-white shadow px-2 py-1 text-xl leading-none hidden sm:block"
                  >
                    ‹
                  </button>
                  <button
                    onClick={goNext}
                    aria-label="Photo suivante"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-white/80 hover:bg-white shadow px-2 py-1 text-xl leading-none hidden sm:block"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="w-full aspect-video bg-gray-200 rounded-2xl grid place-items-center text-gray-500 border">
              Pas d’image
            </div>
          )}

          {/* Vignettes */}
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 gap-2">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`relative border rounded-lg overflow-hidden aspect-[4/3] ${
                    idx === currentIdx ? 'ring-2 ring-blue-500' : ''
                  }`}
                  aria-label={`Aller à la photo ${idx + 1}`}
                >
                  <img
                    src={img.url}
                    alt={`Vignette ${idx + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Panneau d’infos */}
        <aside className="bg-gray-50 border border-gray-200 rounded-2xl p-4 h-fit">
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

          {/* Contact — sans email */}
          {hasAnyContact ? (
            <div className="grid gap-2">
              {wa && (
                <a
                  className="w-full text-center border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100/60"
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Contacter via WhatsApp"
                >
                  Contacter via WhatsApp
                </a>
              )}
              {tel && (
                <a
                  className="w-full text-center border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100/60"
                  href={tel}
                  aria-label="Appeler le propriétaire"
                >
                  Appeler
                </a>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-100/60 p-3 text-sm text-gray-600">
              Les contacts par email ne sont pas proposés pour des raisons de sécurité.  
              Utilisez WhatsApp ou l’appel lorsque disponibles.
            </div>
          )}
        </aside>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <h3 className="text-base font-semibold mb-2">Description</h3>
          <p className="whitespace-pre-line text-gray-800">{item.description || '—'}</p>
        </div>
      </section>
    </main>
  );
}
