import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'username',
    hidden: ({ user }) => user?.role !== 'admin',
  },

  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { id: { equals: user.id } }
    },
    create: () => true,
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { id: { equals: user.id } }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },

  fields: [
    {
      name: 'username',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'avatarUrl',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
      required: true,
      admin: { description: "Ruolo definito dall'admin" },
      access: {
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
  ],

  hooks: {
    beforeOperation: [
      async ({ args, operation }) => {
        if (operation === 'create' && !args.req?.user && args.data?.role === 'admin') {
          args.data.role = 'user'
        }
        return args
      },
    ],
    beforeChange: [
      ({ req, data }) => {
        if (data.role === 'admin' && req.user?.role !== 'admin') {
          data.role = 'user'
        }
        return data
      },
    ],
  },
}
