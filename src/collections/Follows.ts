import { CollectionConfig } from 'payload'

export const Follows: CollectionConfig = {
  slug: 'follows',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'follower',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'following',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
  ],
  timestamps: true,
  // ✅ Corretto modo per definire un indice compound
  // ⚠️ Niente `options`, Payload lo capisce da solo
  indexes: [
    {
      fields: ['follower', 'following'], // array, non oggetto!
      unique: true,
    },
  ],
}
