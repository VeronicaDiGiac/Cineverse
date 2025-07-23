import type { CollectionConfig } from 'payload'
import type { PayloadRequest } from 'payload'

export const Review: CollectionConfig = {
  slug: 'review',

  access: {
    create: ({ req }) => req.user?.role === 'admin',
    read: () => true,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },

  fields: [
    // Titolo del film
    {
      name: 'movieTitle',
      type: 'text',
      required: true,
    },

    // Anno di uscita
    {
      name: 'releaseYear',
      type: 'number',
      required: true,
    },

    // Genere del film
    {
      name: 'genre',
      type: 'select',
      required: true,
      options: [
        'Azione',
        'Commedia',
        'Drammatico',
        'Thriller',
        'Horror',
        'Fantasy',
        'Animazione',
        'Documentario',
        'Altro',
      ],
    },

    // Attori principali
    {
      name: 'actors',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },

    // Questa tabella serve per collegare le recensioni al profilo di chi l'ha scritta anche se è gestita da un unico admin. Quindi un admin gestisce tutti i profili degli scrittori. la tabella scrittori deve essere ancora creata, motivo del commento.
    {
      name: 'writer',
      type: 'relationship',
      relationTo: 'writers',
      required: true,
      label: 'Scrittore',
    },

    // Titolo recensione
    {
      name: 'title',
      type: 'text',
      required: true,
    },

    // Contenuto recensione
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Copertina del film',
    },

    // Voti degli utenti (anonimi)
    {
      name: 'votes',
      type: 'number',
      defaultValue: 0,
      // Admin non deve poter inserire voti manuali perchè quello è compito dell utente anonimo lato frontend
      admin: {
        readOnly: true,
      },
    },
  ],
  // Data di pubblicazione automatica
  timestamps: true,

  hooks: {
    beforeChange: [
      async ({ operation, data, req }) => {
        if (operation !== 'create') return data

        if (!req.user) {
          throw new Error('Utente non autenticato')
        }

        // Impedisci che lo stesso scrittore recensisca 2 volte lo stesso film
        const existing = await req.payload.find({
          collection: 'review',
          where: {
            and: [
              { movieTitle: { equals: data.movieTitle } },
              { releaseYear: { equals: data.releaseYear } },
              { writer: { equals: data.writer } },
            ],
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
    // Votazione anonima
    {
      path: '/vote',
      method: 'post',
      handler: async (req: PayloadRequest) => {
        const { id } = req.query
        if (!id || typeof id !== 'string') {
          return Response.json({ error: 'Missing ID' }, { status: 400 })
        }

        const review = await req.payload.findByID({ collection: 'review', id })

        await req.payload.update({
          collection: 'review',
          id,
          data: { votes: (review.votes || 0) + 1 },
        })

        return Response.json({ success: true })
      },
    },

    // Visualizzazione
    // {
    //   path: '/view',
    //   method: 'post',
    //   handler: async (req: PayloadRequest) => {
    //     const { id } = req.query
    //     if (!id || typeof id !== 'string') {
    //       return Response.json({ error: 'Missing ID' }, { status: 400 })
    //     }

    //     const review = await req.payload.findByID({ collection: 'review', id })

    //     await req.payload.update({
    //       collection: 'review',
    //       id,
    //       data: { views: (review.views || 0) + 1 },
    //     })

    //     return Response.json({ success: true })
    //   },
    // },

    // Top recensioni
    {
      path: '/top',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const limit = Number(req.query.limit) || 5

        const mostRead = await req.payload.find({
          collection: 'review',
          sort: '-views',
          limit,
        })

        const mostVoted = await req.payload.find({
          collection: 'review',
          sort: '-votes',
          limit,
        })

        return Response.json({
          mostRead: mostRead.docs,
          mostVoted: mostVoted.docs,
        })
      },
    },

    // Filtro per titolo film
    {
      path: '/byTitle',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { title } = req.query
        if (!title || typeof title !== 'string') {
          return Response.json({ error: 'Missing title' }, { status: 400 })
        }

        const reviews = await req.payload.find({
          collection: 'review',
          where: { movieTitle: { equals: title } },
        })

        return Response.json(reviews)
      },
    },

    // Filtro per genere
    {
      path: '/byGenre',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { genre } = req.query
        if (!genre || typeof genre !== 'string') {
          return Response.json({ error: 'Missing genre' }, { status: 400 })
        }

        const reviews = await req.payload.find({
          collection: 'review',
          where: { genre: { equals: genre } },
        })

        return Response.json(reviews)
      },
    },

    // Filtro per anno
    {
      path: '/byYear',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { year } = req.query
        if (!year) {
          return Response.json({ error: 'Missing year' }, { status: 400 })
        }

        const reviews = await req.payload.find({
          collection: 'review',
          where: { releaseYear: { equals: Number(year) } },
        })

        return Response.json(reviews)
      },
    },
  ],
}
