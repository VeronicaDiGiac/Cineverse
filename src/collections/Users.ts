import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'username',
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
      required: false,
    },
    {
      name: 'bio',
      type: 'textarea',
      required: false,
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
      admin: {
        description: 'Scegli il tuo ruolo durante la registrazione',
      },
      access: {
        // Temporaneamente permetti a chiunque di aggiornare il ruolo
        update: () => true,
      },
    },
    {
      name: 'favoriteGenres',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Drammatico', value: 'drammatico' },
        { label: 'Storico', value: 'storico' },
        { label: 'Fantascienza', value: 'fantascienza' },
        { label: 'Commedia', value: 'commedia' },
        { label: 'Azione', value: 'azione' },
        { label: 'Avventura', value: 'avventura' },
        { label: 'Horror', value: 'horror' },
        { label: 'Thriller', value: 'thriller' },
        { label: 'Giallo', value: 'giallo' },
        { label: 'Romantico', value: 'romantico' },
        { label: 'Animazione', value: 'animazione' },
        { label: 'Documentario', value: 'documentario' },
        { label: 'Musicale', value: 'musicale' },
        { label: 'Fantasy', value: 'fantasy' },
        { label: 'Biografico', value: 'biografico' },
        { label: 'Crime', value: 'crime' },
        { label: 'Western', value: 'western' },
        { label: 'Famiglia', value: 'famiglia' },
      ],
      required: false,
    },
  ],
  hooks: {
    beforeOperation: [
      async ({ args, operation }) => {
        // Durante la creazione, se non c'è utente loggato (registrazione pubblica)
        // e l'utente prova a registrarsi come admin, lo forziamo a user
        if (operation === 'create' && !args.req?.user && args.data?.role === 'admin') {
          args.data.role = 'user'
        }
        return args
      },
    ],
    beforeChange: [
      ({ req, operation, data }) => {
        // Se un utente non admin prova a impostare il ruolo admin, lo blocchiamo
        // if (data.role === 'admin' && req.user?.role !== 'admin') {
        //   data.role = 'user'
        // }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        // Notifica quando viene creato un nuovo admin
        if (operation === 'create' && doc.role === 'admin' && req?.payload) {
          try {
            await req.payload.sendEmail({
              to: 'admin@example.com',
              from: 'noreply@example.com',
              subject: 'Nuovo admin registrato',
              html: `L'utente ${doc.email} si è registrato come admin.`,
            })
          } catch (error) {
            console.error("Errore nell'invio dell'email:", error)
          }
        }
        return doc
      },
    ],
  },
}
