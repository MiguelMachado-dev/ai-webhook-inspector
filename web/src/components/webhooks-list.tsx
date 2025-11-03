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
    const response = await fetch('http://localhost:3333/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhookIds: checkedWebhooksIds,
      }),
    })

    type GenerateResponse = {
      code: string
    }

    const data: GenerateResponse = await response.json()

    // Remove ```typescruot and ``` if present
    const cleanedCode = data.code
      .replace(/```typescript\n/, '')
      .replace(/```/g, '')

    setGeneratedHandlerCode(cleanedCode)
  }

  const hasAnyCheckedWebhooks = checkedWebhooksIds.length > 0

  return (
    <>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
        <div className="space-y-1 p-2">
          <button
            disabled={!hasAnyCheckedWebhooks}
            className="w-full bg-indigo-400 mb-3 cursor-pointer text-white rounded-lg flex items-center justify-center gap-3 font-medium text-sm py-2 disabled:opacity-50 hover:bg-indigo-500 transition-colors duration-200"
            type="button"
            onClick={handleGenerateHandler}
          >
            Gerar handler
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

      {generatedHandlerCode && (
        <Dialog.Root
          open={true}
          onOpenChange={() => setGeneratedHandlerCode('')}
        >
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-20" />
          <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[80vh] w-[90vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border-zinc-800 rounded-lg p-6 shadow-lg overflow-auto z-30 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
            <Dialog.Title className="text-lg font-medium mb-4">
              Generated Handler Code
            </Dialog.Title>
            <CodeBlock language="typescript" code={generatedHandlerCode} />
            <Dialog.Close className="mt-4 inline-block bg-indigo-400 cursor-pointer text-white rounded-lg px-4 py-2 hover:bg-indigo-500 transition-colors duration-200">
              Close
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>
      )}
    </>
  )
}

export default WebhooksList
