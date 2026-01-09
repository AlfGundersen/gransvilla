import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Nettstedsinnstillinger',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Nettstedsnavn',
      type: 'string',
      validation: (Rule) => Rule.required().error('Nettstedsnavn er påkrevd'),
    }),
    defineField({
      name: 'siteDescription',
      title: 'Nettstedsbeskrivelse',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'Lite ikon som vises i nettleserens fane',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Sosiale medier',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'platform', type: 'string', title: 'Plattform' },
            { name: 'url', type: 'url', title: 'URL' },
          ],
        },
      ],
    }),
    defineField({
      name: 'contactInfo',
      title: 'Kontaktinformasjon',
      type: 'object',
      fields: [
        { name: 'email', type: 'string', title: 'E-post' },
        { name: 'phone', type: 'string', title: 'Telefon' },
        { name: 'address', type: 'text', title: 'Adresse' },
      ],
    }),
    defineField({
      name: 'openingHours',
      title: 'Åpningstider',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'days', type: 'string', title: 'Dager' },
            { name: 'hours', type: 'string', title: 'Tider' },
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Nettstedsinnstillinger',
      }
    },
  },
})
