import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Heart,
  ImageOff,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import Card, { SkeletonCard } from './components/Card'

/* ------------------------------ config ------------------------------ */
const API_URL = 'https://picsum.photos/v2/list'
const PAGE_SIZES = [12, 24, 48] // all divide evenly into 2, 3, 4 and 6 columns
const DEFAULT_LIMIT = 24
const FAVORITES_KEY = 'gallery:favorites'
const GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 2xl:grid-cols-6'

/* ------------------------------ helpers ----------------------------- */
// Read ?page=3&limit=24 from the URL so a refresh or shared link keeps the same page
const readUrlParams = () => {
  const params = new URLSearchParams(window.location.search)
  const page = parseInt(params.get('page'), 10)
  const limit = parseInt(params.get('limit'), 10)
  return {
    page: page > 0 ? page : 1,
    limit: PAGE_SIZES.includes(limit) ? limit : DEFAULT_LIMIT,
  }
}

const loadFavorites = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

// The API does not tell us the total page count, so we only show pages we know exist:
// 1 … 4 5 6
const getPageList = (page, hasMore) => {
  const pages = [...new Set([1, page - 1, page, hasMore ? page + 1 : page])]
    .filter((p) => p >= 1)
    .sort((a, b) => a - b)
  const list = []
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) list.push('dots')
    list.push(p)
  })
  return list
}

/* ---------------------------- Pagination ---------------------------- */
const Pagination = ({ page, hasMore, disabled, onChange }) => {
  const btn =
    'inline-flex h-10 min-w-[2.5rem] items-center justify-center gap-1 rounded-xl px-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-40'
  const idle = 'bg-white/5 text-gray-200 ring-1 ring-white/10 hover:bg-white/10 active:scale-95'

  return (
    <nav aria-label='Pagination' className='flex flex-wrap items-center justify-center gap-2'>
      <button
        type='button'
        className={`${btn} ${idle}`}
        disabled={disabled || page === 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft size={16} />
        Prev
      </button>

      {getPageList(page, hasMore).map((item) =>
        item === 'dots' ? (
          <span key='dots' className='px-1 text-gray-500'>
            …
          </span>
        ) : (
          <button
            key={item}
            type='button'
            disabled={disabled}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => item !== page && onChange(item)}
            className={`${btn} ${item === page ? 'bg-amber-400 text-black' : idle}`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type='button'
        className={`${btn} ${idle}`}
        disabled={disabled || !hasMore}
        onClick={() => onChange(page + 1)}
      >
        Next
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}

/* ----------------------------- Lightbox ----------------------------- */
const Lightbox = ({
  photo,
  hasPrev,
  hasNext,
  isFavorite,
  onPrev,
  onNext,
  onClose,
  onToggleFavorite,
}) => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
  }, [photo.id])

  // Keyboard: Esc closes, arrow keys move between photos
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      else if (e.key === 'ArrowRight' && hasNext) onNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hasPrev, hasNext, onPrev, onNext, onClose])

  // Stop the page behind from scrolling while the lightbox is open
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  const width = Math.min(1400, photo.width)
  const height = Math.round((width * photo.height) / photo.width)
  const src = `https://picsum.photos/id/${photo.id}/${width}/${height}`

  const circle =
    'grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400'

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-label={`Photo by ${photo.author}`}
      onClick={onClose}
      className='fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/90 p-4 backdrop-blur-md'
    >
      <button
        type='button'
        autoFocus
        aria-label='Close'
        onClick={onClose}
        className={`${circle} absolute right-4 top-4 z-10`}
      >
        <X size={20} />
      </button>

      {hasPrev && (
        <button
          type='button'
          aria-label='Previous photo'
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          className={`${circle} absolute left-3 top-1/2 z-10 -translate-y-1/2`}
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {hasNext && (
        <button
          type='button'
          aria-label='Next photo'
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className={`${circle} absolute right-3 top-1/2 z-10 -translate-y-1/2`}
        >
          <ChevronRight size={22} />
        </button>
      )}

      <div className='relative h-[70vh] w-full max-w-5xl' onClick={(e) => e.stopPropagation()}>
        {!loaded && (
          <div className='absolute inset-0 grid place-items-center'>
            <div className='h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-amber-400' />
          </div>
        )}
        <img
          key={photo.id}
          src={src}
          alt={`Photo by ${photo.author}`}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={`h-full w-full rounded-2xl object-contain transition-opacity duration-500 motion-reduce:transition-none ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      <div
        className='flex w-full max-w-5xl flex-wrap items-center justify-between gap-3'
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className='text-lg font-semibold'>{photo.author}</p>
          <p className='text-sm text-gray-400'>
            {photo.width} × {photo.height} px
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            className='inline-flex h-11 items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400'
          >
            <Heart size={16} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
            {isFavorite ? 'Saved' : 'Save'}
          </button>
          <a
            href={photo.url}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-semibold text-black transition hover:bg-amber-300 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
          >
            <ExternalLink size={16} />
            View on Unsplash
          </a>
        </div>
      </div>
    </div>
  )
}

/* ------------------- Empty / error message block -------------------- */
const Message = ({ icon: Icon, title, text, action }) => (
  <div className='mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center'>
    <div className='grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-amber-400 ring-1 ring-white/10'>
      <Icon size={26} />
    </div>
    <h2 className='text-lg font-semibold'>{title}</h2>
    <p className='text-sm text-gray-400'>{text}</p>
    {action}
  </div>
)

const ActionButton = ({ onClick, children }) => (
  <button
    type='button'
    onClick={onClick}
    className='mt-2 inline-flex h-10 items-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-semibold text-black transition hover:bg-amber-300 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
  >
    {children}
  </button>
)

/* -------------------------------- App -------------------------------- */
const App = () => {
  const [page, setPage] = useState(() => readUrlParams().page)
  const [limit, setLimit] = useState(() => readUrlParams().limit)
  const [photos, setPhotos] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
  const [retryKey, setRetryKey] = useState(0)
  const [query, setQuery] = useState('')
  const [showFavorites, setShowFavorites] = useState(false)
  const [favorites, setFavorites] = useState(loadFavorites)
  const [activeId, setActiveId] = useState(null)

  /* Fetch photos. AbortController cancels the old request if the page changes quickly. */
  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')

    axios
      .get(API_URL, { params: { page, limit }, signal: controller.signal })
      .then(({ data }) => {
        setPhotos(data)
        setStatus('success')
      })
      .catch((err) => {
        if (!axios.isCancel(err)) setStatus('error')
      })

    return () => controller.abort()
  }, [page, limit, retryKey])

  /* Keep ?page= and ?limit= in the address bar */
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('page', page)
    url.searchParams.set('limit', limit)
    window.history.replaceState(null, '', url)
  }, [page, limit])

  /* Remember favorites after refresh */
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    } catch {
      // storage full or blocked: favorites just won't persist
    }
  }, [favorites])

  const favoriteIds = useMemo(() => new Set(favorites.map((p) => p.id)), [favorites])

  const source = showFavorites ? favorites : photos
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? source.filter((p) => p.author.toLowerCase().includes(q)) : source
  }, [source, query])

  const activeIndex = visible.findIndex((p) => p.id === activeId)
  const activePhoto = activeIndex >= 0 ? visible[activeIndex] : null
  const hasMore = photos.length === limit

  const toggleFavorite = useCallback((photo) => {
    setFavorites((prev) =>
      prev.some((p) => p.id === photo.id)
        ? prev.filter((p) => p.id !== photo.id)
        : [photo, ...prev],
    )
  }, [])
  const openPhoto = useCallback((id) => setActiveId(id), [])
  const closePhoto = useCallback(() => setActiveId(null), [])

  const goToPage = (next) => {
    if (next < 1) return
    setActiveId(null)
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const changeLimit = (next) => {
    setLimit(next)
    setPage(1)
  }

  /* ------------------------ what to show in the body ------------------------ */
  let content
  if (!showFavorites && status === 'loading') {
    content = (
      <div className={GRID} aria-busy='true'>
        {Array.from({ length: limit }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  } else if (!showFavorites && status === 'error') {
    content = (
      <Message
        icon={ImageOff}
        title="Photos didn't load"
        text='Check your internet connection and try again.'
        action={
          <ActionButton onClick={() => setRetryKey((k) => k + 1)}>
            <RefreshCw size={16} />
            Try again
          </ActionButton>
        }
      />
    )
  } else if (visible.length === 0) {
    if (query.trim()) {
      content = (
        <Message
          icon={Search}
          title={`No photographer matches "${query.trim()}"`}
          text={
            showFavorites
              ? 'Try a different name or clear the search.'
              : 'Search only checks the photos on this page. Try a different name or go to another page.'
          }
          action={<ActionButton onClick={() => setQuery('')}>Clear search</ActionButton>}
        />
      )
    } else if (showFavorites) {
      content = (
        <Message
          icon={Heart}
          title='No favorites yet'
          text='Tap the heart on any photo to save it here.'
          action={<ActionButton onClick={() => setShowFavorites(false)}>Browse photos</ActionButton>}
        />
      )
    } else {
      content = (
        <Message
          icon={ImageOff}
          title='No more photos'
          text="You've reached the end of the gallery."
          action={<ActionButton onClick={() => goToPage(1)}>Back to page 1</ActionButton>}
        />
      )
    }
  } else {
    content = (
      <div className={GRID}>
        {visible.map((photo) => (
          <Card
            key={photo.id}
            photo={photo}
            isFavorite={favoriteIds.has(photo.id)}
            onToggleFavorite={toggleFavorite}
            onOpen={openPhoto}
          />
        ))}
      </div>
    )
  }

  const count = showFavorites ? favorites.length : photos.length
  const subtitle = showFavorites
    ? `${count} saved ${count === 1 ? 'photo' : 'photos'}`
    : status === 'success'
      ? `Page ${page}, ${count} photos`
      : 'Loading photos…'

  return (
    <div className='min-h-screen bg-black text-white'>
      <header className='sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-xl'>
        <div className='mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-black'>
              <Camera size={20} />
            </div>
            <h1 className='text-xl font-bold tracking-tight'>Gallery</h1>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <div className='relative flex-1 sm:flex-none'>
              <Search
                size={16}
                className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'
              />
              <input
                type='text'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search photographer'
                aria-label='Search by photographer name'
                className='h-10 w-full rounded-xl bg-white/5 pl-9 pr-9 text-sm text-white placeholder-gray-500 ring-1 ring-white/10 transition focus:outline-none focus:ring-2 focus:ring-amber-400 sm:w-64'
              />
              {query && (
                <button
                  type='button'
                  aria-label='Clear search'
                  onClick={() => setQuery('')}
                  className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:text-white'
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={limit}
              onChange={(e) => changeLimit(Number(e.target.value))}
              aria-label='Photos per page'
              className='h-10 rounded-xl bg-white/5 px-3 text-sm text-gray-200 ring-1 ring-white/10 transition focus:outline-none focus:ring-2 focus:ring-amber-400'
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n} className='bg-neutral-900'>
                  {n} per page
                </option>
              ))}
            </select>

            <button
              type='button'
              aria-pressed={showFavorites}
              onClick={() => {
                setShowFavorites((v) => !v)
                setActiveId(null)
              }}
              className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                showFavorites
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/5 text-gray-200 ring-1 ring-white/10 hover:bg-white/10'
              }`}
            >
              <Heart size={16} className={showFavorites ? 'fill-white' : ''} />
              Favorites
              <span className='rounded-full bg-black/30 px-2 py-0.5 text-xs'>{favorites.length}</span>
            </button>
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-[1600px] px-4 pb-16 pt-8 sm:px-6'>
        <div className='mb-6'>
          <h2 className='text-2xl font-bold tracking-tight sm:text-3xl'>
            {showFavorites ? 'Your favorites' : 'Explore photography'}
          </h2>
          <p className='mt-1 text-sm text-gray-400' aria-live='polite'>
            {subtitle}
            {query.trim() && visible.length > 0 && `. Showing ${visible.length} that match "${query.trim()}"`}
          </p>
        </div>

        {content}

        {!showFavorites && status !== 'error' && (
          <div className='mt-12'>
            <Pagination
              page={page}
              hasMore={hasMore}
              disabled={status === 'loading'}
              onChange={goToPage}
            />
          </div>
        )}
      </main>

      {activePhoto && (
        <Lightbox
          photo={activePhoto}
          hasPrev={activeIndex > 0}
          hasNext={activeIndex < visible.length - 1}
          isFavorite={favoriteIds.has(activePhoto.id)}
          onPrev={() => setActiveId(visible[activeIndex - 1].id)}
          onNext={() => setActiveId(visible[activeIndex + 1].id)}
          onClose={closePhoto}
          onToggleFavorite={() => toggleFavorite(activePhoto)}
        />
      )}
    </div>
  )
}

export default App
