import type { CollectionConfig } from 'payload'
import type { PayloadRequest } from 'payload'
import { headersWithCors } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',

  admin: {
    useAsTitle: 'title',
    hidden: ({ user }) => user?.role !== 'admin',
  },

  access: {
    create: ({ req }) => req.user?.role === 'admin',
    read: () => true,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },

  fields: [
    {
      name: 'movie',
      type: 'relationship',
      relationTo: 'movies',
      required: true,
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true, // blocca editing manuale da admin panel
      },
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
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'votes',
      type: 'number',
      defaultValue: 0,
    },
  ],

  timestamps: true,

  hooks: {
    beforeChange: [
      async ({ operation, data, req }) => {
        if (operation !== 'create') return data

        if (!req.user) {
          throw new Error('Utente non autenticato')
        }

        data.createdBy = req.user.id

        const existing = await req.payload.find({
          collection: 'reviews',
          where: {
            and: [{ movie: { equals: data.movie } }, { createdBy: { equals: req.user.id } }],
          },
        })

        if (existing.totalDocs > 0) {
          throw new Error('Hai già recensito questo film.')
        }

        return data
      },
    ],
  },
  endpoints: [
    // Filtra per ID movie
    {
      path: '/byMovie',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { movieId } = req.query
        if (!movieId || typeof movieId !== 'string') {
          return Response.json({ error: 'Missing movieId' }, { status: 400 })
        }

        const reviews = await req.payload.find({
          collection: 'reviews',
          where: { movie: { equals: movieId } },
          depth: 1,
          sort: '-createdAt',
        })

        return Response.json(reviews)
      },
    },

    // Filtra per anno
    {
      path: '/byYear',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { year } = req.query
        if (!year) {
          return Response.json({ error: 'Missing year' }, { status: 400 })
        }

        const movies = await req.payload.find({
          collection: 'movies',
          where: { releaseYear: { equals: Number(year) } },
        })

        const movieIds = movies.docs.map((m) => m.id)

        const reviews = await req.payload.find({
          collection: 'reviews',
          where: { movie: { in: movieIds } },
          depth: 1,
        })

        return Response.json(reviews)
      },
    },

    // Filtra per regista
    {
      path: '/byDirector',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { director } = req.query
        if (!director) {
          return Response.json({ error: 'Missing director' }, { status: 400 })
        }

        const movies = await req.payload.find({
          collection: 'movies',
          where: { director: { equals: director } },
        })

        const movieIds = movies.docs.map((m) => m.id)

        const reviews = await req.payload.find({
          collection: 'reviews',
          where: { movie: { in: movieIds } },
          depth: 1,
        })

        return Response.json(reviews)
      },
    },

    // Filtra per genere
    {
      path: '/byGenre',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { genre } = req.query
        if (!genre) {
          return Response.json({ error: 'Missing genre' }, { status: 400 })
        }

        const movies = await req.payload.find({
          collection: 'movies',
          where: { genre: { contains: genre } },
        })

        const movieIds = movies.docs.map((m) => m.id)

        const reviews = await req.payload.find({
          collection: 'reviews',
          where: { movie: { in: movieIds } },
          depth: 1,
        })

        return Response.json(reviews)
      },
    },

    // Filtra per titolo film
    {
      path: '/byTitle',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { title } = req.query
        if (!title) {
          return Response.json({ error: 'Missing title' }, { status: 400 })
        }

        const movies = await req.payload.find({
          collection: 'movies',
          where: { title: { equals: title } },
        })

        const movieIds = movies.docs.map((m) => m.id)

        const reviews = await req.payload.find({
          collection: 'reviews',
          where: { movie: { in: movieIds } },
          depth: 1,
        })

        return Response.json(reviews)
      },
    },

    // Vota
    {
      path: '/vote',
      method: 'post',
      handler: async (req: PayloadRequest) => {
        const { id } = req.query
        if (!id || typeof id !== 'string') {
          return Response.json({ error: 'Missing ID' }, { status: 400 })
        }

        const review = await req.payload.findByID({ collection: 'reviews', id })
        await req.payload.update({
          collection: 'reviews',
          id,
          data: { votes: (review.votes || 0) + 1 },
        })

        return Response.json({ success: true })
      },
    },

    // Visualizzazione
    {
      path: '/view',
      method: 'post',
      handler: async (req: PayloadRequest) => {
        const { id } = req.query
        if (!id || typeof id !== 'string') {
          return Response.json({ error: 'Missing ID' }, { status: 400 })
        }

        const review = await req.payload.findByID({ collection: 'reviews', id })
        await req.payload.update({
          collection: 'reviews',
          id,
          data: { views: (review.views || 0) + 1 },
        })

        return Response.json({ success: true })
      },
    },
  ],
}
