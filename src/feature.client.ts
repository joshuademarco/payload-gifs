'use client'

import { createClientFeature, toolbarAddDropdownGroupWithItems } from '@payloadcms/richtext-lexical/client'
import { $isRangeSelection } from '@payloadcms/richtext-lexical/lexical'

import { GifIcon } from './icons/GifIcon'
import { GifNode } from './nodes/GifNode'
import { GifPlugin, INSERT_GIF_COMMAND } from './plugin/GifPlugin'

export default createClientFeature({
  nodes: [GifNode],
  plugins: [
    {
      Component: GifPlugin,
      position: 'normal',
    },
  ],
  toolbarFixed: {
    groups: [
      toolbarAddDropdownGroupWithItems([
        {
          ChildComponent: GifIcon,
          isActive: ({ selection }) => {
            if (!$isRangeSelection(selection)) {
              return false
            }

            const nodes = selection.getNodes()
            return nodes.some((node) => node instanceof GifNode)
          },
          isEnabled: ({ selection }) => {
            return $isRangeSelection(selection)
          },
          key: 'gif',
          label: ({ i18n }) => i18n.t('lexical:gif:label'),
          onSelect: ({ editor }) => {
            editor.dispatchCommand(INSERT_GIF_COMMAND, undefined)
          },
        },
      ]),
    ],
  },
})
