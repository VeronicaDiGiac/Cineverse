import type { CollectionConfig } from 'payload'
import type { PayloadRequest } from 'payload'
import { headersWithCors } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    create: ({ req }) => !!req.user, // chiunque loggato può creare
    read: () => true, // tutti possono leggere
    update: ({ req }) => req.user?.role === 'admin', // solo admin può aggiornare
    delete: ({ req }) => req.user?.role === 'admin', // solo admin può cancellare
  },
  hooks: {
    beforeChange: [
      async ({ operation, data, req }) => {
        if (operation === 'create') {
          if (!req.user) {
            throw new Error('Utente non autenticato')
          }

          const existing = await req.payload.find({
            collection: 'reviews',
            where: {
              and: [{ user: { equals: req.user.id } }, { movie: { equals: data.movie } }],
            },
          })

          if (existing.totalDocs > 0) {
            throw new Error('Hai già recensito questo film.')
          }

          // Associa automaticamente l'utente alla recensione
          data.user = req.user.id
        }

        return data
      },
    ],
    beforeOperation: [
      async ({ operation, req, args }) => {
        if (!req.user || req.user.role === 'admin') return

        if (['update', 'delete'].includes(operation)) {
          const review = await req.payload.findByID({
            collection: 'reviews',
            id: args?.id,
          })

          const reviewUser = typeof review.user === 'object' ? review.user.id : review.user

          if (!review || reviewUser !== req.user.id) {
            throw new Error('Non hai i permessi per modificare o cancellare questa recensione.')
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      access: {
        update: ({ req }) => req.user?.role === 'admin', // solo admin può cambiare autore
      },
    },
    {
      name: 'movie',
      type: 'relationship',
      relationTo: 'movies',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      required: true,
    },
  ],
  timestamps: true,

  endpoints: [
    {
      path: '/byMovie',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { movieId } = req.query

        if (!movieId || typeof movieId !== 'string') {
          return Response.json(
            { message: 'Missing or invalid movieId' },
            { status: 400, headers: headersWithCors({ headers: new Headers(), req }) },
          )
        }

        const reviews = await req.payload.find({
          collection: 'reviews',
          where: {
            movie: { equals: movieId },
          },
          sort: '-createdAt',
        })

        return Response.json(reviews, {
          headers: headersWithCors({ headers: new Headers(), req }),
        })
      },
    },
  ],
}
