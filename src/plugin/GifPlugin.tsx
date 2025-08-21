'use client'
import type { LexicalCommand } from '@payloadcms/richtext-lexical/lexical'
import type { PluginComponent } from '@payloadcms/richtext-lexical'

import { createCommand, COMMAND_PRIORITY_EDITOR } from '@payloadcms/richtext-lexical/lexical'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot } from '@payloadcms/richtext-lexical/lexical/utils'
import { useEffect, useState } from 'react'

import { $createGifNode } from '../nodes/GifNode'
import { GifDialog } from '../component/GifDialog'

export const INSERT_GIF_COMMAND: LexicalCommand<void> = createCommand('INSERT_GIF_COMMAND')

export const GifPlugin: PluginComponent = () => {
  const [editor] = useLexicalComposerContext()
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    return editor.registerCommand(
      INSERT_GIF_COMMAND,
      () => {
        setShowDialog(true)
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  const handleInsertGif = (gifData: { src: string; altText: string; width?: number; height?: number; giphyId?: string }) => {
    editor.update(() => {
      const gifNode = $createGifNode(gifData)
      $insertNodeToNearestRoot(gifNode)
    })
    setShowDialog(false)
  }

  const handleClose = () => {
    setShowDialog(false)
  }

  return <>{showDialog && <GifDialog onInsert={handleInsertGif} onClose={handleClose} />}</>
}
