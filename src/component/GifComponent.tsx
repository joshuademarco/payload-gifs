'use client'
import React from 'react'

export interface GifComponentProps {
  src: string
  altText: string
  width?: number | null
  height?: number | null
  giphyId?: string
  nodeKey: string
}

export const GifComponent: React.FC<GifComponentProps> = ({ src, altText, width, height }) => {
  const [loaded, setLoaded] = React.useState(false)
  const [error, setError] = React.useState(false)

  const handleLoad = () => {
    setLoaded(true)
  }

  const handleError = () => {
    setError(true)
  }

  if (error) {
    return (
      <div
        className="gif-error"
        style={{
          padding: '20px',
          border: '1px dashed #ccc',
          textAlign: 'center',
          color: '#666',
        }}
      >
        Failed to load GIF
      </div>
    )
  }

  return (
    <div className="gif-container" style={{ display: 'inline-block', position: 'relative' }}>
      {!loaded && (
        <div
          className="gif-loading"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '10px',
            borderRadius: '4px',
          }}
        >
          Loading...
        </div>
      )}
      <img
        src={src}
        alt={altText}
        width={width || undefined}
        height={height || undefined}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          maxWidth: '100%',
          height: 'auto',
          opacity: loaded ? 1 : 0.5,
          transition: 'opacity 0.3s ease',
        }}
      />
    </div>
  )
}
