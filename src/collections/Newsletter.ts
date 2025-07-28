import { CollectionConfig } from 'payload'
import { sendConfirmationEmail } from '../app/utils/sendConfirmationEmail'
import type { PayloadRequest } from 'payload'

export const Newsletter: CollectionConfig = {
  slug: 'newsletter',
  access: {
    create: () => true,
    read: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      validate: (val) =>
        typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
          ? true
          : 'Inserisci un indirizzo email valido',
    },
    {
      name: 'confirmed',
      type: 'checkbox',
      defaultValue: false,
      admin: { readOnly: true },
    },
  ],
  timestamps: true,

  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        if (operation !== 'create') return

        // Invia email di conferma solo se non è già confermato
        if (!doc.confirmed) {
          await sendConfirmationEmail(doc.email)
        }
      },
    ],
  },
  endpoints: [
    {
      path: '/confirm',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { email } = req.query

        if (!email || typeof email !== 'string') {
          return Response.json({ error: 'Missing email' }, { status: 400 })
        }

        const entry = await req.payload.find({
          collection: 'newsletter',
          where: { email: { equals: email } },
        })

        if (!entry.totalDocs) {
          return Response.json({ error: 'Email non trovata' }, { status: 404 })
        }

        const doc = entry.docs[0]

        if (doc.confirmed) {
          return Response.json({ message: 'Già confermata' })
        }

        await req.payload.update({
          collection: 'newsletter',
          id: doc.id,
          data: { confirmed: true },
        })

        return Response.json({ message: 'Iscrizione confermata con successo' })
      },
    },
  ],
}
