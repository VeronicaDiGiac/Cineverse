import type { CollectionConfig } from 'payload'
// import type { Comment, User } from '@/payload-types'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: { useAsTitle: 'id' },

  access: {
    // read: () => true,
    // create: ({ req }) => {
    //   const user = req.user as User | undefined
    //   return !!user
    // },
    // update: async (args: AccessArgs<Comment>): Promise<boolean> => {
    //   const { req, doc } = args
    //   const user = req.user as User | undefined
    //   if (!user || !doc) return false
    //   const userId = typeof doc.user === 'string' ? doc.user : doc.user?.id
    //   return userId === user.id || user.role === 'admin'
    // },
    // delete: async (args: AccessArgs<Comment>): Promise<boolean> => {
    //   const { req, doc } = args
    //   const user = req.user as User | undefined
    //   if (!user || !doc) return false
    //   const userId = typeof doc.user === 'string' ? doc.user : doc.user?.id
    //   return userId === user.id || user.role === 'admin'
    // },
  },

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
