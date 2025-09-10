'use client';

export default function ListingCard({ item }) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* Image principale */}
      <div className="relative h-44 w-full bg-gray-100">
        {item?.listing_images?.[0]?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.listing_images[0].url}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            Pas d’image
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-3">
        <h3 className="line-clamp-1 text-base font-semibold">{item.title}</h3>
        <p className="text-sm text-gray-600">
          {item.city}{item.commune ? `, ${item.commune}` : ''}
        </p>
        <p className="mt-1 text-sm font-bold">{item.price_xof} XOF</p>
      </div>

      {/* Bandeau Vente/Location (bas gauche) */}
      <div
        className={`absolute bottom-0 left-0 px-3 py-1 text-xs font-semibold rounded-tr-lg
        ${item.listing_type === 'vente'
          ? 'bg-green-100 text-green-800'
          : 'bg-blue-100 text-blue-800'}`}
      >
        {item.listing_type === 'vente' ? 'Vente' : 'Location'}
      </div>
    </div>
  );
}
