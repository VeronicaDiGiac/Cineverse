import { CollectionConfig } from 'payload'

export const Newsletter: CollectionConfig = {
  slug: 'newsletter',
  access: {
    create: () => true,
    read: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [{ name: 'email', type: 'email', required: true, unique: true }],
  timestamps: true,
}
