import { createServerFeature } from '@payloadcms/richtext-lexical'
import type { LexicalNode, TextNode } from '@payloadcms/richtext-lexical/lexical'
import { $createGifNode, $isGifNode, GifNode, type SerializedGifNode } from './nodes/GifNode'

// Define the TextMatchTransformer type to avoid import issues
interface TextMatchTransformer {
  dependencies: Array<any>
  export?: (node: LexicalNode, exportChildren?: any, exportFormat?: any) => string | null
  regExp: RegExp
  replace?: (node: TextNode, match: RegExpMatchArray) => TextNode | void
  trigger?: string
  type: 'text-match'
}

const GifMarkdownTransformer: TextMatchTransformer = {
  dependencies: [GifNode],
  export: (node: LexicalNode) => {
    if (!$isGifNode(node)) {
      return null
    }
    return `![${node.getAltText()}](${node.getSrc()})`
  },
  regExp: /!\[([^\]]*)\]\(([^)]+)\)/,
  replace: (node: TextNode, match: RegExpMatchArray) => {
    const [, altText, src] = match
    const gifNode = $createGifNode({
      src: String(src),
      altText: String(altText),
      width: null,
      height: null,
    })
    node.replace(gifNode)
  },
  trigger: ')',
  type: 'text-match',
}

export const GifFeature = createServerFeature({
  feature: {
    ClientFeature: '@joshuademarco/payload-gifs/feature.client#default',
    i18n: {
      en: {
        label: 'GIF',
        insertGif: 'Insert GIF',
        searchGifs: 'Search GIFs',
        selectGif: 'Select GIF',
        altText: 'Alt Text',
        cancel: 'Cancel',
        insert: 'Insert',
        poweredByGiphy: 'Powered by GIPHY',
        loading: 'Loading...',
        noResults: 'No results found',
        searchPlaceholder: 'Search for GIFs...',
      },
    },
    markdownTransformers: [GifMarkdownTransformer],
    nodes: [
      {
        node: GifNode,
        converters: {
          html: {
            converter: ({ node }) => {
              const serializedNode = node as SerializedGifNode
              if (serializedNode.type !== 'gif') {
                return ''
              }
              return `<img src="${serializedNode.src}" alt="${serializedNode.altText}" width="${serializedNode.width || 'auto'}" height="${serializedNode.height || 'auto'}" />`
            },
            nodeTypes: [GifNode.getType()],
          },
        },
      },
    ],
  },
  key: 'gif',
})
