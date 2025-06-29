import type { CollectionConfig } from 'payload'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: { useAsTitle: 'title' },

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
      fields: [{ name: 'actorName', type: 'text' }],
    },
    {
      name: 'director',
      type: 'text',
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
    },
  ],

  timestamps: true,
}
