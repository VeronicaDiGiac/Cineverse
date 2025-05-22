import type { CollectionConfig } from 'payload'

export const Wishlists: CollectionConfig = {
  slug: 'wishlists',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      // Legge solo le wishlist del proprio user id
      return { user: { equals: user.id } }
    },
    create: ({ req: { user } }) => {
      return !!user
    },
    // Questo assicura che un utente possa aggiornare o cancellare solo i documenti che ha creato.
    update: ({ req: { user } }) => {
      if (!user) return false
      return { user: { equals: user.id } }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return { user: { equals: user.id } }
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true, // così in admin non si può cambiare manualmente
      },
    },
    {
      name: 'movie',
      type: 'relationship',
      relationTo: 'movies',
      required: true,
    },
  ],
  timestamps: true,
  indexes: [
    {
      fields: ['user', 'movie'],
      unique: true,
    },
  ],
}
