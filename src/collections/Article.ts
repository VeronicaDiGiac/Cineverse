import type { CollectionConfig } from 'payload'
import type { PayloadRequest } from 'payload'

export const Articles: CollectionConfig = {
  slug: 'articles',

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
      name: 'writer',
      type: 'relationship',
      relationTo: 'writers',
      required: true,
      label: 'Scrittore',
    },
    {
      name: 'articleType',
      type: 'select',
      required: true,
      defaultValue: 'generale',
      options: [
        { label: 'Cinema', value: 'cinema' },
        { label: 'Gossip', value: 'gossip' },
        { label: 'Attualità', value: 'attualita' },
        { label: 'Premi e Festival', value: 'premi' },
        { label: 'Backstage', value: 'backstage' },
        { label: 'Intervista', value: 'intervista' },
        { label: 'Generale', value: 'generale' },
      ],
      label: 'Categoria Articolo',
    },
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
      label: 'Immagine principale dell’articolo',
    },
    {
      name: 'movieTitle',
      type: 'text',
      required: false,
      label: 'Titolo del film (se applicabile)',
    },
    {
      name: 'actors',
      type: 'array',
      required: false,
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
      required: false,
    },
    {
      name: 'genre',
      type: 'select',
      hasMany: true,
      required: false,
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

  timestamps: true,

  endpoints: [
    // Filtro per attore
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
          sort: '-createdAt',
        })

        return Response.json(articles)
      },
    },

    // Filtro per regista
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
          sort: '-createdAt',
        })

        return Response.json(articles)
      },
    },

    // Filtro per genere
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
          sort: '-createdAt',
        })

        return Response.json(articles)
      },
    },

    // Filtro per tipo articolo
    {
      path: '/byType',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { type } = req.query

        if (!type) {
          return Response.json({ error: 'Missing type' }, { status: 400 })
        }

        const articles = await req.payload.find({
          collection: 'articles',
          where: { articleType: { equals: type } },
          sort: '-createdAt',
        })

        return Response.json(articles)
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Solo se il documento è stato aggiornato (non creato)
        if (operation !== 'update') return

        const writerId = doc.writer
        if (!writerId) return

        // Prendi tutte le review scritte da questo autore
        const reviews = await req.payload.find({
          collection: 'articles',
          where: { writer: { equals: writerId } },
        })

        // Somma voti e conteggio
        const voteTotal = reviews.docs.reduce((sum, r) => sum + (r.votes || 0), 0)
        const voteCount = reviews.docs.length

        // Aggiorna lo scrittore
        await req.payload.update({
          collection: 'writers',
          id: writerId,
          data: {
            voteTotal,
            voteCount,
          },
        })
      },
    ],
  },
}
