import { CollectionConfig } from 'payload'
import type { PayloadRequest } from 'payload'

export const Writers: CollectionConfig = {
  slug: 'writers',
  admin: {
    useAsTitle: 'name', // Mostra il nome nel pannello admin e nei relationship field
  },
  access: {
    create: ({ req }) => req.user?.role === 'admin',
    read: () => true,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nome dello scrittore',
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Biografia',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto profilo',
    },
    {
      name: 'voteCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'voteTotal',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
  ],

  timestamps: true,

  endpoints: [
    {
      path: '/:id/overview',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { id } = req.query

        if (!id || typeof id !== 'string') {
          return Response.json({ error: 'Missing writer ID' }, { status: 400 })
        }

        // 1. Recupera lo scrittore
        const writer = await req.payload.findByID({
          collection: 'writers',
          id,
        })

        if (!writer) {
          return Response.json({ error: 'Writer not found' }, { status: 404 })
        }

        // 2. Recupera articoli scritti
        const articles = await req.payload.find({
          collection: 'articles',
          where: { writer: { equals: id } },
        })

        // 3. Recupera recensioni scritte
        const reviews = await req.payload.find({
          collection: 'review',
          where: { writer: { equals: id } },
        })

        // 4. Calcola media voto
        const voteTotal = writer.voteTotal || 0
        const voteCount = writer.voteCount || 0
        const averageVote = voteCount > 0 ? voteTotal / voteCount : 0

        // 5. Risposta finale
        return Response.json({
          writer: {
            id: writer.id,
            name: writer.name,
            bio: writer.bio,
            photo: writer.photo,
            voteTotal,
            voteCount,
            averageVote,
          },
          articles: articles.docs,
          reviews: reviews.docs,
        })
      },
    },
  ],
}
