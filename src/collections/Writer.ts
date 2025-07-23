import { CollectionConfig } from 'payload'

export const Writers: CollectionConfig = {
  slug: 'writers',
  admin: {
    useAsTitle: 'name', // Mostra il nome nel pannello admin e nei relationship field
  },
  access: {
    create: ({ req }) => req.user?.role === 'admin',
    read: () => true,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nome dello scrittore',
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Biografia',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto profilo',
    },
    {
      name: 'voteCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'voteTotal',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
  ],

  timestamps: true,
}
