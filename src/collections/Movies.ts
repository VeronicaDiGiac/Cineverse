import type { CollectionConfig } from 'payload'
import type { PayloadRequest } from 'payload'
import { headersWithCors } from 'payload'

export const Movies: CollectionConfig = {
  slug: 'movies',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'releaseYear',
      type: 'number',
      required: true,
    },
    {
      name: 'director',
      type: 'text',
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Image',
    },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      label: 'Video File',
    },
    // {
    //   name: 'coverUrl',
    //   type: 'text',
    //   label: 'Cover Image URL',
    // },
    // {
    //   name: 'videoUrl',
    //   type: 'text',
    //   label: 'Video URL',
    // }, qui bisogna considerare se l'asciare la relazione con media anche a video oppure no
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
      required: true,
    },
  ],
  timestamps: true, // per createdAt e updatedAt automatici
  endpoints: [
    {
      path: '/searchByTitle',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { title } = req.query

        if (!title || typeof title !== 'string') {
          return Response.json(
            { message: 'Missing or invalid title' },
            { status: 400, headers: headersWithCors({ headers: new Headers(), req }) },
          )
        }

        const movies = await req.payload.find({
          collection: 'movies',
          where: {
            title: { equals: title },
          },
        })

        return Response.json(movies, {
          headers: headersWithCors({ headers: new Headers(), req }),
        })
      },
    },
    {
      path: '/searchByActor',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        try {
          const { actorName } = req.query

          if (!actorName || typeof actorName !== 'string') {
            return Response.json(
              { message: 'Missing or invalid actorName query parameter' },
              { status: 400, headers: headersWithCors({ headers: new Headers(), req }) },
            )
          }

          const movies = await req.payload.find({
            collection: 'movies',
            where: {
              'actors.actorName': {
                equals: actorName,
              },
            },
            limit: 50,
          })

          return Response.json(movies, {
            headers: headersWithCors({ headers: new Headers(), req }),
          })
        } catch (error) {
          return Response.json(
            { error: 'Internal server error' },
            { status: 500, headers: headersWithCors({ headers: new Headers(), req }) },
          )
        }
      },
    },
    {
      path: '/searchByGenre',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { genre } = req.query

        if (!genre || typeof genre !== 'string') {
          return Response.json(
            { message: 'Missing or invalid genre' },
            { status: 400, headers: headersWithCors({ headers: new Headers(), req }) },
          )
        }

        const movies = await req.payload.find({
          collection: 'movies',
          where: {
            genre: { equals: genre },
          },
        })

        return Response.json(movies, {
          headers: headersWithCors({ headers: new Headers(), req }),
        })
      },
    },
    {
      path: '/searchByYear',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { releaseYear } = req.query

        if (!releaseYear || isNaN(Number(releaseYear))) {
          return Response.json(
            { message: 'Missing or invalid releaseYear' },
            { status: 400, headers: headersWithCors({ headers: new Headers(), req }) },
          )
        }

        const movies = await req.payload.find({
          collection: 'movies',
          where: {
            releaseYear: { equals: Number(releaseYear) },
          },
        })

        return Response.json(movies, {
          headers: headersWithCors({ headers: new Headers(), req }),
        })
      },
    },
    {
      path: '/searchByDirector',
      method: 'get',
      handler: async (req: PayloadRequest) => {
        const { director } = req.query

        if (!director || typeof director !== 'string') {
          return Response.json(
            { message: 'Missing or invalid director' },
            { status: 400, headers: headersWithCors({ headers: new Headers(), req }) },
          )
        }

        const movies = await req.payload.find({
          collection: 'movies',
          where: {
            director: { equals: director },
          },
        })

        return Response.json(movies, {
          headers: headersWithCors({ headers: new Headers(), req }),
        })
      },
    },
  ],
}
