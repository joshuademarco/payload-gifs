import type {
  DOMConversionMap,
  DOMConversionOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from '@payloadcms/richtext-lexical/lexical'

import { $applyNodeReplacement, DecoratorNode } from '@payloadcms/richtext-lexical/lexical'
import React from 'react'

export interface GifNodeData {
  src: string
  altText: string
  width?: number | null
  height?: number | null
  giphyId?: string
}

export type SerializedGifNode = Spread<
  {
    src: string
    altText: string
    width?: number | null
    height?: number | null
    giphyId?: string
  },
  SerializedLexicalNode
>

const GifComponent =
  typeof window !== 'undefined'
    ? React.lazy(() =>
        import('../component/GifComponent').then((module) => ({
          default: module.GifComponent,
        })),
      )
    : null

export class GifNode extends DecoratorNode<React.ReactElement> {
  __src: string
  __altText: string
  __width?: number | null
  __height?: number | null
  __giphyId?: string

  static override getType(): string {
    return 'gif'
  }

  static override clone(node: GifNode): GifNode {
    return new GifNode(node.__src, node.__altText, node.__width, node.__height, node.__giphyId, node.__key)
  }

  constructor(src: string, altText: string, width?: number | null, height?: number | null, giphyId?: string, key?: NodeKey) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__width = width
    this.__height = height
    this.__giphyId = giphyId
  }

  override createDOM(): HTMLElement {
    const element = document.createElement('span')
    element.style.display = 'inline-block'
    return element
  }

  override updateDOM(): false {
    return false
  }

  static override importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: $convertGifElement,
        priority: 1,
      }),
    }
  }

  override exportDOM(): { element: HTMLElement } {
    const element = document.createElement('img')
    element.setAttribute('src', this.__src)
    element.setAttribute('alt', this.__altText)
    if (this.__width) element.setAttribute('width', String(this.__width))
    if (this.__height) element.setAttribute('height', String(this.__height))
    return { element }
  }

  static override importJSON(serializedNode: SerializedGifNode): GifNode {
    const { src, altText, width, height, giphyId } = serializedNode
    const node = $createGifNode({
      src,
      altText,
      width,
      height,
      giphyId,
    })
    return node
  }

  override exportJSON(): SerializedGifNode {
    return {
      src: this.getSrc(),
      altText: this.getAltText(),
      width: this.getWidth(),
      height: this.getHeight(),
      giphyId: this.getGiphyId(),
      type: 'gif',
      version: 1,
    }
  }

  getSrc(): string {
    return this.__src
  }

  getAltText(): string {
    return this.__altText
  }

  getWidth(): number | null | undefined {
    return this.__width
  }

  getHeight(): number | null | undefined {
    return this.__height
  }

  getGiphyId(): string | undefined {
    return this.__giphyId
  }

  setSrc(src: string): void {
    const writable = this.getWritable()
    writable.__src = src
  }

  setAltText(altText: string): void {
    const writable = this.getWritable()
    writable.__altText = altText
  }

  setWidth(width: number | null): void {
    const writable = this.getWritable()
    writable.__width = width
  }

  setHeight(height: number | null): void {
    const writable = this.getWritable()
    writable.__height = height
  }

  setGiphyId(giphyId: string): void {
    const writable = this.getWritable()
    writable.__giphyId = giphyId
  }

  override decorate(): React.ReactElement {
    // Server-side rendering fallback
    if (typeof window === 'undefined' || !GifComponent) {
      return React.createElement('img', {
        src: this.__src,
        alt: this.__altText,
        width: this.__width || undefined,
        height: this.__height || undefined,
        style: { maxWidth: '100%', height: 'auto' },
      })
    }

    return (
      <React.Suspense fallback={<div>Loading GIF...</div>}>
        <GifComponent
          src={this.__src}
          altText={this.__altText}
          width={this.__width}
          height={this.__height}
          giphyId={this.__giphyId}
          nodeKey={this.getKey()}
        />
      </React.Suspense>
    )
  }

  override isInline(): false {
    return false
  }

  override isKeyboardSelectable(): boolean {
    return true
  }
}

function $convertGifElement(domNode: Node): DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { src, alt: altText, width, height } = domNode
    // Only convert if it's a GIF or from Giphy
    if (src.includes('.gif') || src.includes('giphy.com') || src.includes('media.giphy.com')) {
      const node = $createGifNode({
        src,
        altText: altText || '',
        width: width ? Number(width) : null,
        height: height ? Number(height) : null,
      })
      return { node }
    }
  }
  return { node: null }
}

export function $createGifNode(data: GifNodeData): GifNode {
  return $applyNodeReplacement(new GifNode(data.src, data.altText, data.width, data.height, data.giphyId))
}

export function $isGifNode(node: LexicalNode | null | undefined): node is GifNode {
  return node instanceof GifNode
}
