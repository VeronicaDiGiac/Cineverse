import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users', // 'users' is the slug of your Users collection
      required: true,
    },
    {
      name: 'movie',
      type: 'relationship',
      relationTo: 'movies', // 'movies' is the slug of your Movies collection
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
}
