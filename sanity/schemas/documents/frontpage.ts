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
    { name: 'featured', title: 'Fremhevet' },
    { name: 'events', title: 'Arrangementer' },
    { name: 'timeline', title: 'Historie' },
    { name: 'featuredProduct', title: 'Produkter' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // Hero Section
    defineField({
      name: 'hero',
      title: 'Hero-seksjon',
      type: 'heroSection',
      description: 'Velg et stort bilde som vises øverst på forsiden og setter stemningen',
      group: 'hero',
    }),

    // Featured Section
    defineField({
      name: 'featured',
      title: 'Fremhevet-seksjon',
      type: 'featuredSection',
      description: 'Fremhev to ting du vil trekke oppmerksomhet til, f.eks. søndagsfrokost og et arrangement',
      group: 'featured',
    }),

    // Events Section
    defineField({
      name: 'events',
      title: 'Arrangementer-seksjon',
      type: 'eventsSection',
      description: 'Velg arrangementer som besøkende kan utforske med tilhørende bilder',
      group: 'events',
    }),

    // Timeline Section
    defineField({
      name: 'timeline',
      title: 'Tidslinje-seksjon',
      type: 'timelineSection',
      description: 'Fortell historien til Gransvilla gjennom viktige årstall og milepæler',
      group: 'timeline',
    }),

    // Featured Product Section
    defineField({
      name: 'featuredProduct',
      title: 'Produkter',
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
