import { defineField, defineType } from 'sanity'

/**
 * Forside - Singleton dokument med forhåndsdefinerte seksjoner
 */
export default defineType({
  name: 'frontpage',
  title: 'Forside',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero', default: true },
    { name: 'events', title: 'Fremhevet arrangement' },
    { name: 'timeline', title: 'Historie' },
    { name: 'featuredProduct', title: 'Fremhevet produkt' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // Hero Section
    defineField({
      name: 'hero',
      title: 'Hero-seksjon',
      type: 'heroSection',
      description: 'Stort bilde øverst på forsiden',
      group: 'hero',
    }),

    // Events Section
    defineField({
      name: 'events',
      title: 'Arrangementer-seksjon',
      type: 'eventsSection',
      description: 'Navigasjonslenker til ulike arrangementstyper',
      group: 'events',
    }),

    // Timeline Section
    defineField({
      name: 'timeline',
      title: 'Tidslinje-seksjon',
      type: 'timelineSection',
      description: 'Historie og informasjon om Gransvilla',
      group: 'timeline',
    }),

    // Featured Product Section
    defineField({
      name: 'featuredProduct',
      title: 'Fremhevet produkt',
      type: 'featuredProductSection',
      description: 'Velg et produkt fra nettbutikken som skal fremheves',
      group: 'featuredProduct',
    }),

    // SEO
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Forside',
        subtitle: 'Hovedsiden på nettstedet',
      }
    },
  },
})
