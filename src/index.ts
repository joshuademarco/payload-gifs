// Server-side feature export
export { GifFeature } from './feature.server'

// Client-side feature export  
export { default as GifClientFeature } from './feature.client'

// Component exports for custom usage
export { GifComponent } from './component/GifComponent'
export { GifDialog } from './component/GifDialog'

// Node exports
export { GifNode, $createGifNode, $isGifNode } from './nodes/GifNode'
export type { GifNodeData, SerializedGifNode } from './nodes/GifNode'

// Icon export
export { GifIcon } from './icons/GifIcon'

// Plugin exports
export { GifPlugin, INSERT_GIF_COMMAND } from './plugin/GifPlugin'