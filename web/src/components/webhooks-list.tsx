import * as Dialog from '@radix-ui/react-dialog'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { webhookListSchema } from '../http/schemas/webhooks'
import CodeBlock from './ui/code-block'
import WebhooksListItem from './webhooks-list-item'

const WebhooksList = () => {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver>(null)
  const [checkedWebhooksIds, setCheckedWebhooksIds] = useState<string[]>([])
  const [generatedHandlerCode, setGeneratedHandlerCode] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ['webhooks'],
      queryFn: async ({ pageParam }) => {
        const url = new URL('http://localhost:3333/api/webhooks')

        if (pageParam) {
          url.searchParams.set('cursor', pageParam)
        }

        const webhooksList = await fetch(url)
        const data = await webhooksList.json()

        return webhookListSchema.parse(data)
      },
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor ?? undefined
      },
      initialPageParam: undefined as string | undefined,
    })

  const webhooks = data.pages.flatMap((page) => page.webhooks)

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        threshold: 0.1,
      },
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  function handleCheckWebhook(webhookId: string) {
    if (checkedWebhooksIds.includes(webhookId)) {
      setCheckedWebhooksIds((state) => {
        return state.filter((id) => id !== webhookId)
      })
    } else {
      setCheckedWebhooksIds((state) => [...state, webhookId])
    }
  }

  async function handleGenerateHandler() {
    setIsGenerating(true)
    setGeneratedHandlerCode('') // Clear previous code

    try {
      const response = await fetch('http://localhost:3333/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhookIds: checkedWebhooksIds,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available for response body')
      }

      const decoder = new TextDecoder()
      let generatedCode = ''

      // Read the stream
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        generatedCode += chunk

        // Update the state with the current accumulated text
        setGeneratedHandlerCode(generatedCode)
      }

      const finalChunk = decoder.decode()
      if (finalChunk) {
        generatedCode += finalChunk
        setGeneratedHandlerCode(generatedCode)
      }

      // Clean up the code after streaming is complete
      const cleanedCode = generatedCode
        .replace(/```typescript\n/, '')
        .replace(/```/g, '')

      setGeneratedHandlerCode(cleanedCode)
    } catch (error) {
      console.error('Error generating handler:', error)
      setGeneratedHandlerCode(
        '// Error generating handler code. Please try again.',
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const hasAnyCheckedWebhooks = checkedWebhooksIds.length > 0

  return (
    <>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
        <div className="space-y-1 p-2">
          <button
            disabled={!hasAnyCheckedWebhooks || isGenerating}
            className="w-full bg-indigo-400 mb-3 cursor-pointer text-white rounded-lg flex items-center justify-center gap-3 font-medium text-sm py-2 disabled:opacity-50 hover:bg-indigo-500 transition-colors duration-200"
            type="button"
            onClick={handleGenerateHandler}
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Gerando handler...
              </>
            ) : (
              'Gerar handler'
            )}
          </button>
          {webhooks.map((webhook) => {
            return (
              <WebhooksListItem
                key={webhook.id}
                webhook={webhook}
                onWebhookChecked={handleCheckWebhook}
                isWebhookChecked={checkedWebhooksIds.includes(webhook.id)}
              />
            )
          })}
        </div>

        {hasNextPage && (
          <div className="p-2" ref={loadMoreRef}>
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-2 ">
                <Loader2 className="size-5 animate-spin text-zinc-500" />
              </div>
            )}
          </div>
        )}
      </div>

      {(generatedHandlerCode || isGenerating) && (
        <Dialog.Root
          open={true}
          onOpenChange={() => {
            if (!isGenerating) {
              setGeneratedHandlerCode('')
            }
          }}
        >
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-20" />
          <Dialog.Content
            aria-describedby="generated-handler-code"
            className="fixed top-1/2 left-1/2 max-h-[80vh] w-[90vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border-zinc-700 rounded-lg p-6 shadow-lg overflow-auto z-30 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-zinc-700 scrollbar-track-zinc-900"
          >
            <Dialog.Title className="text-lg font-medium mb-4 flex items-center gap-2">
              {isGenerating && (
                <Loader2 className="size-5 animate-spin text-indigo-400" />
              )}
              {isGenerating
                ? 'Generating Handler Code...'
                : 'Generated Handler Code'}
            </Dialog.Title>
            <CodeBlock
              language="typescript"
              code={generatedHandlerCode || '// Generating code...'}
            />
            <Dialog.Close
              className="mt-4 inline-block bg-indigo-400 cursor-pointer text-white rounded-lg px-4 py-2 hover:bg-indigo-500 transition-colors duration-200 disabled:opacity-50"
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Close'}
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>
      )}
    </>
  )
}

export default WebhooksList
