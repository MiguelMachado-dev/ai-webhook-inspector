import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateText } from 'ai'
import { inArray } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'
import { webhooks } from '@/db/schema'

const zai = createOpenAICompatible({
  apiKey: process.env.ZAI_API_KEY!,
  baseURL: 'https://api.z.ai/api/coding/paas/v4',
  name: 'glm-4.6',
})

export const generateHandler: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/api/generate',
    {
      schema: {
        summary: 'Generate a TypeScript handler',
        tags: ['Webhooks'],
        body: z.object({
          webhookIds: z.array(z.uuidv7()),
        }),
        response: {
          201: z.object({
            code: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const model = zai('glm-4.6')
      const { webhookIds } = request.body

      const result = await db
        .select({
          body: webhooks.body,
        })
        .from(webhooks)
        .where(inArray(webhooks.id, webhookIds))

      const webhooksBodies = result.map((webhook) => webhook.body).join('\n\n')

      const { text } = await generateText({
        model,
        prompt: `
        Generate a TypeScript function that serves as a handler for multiple webhook events. The function should accept a request body containing different webhooks.

        The function should handle the following webhook events with the example payloads:

        """
        ${webhooksBodies}
        """

        The generated code should include:

        - A main function that takes the webhook request body as input.
        - Zod schemas for each event type.
        - Logic to handle each event based on the validated data.
        - Appropriate error handling for invalid payloads.

        ---

        Return only the code, only the code, and DO NOT return \`\`\`typescript - or any other markdown symbols, do not include any introduction, or text before or after the code.
        `.trim(),
      })

      return reply.status(201).send({ code: text })
    },
  )
}
