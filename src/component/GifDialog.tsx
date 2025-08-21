'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'

interface GiphyGif {
  id: string
  title: string
  images: {
    fixed_width: {
      url: string
      width: string
      height: string
    }
    fixed_width_small: {
      url: string
      width: string
      height: string
    }
    original: {
      url: string
      width: string
      height: string
    }
    preview_gif: {
      url: string
      width: string
      height: string
    }
  }
}

interface GiphyResponse {
  data: GiphyGif[]
  pagination: {
    total_count: number
    count: number
    offset: number
  }
}

interface GifDialogProps {
  onInsert: (gif: { src: string; altText: string; width?: number; height?: number; giphyId?: string }) => void
  onClose: () => void
}

export const GifDialog: React.FC<GifDialogProps> = ({ onInsert, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [gifs, setGifs] = useState<GiphyGif[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastGifRef = useRef<HTMLDivElement | null>(null)
  const lastLoadTime = useRef<number>(0)

  // You'll need to set your Giphy API key here or via environment variable
  const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY
  const LIMIT = 12 // Reduced from 20 to load fewer at a time

  const searchGifs = useCallback(
    async (query: string, currentOffset: number = 0, reset: boolean = true) => {
      if (!GIPHY_API_KEY) {
        setError('Giphy API key not configured')
        return
      }

      setLoading(true)
      setError('')

      try {
        const endpoint = query.trim() ? `https://api.giphy.com/v1/gifs/search` : `https://api.giphy.com/v1/gifs/trending`

        const params = new URLSearchParams({
          api_key: GIPHY_API_KEY,
          limit: LIMIT.toString(),
          offset: currentOffset.toString(),
          rating: 'g',
          lang: 'en',
        })

        if (query.trim()) {
          params.append('q', query.trim())
        }

        const response = await fetch(`${endpoint}?${params}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: GiphyResponse = await response.json()

        if (reset) {
          setGifs(data.data)
        } else {
          setGifs((prev) => [...prev, ...data.data])
        }

        setHasMore(data.data.length === LIMIT)
      } catch (err) {
        console.error('Error fetching GIFs:', err)
        setError('Failed to fetch GIFs. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [GIPHY_API_KEY],
  )

  // Load trending GIFs on mount
  useEffect(() => {
    searchGifs('', 0, true)
  }, [searchGifs])

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        setOffset(0)
        searchGifs(searchTerm, 0, true)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, searchGifs])

  // Infinite scroll observer
  const lastGifElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading || loadingMore) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const now = Date.now()
          // Add 1 second throttle between requests
          if (entries[0]?.isIntersecting && hasMore && !loading && !loadingMore && now - lastLoadTime.current > 1000) {
            lastLoadTime.current = now
            setLoadingMore(true)
            const newOffset = offset + LIMIT
            setOffset(newOffset)
            searchGifs(searchTerm, newOffset, false).finally(() => {
              setLoadingMore(false)
            })
          }
        },
        {
          // Only trigger when 80% of the element is visible (more conservative)
          threshold: 0.8,
          // Only trigger when user is very close to the bottom (100px)
          rootMargin: '0px 0px 100px 0px',
        },
      )

      if (node) observerRef.current.observe(node)
    },
    [loading, loadingMore, hasMore, offset, searchTerm, searchGifs],
  )

  const handleGifSelect = (gif: GiphyGif) => {
    onInsert({
      src: gif.images.original.url,
      altText: gif.title || 'GIF',
      width: parseInt(gif.images.original.width),
      height: parseInt(gif.images.original.height),
      giphyId: gif.id,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <>
      <style>{`
        :root {
          --dialog-bg: #ffffff;
          --dialog-bg-secondary: #f8fafc;
          --dialog-border: #e2e8f0;
          --dialog-text: #1f2937;
          --dialog-text-secondary: #64748b;
          --input-bg: #ffffff;
          --input-border: #d1d5db;
          --input-text: #1f2937;
          --input-placeholder: #9ca3af;
          --scrollbar-track: #f1f5f9;
          --scrollbar-thumb: #cbd5e1;
          --error-bg: #fee2e2;
          --error-text: #dc2626;
          --gif-item-bg: #f8fafc;
          --gif-item-border: #e2e8f0;
        }

        [data-theme='dark'],
        .dark,
        .payload-admin.dark {
          --dialog-bg: #1e293b;
          --dialog-bg-secondary: #0f172a;
          --dialog-border: #475569;
          --dialog-text: #f1f5f9;
          --dialog-text-secondary: #94a3b8;
          --input-bg: #334155;
          --input-border: #64748b;
          --input-text: #f1f5f9;
          --input-placeholder: #64748b;
          --scrollbar-track: #334155;
          --scrollbar-thumb: #64748b;
          --error-bg: #7f1d1d;
          --error-text: #fca5a5;
          --gif-item-bg: #334155;
          --gif-item-border: #475569;
        }

        .gif-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.85));
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease-out;
        }

        .gif-dialog {
          background: var(--dialog-bg);
          border-radius: 16px;
          border: 2px solid var(--dialog-border);
          padding: 0;
          width: 90vw;
          max-width: 900px;
          height: 85vh;
          max-height: 700px;
          display: flex;
          flex-direction: column;
          box-shadow:
            0 25px 50px -12px rgba(0, 0, 0, 0.4),
            0 0 0 1px var(--dialog-border),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .dialog-header {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dialog-title {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .close-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .search-container {
          padding: 24px;
          background: var(--dialog-bg-secondary);
          border-bottom: 1px solid var(--input-border);
        }

        .search-input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid var(--input-border);
          border-radius: 12px;
          font-size: 16px;
          outline: none;
          background: var(--input-bg);
          color: var(--input-text);
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .search-input::placeholder {
          color: var(--input-placeholder);
        }

        .search-input:focus {
          border-color: #667eea;
          box-shadow:
            0 0 0 3px rgba(102, 126, 234, 0.1),
            0 1px 3px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .error-message {
          background: var(--error-bg);
          color: var(--error-text);
          padding: 16px;
          border-radius: 12px;
          margin: 0 24px 16px;
          border-left: 4px solid var(--error-text);
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
        }

        .gifs-container {
          flex: 1;
          overflow-y: auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
          padding: 24px;
          background: var(--dialog-bg);
          align-content: start;
          grid-auto-rows: max-content;
        }

        .gifs-container::-webkit-scrollbar {
          width: 8px;
        }

        .gifs-container::-webkit-scrollbar-track {
          background: var(--scrollbar-track);
          border-radius: 4px;
        }

        .gifs-container::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb);
          border-radius: 4px;
        }

        .gifs-container::-webkit-scrollbar-thumb:hover {
          background: var(--dialog-text-secondary);
        }

        .gif-item {
          cursor: pointer;
          border-radius: 12px;
          overflow: hidden;
          background: var(--gif-item-bg);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          border: 2px solid transparent;
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          width: 100%;
          height: auto;
        }

        .gif-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
          pointer-events: none;
        }

        .gif-item:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.15),
            0 10px 10px -5px rgba(0, 0, 0, 0.1);
          border-color: #667eea;
        }

        .gif-item:hover::before {
          opacity: 1;
        }

        .gif-item:active {
          transform: translateY(-2px) scale(1.01);
        }

        .gif-image {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.3s ease;
          max-height: 200px;
          object-fit: cover;
        }

        .gif-item:hover .gif-image {
          transform: scale(1.05);
        }

        .loading-container {
          padding: 32px;
          text-align: center;
          color: var(--dialog-text-secondary);
          font-weight: 500;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--input-border);
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .dialog-footer {
          padding: 20px 24px;
          text-align: center;
          font-size: 12px;
          color: var(--dialog-text-secondary);
          background: var(--dialog-bg-secondary);
          border-top: 1px solid var(--input-border);
          font-weight: 500;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .gif-dialog {
            width: 95vw;
            height: 90vh;
            border-radius: 12px;
          }

          .gifs-container {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 12px;
            padding: 16px;
          }

          .dialog-header {
            padding: 20px;
          }

          .search-container {
            padding: 20px;
          }

          .dialog-title {
            font-size: 20px;
          }
        }
      `}</style>

      <div
        className="gif-dialog-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div className="gif-dialog">
          {/* Header */}
          <div className="dialog-header">
            <h2 className="dialog-title">Search GIFs</h2>
            <button onClick={onClose} className="close-button">
              ×
            </button>
          </div>

          {/* Search Input */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search for GIFs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* GIFs Grid */}
          <div className="gifs-container">
            {gifs.map((gif, index) => {
              return (
                <div
                  key={gif.id}
                  ref={index === gifs.length - 1 ? lastGifElementRef : undefined}
                  onClick={() => handleGifSelect(gif)}
                  className="gif-item"
                >
                  <img src={gif.images.fixed_width.url} alt={gif.title} className="gif-image" loading="lazy" />
                </div>
              )
            })}
          </div>

          {/* Loading Indicator */}
          {(loading || loadingMore) && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span>{loading ? 'Loading...' : 'Loading more...'}</span>
            </div>
          )}

          {/* Footer */}
          <div className="dialog-footer">Powered by GIPHY</div>
        </div>
      </div>
    </>
  )
}
