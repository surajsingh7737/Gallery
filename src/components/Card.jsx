import React, { memo, useState } from 'react'
import { Heart, ImageOff } from 'lucide-react'

/* Placeholder shown while a page is loading (same shape as a real card) */
export const SkeletonCard = () => (
  <div className='overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-white/5'>
    <div className='aspect-4/3 animate-pulse bg-neutral-800' />
    <div className='flex items-center gap-3 p-3'>
      <div className='h-9 w-9 animate-pulse rounded-full bg-neutral-800' />
      <div className='flex-1 space-y-2'>
        <div className='h-3 w-2/3 animate-pulse rounded bg-neutral-800' />
        <div className='h-2.5 w-1/3 animate-pulse rounded bg-neutral-800' />
      </div>
    </div>
  </div>
)

const Card = ({ photo, isFavorite, onToggleFavorite, onOpen }) => {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  // download_url is the full original (can be 5000px+). A 600x450 copy is ~20x lighter.
  const src = `https://picsum.photos/id/${photo.id}/600/450`

  return (
    <article className='group relative overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-white/10'>
      <button
        type='button'
        onClick={() => onOpen(photo.id)}
        aria-label={`Open photo by ${photo.author}`}
        className='block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400'
      >
        <div className='relative aspect-4/3 overflow-hidden bg-neutral-800'>
          {failed ? (
            <div className='absolute inset-0 grid place-items-center text-gray-500'>
              <div className='flex flex-col items-center gap-1 text-xs'>
                <ImageOff size={22} />
                Image unavailable
              </div>
            </div>
          ) : (
            <>
              {!loaded && <div className='absolute inset-0 animate-pulse bg-neutral-800' />}
              <img
                src={src}
                alt={`Photo by ${photo.author}`}
                loading='lazy'
                decoding='async'
                onLoad={() => setLoaded(true)}
                onError={() => setFailed(true)}
                className={`h-full w-full object-cover transition duration-700 motion-reduce:transition-none group-hover:scale-105 ${
                  loaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </>
          )}
        </div>

        <div className='flex items-center gap-3 p-3'>
          <div className='grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-400 text-sm font-bold text-black'>
            {photo.author.charAt(0).toUpperCase()}
          </div>
          <div className='min-w-0'>
            <h3 className='truncate text-sm font-semibold text-white'>{photo.author}</h3>
            <p className='text-xs text-gray-500'>
              {photo.width} × {photo.height}
            </p>
          </div>
        </div>
      </button>

      {/* Sibling of the open-button (a button inside a button is invalid HTML) */}
      <button
        type='button'
        onClick={() => onToggleFavorite(photo)}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-black/70 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
          isFavorite
            ? 'opacity-100'
            : 'sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100'
        }`}
      >
        <Heart size={16} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
      </button>
    </article>
  )
}

export default memo(Card)
