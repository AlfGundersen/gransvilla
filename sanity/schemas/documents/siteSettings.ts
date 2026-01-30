import { defineField, defineType } from 'sanity'

const menuItem = {
  type: 'object',
  fields: [
    defineField({
      name: 'page',
      title: 'Side',
      type: 'reference',
      to: [{ type: 'page' }, { type: 'event' }],
      options: { disableNew: true },
      hidden: ({ parent }) => parent?.customLink,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { customLink?: boolean }
          if (!parent?.customLink && !value) return 'Velg en side'
          return true
        }),
    }),
    defineField({
      name: 'customLink',
      title: 'Egendefinert lenke',
      type: 'boolean',
      initialValue: false,
      description: 'Slå på for å bruke egendefinert URL i stedet for en side-referanse',
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'string',
      description: 'F.eks. / eller /nettbutikk',
      hidden: ({ parent }) => !parent?.customLink,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { customLink?: boolean }
          if (parent?.customLink && !value) return 'URL er påkrevd for egendefinerte lenker'
          return true
        }),
    }),
    defineField({
      name: 'label',
      title: 'Egendefinert tekst',
      type: 'string',
      description: 'Valgfritt – overstyrer sidens tittel i menyen',
    }),
  ],
  preview: {
    select: {
      label: 'label',
      pageTitle: 'page.title',
      customLink: 'customLink',
      href: 'href',
    },
    prepare({
      label,
      pageTitle,
      customLink,
      href,
    }: {
      label?: string
      pageTitle?: string
      customLink?: boolean
      href?: string
    }) {
      const title = label || pageTitle || 'Uten tittel'
      const subtitle = customLink ? href : pageTitle && !label ? '' : pageTitle
      return { title, subtitle }
    },
  },
}

export default defineType({
  name: 'siteSettings',
  title: 'Nettstedsinnstillinger',
  type: 'document',
  groups: [
    { name: 'general', title: 'Generelt', default: true },
    { name: 'navigation', title: 'Navigasjon' },
    { name: 'contact', title: 'Kontakt' },
  ],
  fields: [
    defineField({
      name: 'siteName',
      title: 'Nettstedsnavn',
      type: 'string',
      group: 'general',
      validation: (Rule) => Rule.required().error('Nettstedsnavn er påkrevd'),
    }),
    defineField({
      name: 'siteDescription',
      title: 'Nettstedsbeskrivelse',
      type: 'simpleBlockContent',
      group: 'general',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      group: 'general',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      group: 'general',
      description: 'Lite ikon som vises i nettleserens fane',
    }),
    defineField({
      name: 'mainMenu',
      title: 'Hovedmeny',
      description: 'Navigasjonslenker som vises i header og footer',
      type: 'array',
      group: 'navigation',
      of: [menuItem],
    }),
    defineField({
      name: 'footerMenu',
      title: 'Bunntekstmeny',
      description: 'Valgfri – brukes i stedet for hovedmenyen i footer. Hvis tom, brukes hovedmenyen.',
      type: 'array',
      group: 'navigation',
      of: [menuItem],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Sosiale medier',
      description: 'Legg til lenker til sosiale medier-profiler.',
      type: 'array',
      group: 'contact',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Plattform',
              type: 'string',
              options: {
                list: [
                  { title: 'Facebook', value: 'facebook' },
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'LinkedIn', value: 'linkedin' },
                  { title: 'X (Twitter)', value: 'twitter' },
                  { title: 'Spotify', value: 'spotify' },
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'TikTok', value: 'tiktok' },
                  { title: 'Tripadvisor', value: 'tripadvisor' },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { platform: 'platform', url: 'url' },
            prepare({ platform, url }: { platform?: string; url?: string }) {
              const labels: Record<string, string> = {
                facebook: 'Facebook',
                instagram: 'Instagram',
                linkedin: 'LinkedIn',
                twitter: 'X (Twitter)',
                spotify: 'Spotify',
                youtube: 'YouTube',
                tiktok: 'TikTok',
                tripadvisor: 'Tripadvisor',
              }
              return {
                title: labels[platform || ''] || platform || 'Velg plattform',
                subtitle: url,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'contactInfo',
      title: 'Kontaktinformasjon',
      type: 'object',
      group: 'contact',
      fields: [
        { name: 'email', type: 'string', title: 'E-post' },
        { name: 'phone', type: 'string', title: 'Telefon' },
        { name: 'address', type: 'simpleBlockContent', title: 'Adresse' },
        { name: 'partners', type: 'simpleBlockContent', title: 'Partnere', description: 'Legg til partnere med lenker' },
      ],
    }),
    defineField({
      name: 'openingHours',
      title: 'Åpningstider',
      type: 'array',
      group: 'contact',
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
