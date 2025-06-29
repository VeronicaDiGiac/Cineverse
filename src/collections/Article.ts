import type { CollectionConfig } from 'payload'
import type { PayloadRequest } from 'payload'
import { headersWithCors } from 'payload'

export const Articles: CollectionConfig = {
  slug: 'articles',
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
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'movie',
      type: 'relationship',
      relationTo: 'movies',
      required: false,
    },
    {
      name: 'actors',
      type: 'array',
      fields: [
        {
          name: 'actorName',
          type: 'text',
        },
      ],
    },
    {
      name: 'director',
      type: 'text',
    },
    {
      name: 'genre',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Drammatico', value: 'drammatico' },
        { label: 'Storico', value: 'storico' },
        { label: 'Fantascienza', value: 'fantascienza' },
        { label: 'Commedia', value: 'commedia' },
        { label: 'Azione', value: 'azione' },
        { label: 'Avventura', value: 'avventura' },
        { label: 'Horror', value: 'horror' },
        { label: 'Thriller', value: 'thriller' },
        { label: 'Giallo', value: 'giallo' },
        { label: 'Romantico', value: 'romantico' },
        { label: 'Animazione', value: 'animazione' },
        { label: 'Documentario', value: 'documentario' },
        { label: 'Musicale', value: 'musicale' },
        { label: 'Fantasy', value: 'fantasy' },
        { label: 'Biografico', value: 'biografico' },
        { label: 'Crime', value: 'crime' },
        { label: 'Western', value: 'western' },
        { label: 'Famiglia', value: 'famiglia' },
      ],
    },
  ],

  timestamps: true,

  endpoints: [
    // Filtro per Movie
    {
      path: '/byMovie',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { movieId } = req.query

        if (!movieId) {
          return Response.json({ error: 'Missing movieId' }, { status: 400 })
        }

        const articles = await req.payload.find({
          collection: 'articles',
          where: { movie: { equals: movieId } },
          depth: 1,
        })

        return Response.json(articles)
      },
    },

    // Filtro per Actor
    {
      path: '/byActor',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { actorName } = req.query

        if (!actorName) {
          return Response.json({ error: 'Missing actorName' }, { status: 400 })
        }

        const articles = await req.payload.find({
          collection: 'articles',
          where: { 'actors.actorName': { equals: actorName } },
        })

        return Response.json(articles)
      },
    },

    // Filtro per Director
    {
      path: '/byDirector',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { director } = req.query

        if (!director) {
          return Response.json({ error: 'Missing director' }, { status: 400 })
        }

        const articles = await req.payload.find({
          collection: 'articles',
          where: { director: { equals: director } },
        })

        return Response.json(articles)
      },
    },

    // Filtro per Genre
    {
      path: '/byGenre',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { genre } = req.query

        if (!genre) {
          return Response.json({ error: 'Missing genre' }, { status: 400 })
        }

        const articles = await req.payload.find({
          collection: 'articles',
          where: { genre: { contains: genre } },
        })

        return Response.json(articles)
      },
    },
  ],
}
