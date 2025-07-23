import { CollectionConfig } from 'payload'

export const Newsletter: CollectionConfig = {
  slug: 'newsletter',
  access: {
    create: () => true,
    read: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      validate: (val) =>
        typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
          ? true
          : 'Inserisci un indirizzo email valido',
    },
    {
      name: 'confirmed',
      type: 'checkbox',
      defaultValue: false,
      admin: { readOnly: true },
    },
  ],
  timestamps: true,
}
