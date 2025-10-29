import { db } from '.'
import { webhooks } from './schema'
import { faker } from '@faker-js/faker/locale/pt_BR'

async function seed() {
  console.log('🌱 Inserindo webhooks simulados do Stripe...')

  const stripeEvents = [
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'payment_intent.canceled',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'invoice.finalized',
    'invoice.created',
    'customer.created',
    'customer.updated',
    'customer.deleted',
    'subscription.created',
    'subscription.updated',
    'subscription.deleted',
    'checkout.session.completed',
    'charge.succeeded',
    'charge.failed',
    'charge.dispute.created',
    'payment_method.attached',
    'setup_intent.succeeded',
    'setup_intent.setup_failed',
    'invoice.upcoming',
    'customer.subscription.trial_will_end',
    'customer.subscription.deleted',
    'payment_intent.requires_action',
    'invoice.marked_uncollectible',
    'charge.succeeded',
    'charge.pending',
    'charge.refunded',
    'payment_intent.processing',
    'invoice.payment_action_required',
    'customer.source.created',
    'customer.source.deleted',
    'payment_intent.requires_capture',
    'checkout.session.expired',
    'issuing_card.created',
    'issuing_card.updated',
    'issuing_transaction.created',
    'radar.early_fraud_warning.created',
    'payment_intent.amount_capturable_updated',
    'person.created',
    'person.updated',
    'person.deleted',
    'account.external_account.created',
    'account.external_account.deleted',
    'transfer.created',
    'transfer.failed',
    'transfer.paid',
    'payout.created',
    'payout.paid',
    'payout.failed',
    'balance.available',
    'application_fee.created',
    'application_fee.refunded',
    'invoice.sent',
    'customer.discount.created',
    'customer.discount.deleted',
    'subscription_schedule.created',
    'subscription_schedule.released',
    'product.created',
    'product.updated',
    'product.deleted',
    'price.created',
    'price.updated',
    'price.deleted',
  ]

  const webhookData = Array.from({ length: 65 }, (_, index) => {
    const eventType =
      stripeEvents[faker.number.int({ min: 0, max: stripeEvents.length - 1 })]
    const webhookId = `webhook_${faker.string.alphanumeric({ length: 24 })}`
    const eventId = `evt_${faker.string.alphanumeric({ length: 24 })}`
    const timestamp = faker.date.past({ years: 1 })

    // Criar corpo do webhook baseado no tipo de evento
    let body: string

    switch (eventType) {
      case 'payment_intent.succeeded':
        body = JSON.stringify({
          id: eventId,
          object: 'event',
          api_version: '2023-10-16',
          created: Math.floor(timestamp.getTime() / 1000),
          type: eventType,
          data: {
            object: {
              id: `pi_${faker.string.alphanumeric({ length: 24 })}`,
              object: 'payment_intent',
              amount: faker.number.int({ min: 100, max: 100000 }),
              currency: 'brl',
              status: 'succeeded',
              payment_method: `pm_${faker.string.alphanumeric({ length: 24 })}`,
              customer: `cus_${faker.string.alphanumeric({ length: 14 })}`,
              created: Math.floor(timestamp.getTime() / 1000),
              metadata: {
                order_id: faker.string.alphanumeric({ length: 10 }),
                description: faker.commerce.productName(),
              },
            },
          },
        })
        break

      case 'invoice.payment_succeeded':
        body = JSON.stringify({
          id: eventId,
          object: 'event',
          api_version: '2023-10-16',
          created: Math.floor(timestamp.getTime() / 1000),
          type: eventType,
          data: {
            object: {
              id: `in_${faker.string.alphanumeric({ length: 24 })}`,
              object: 'invoice',
              amount_paid: faker.number.int({ min: 100, max: 100000 }),
              amount_due: faker.number.int({ min: 100, max: 100000 }),
              currency: 'brl',
              status: 'paid',
              customer: `cus_${faker.string.alphanumeric({ length: 14 })}`,
              subscription: `sub_${faker.string.alphanumeric({ length: 14 })}`,
              period_end: Math.floor(timestamp.getTime() / 1000) + 2592000,
              period_start: Math.floor(timestamp.getTime() / 1000),
              lines: {
                data: [
                  {
                    price: {
                      id: `price_${faker.string.alphanumeric({ length: 24 })}`,
                      unit_amount: faker.number.int({ min: 1000, max: 50000 }),
                      currency: 'brl',
                      recurring: {
                        interval: 'month',
                      },
                      product: `prod_${faker.string.alphanumeric({ length: 14 })}`,
                    },
                    quantity: 1,
                  },
                ],
              },
            },
          },
        })
        break

      case 'customer.created':
        body = JSON.stringify({
          id: eventId,
          object: 'event',
          api_version: '2023-10-16',
          created: Math.floor(timestamp.getTime() / 1000),
          type: eventType,
          data: {
            object: {
              id: `cus_${faker.string.alphanumeric({ length: 14 })}`,
              object: 'customer',
              email: faker.internet.email(),
              name: faker.person.fullName(),
              phone: faker.phone.number(),
              description: faker.lorem.sentence(),
              currency: 'brl',
              created: Math.floor(timestamp.getTime() / 1000),
              metadata: {
                source: 'website',
                utm_campaign: faker.lorem.word(),
              },
            },
          },
        })
        break

      case 'charge.failed':
        body = JSON.stringify({
          id: eventId,
          object: 'event',
          api_version: '2023-10-16',
          created: Math.floor(timestamp.getTime() / 1000),
          type: eventType,
          data: {
            object: {
              id: `ch_${faker.string.alphanumeric({ length: 24 })}`,
              object: 'charge',
              amount: faker.number.int({ min: 100, max: 100000 }),
              currency: 'brl',
              status: 'failed',
              failure_code: 'card_declined',
              failure_message: 'Your card was declined.',
              payment_method: `pm_${faker.string.alphanumeric({ length: 24 })}`,
              customer: `cus_${faker.string.alphanumeric({ length: 14 })}`,
              created: Math.floor(timestamp.getTime() / 1000),
            },
          },
        })
        break

      default:
        body = JSON.stringify({
          id: eventId,
          object: 'event',
          api_version: '2023-10-16',
          created: Math.floor(timestamp.getTime() / 1000),
          type: eventType,
          data: {
            object: {
              id: `${eventType.includes('subscription') ? 'sub_' : 'obj_'}${faker.string.alphanumeric({ length: 24 })}`,
              object: eventType.split('.')[0],
              created: Math.floor(timestamp.getTime() / 1000),
              metadata: {
                generated: true,
                event_type: eventType,
              },
            },
          },
        })
    }

    return {
      method: 'POST',
      pathname: '/webhooks/stripe',
      ip: faker.internet.ipv4(),
      statusCode: 200,
      contentType: 'application/json',
      contentLength: Buffer.byteLength(body),
      queryParams: {},
      headers: {
        'stripe-signature': `t=${Math.floor(timestamp.getTime() / 1000)},v1=${faker.string.alphanumeric({ length: 128 })},v0=${faker.string.alphanumeric({ length: 128 })}`,
        'content-type': 'application/json',
        'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
        'stripe-version': '2023-10-16',
        'content-length': String(Buffer.byteLength(body)),
        'x-forwarded-for': faker.internet.ipv4(),
        host: 'webhook.inspector.com',
        connection: 'close',
        accept: '*/*',
      },
      body,
      createdAt: timestamp,
    }
  })

  // Inserir webhooks em ordem cronológica
  webhookData.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  await db.insert(webhooks).values(webhookData)

  console.log(
    `✅ ${webhookData.length} webhooks do Stripe inseridos com sucesso!`,
  )
}

seed().catch(console.error)
