import type { CollectionConfig } from 'payload'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: { useAsTitle: 'id' },

  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'review',
      type: 'relationship',
      relationTo: 'reviews',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'parentComment',
      type: 'relationship',
      relationTo: 'comments',
      required: false,
      admin: {
        description: 'Commento a cui si risponde (lascia vuoto se principale)',
      },
    },
    {
      name: 'taggedUsers',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
    },
  ],

  timestamps: true,
}
