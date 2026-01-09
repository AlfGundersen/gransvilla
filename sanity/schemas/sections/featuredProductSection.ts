import { defineField, defineType } from 'sanity'
import { ShopifyProductInput } from '../../components/ShopifyProductInput'

/**
 * Fremhevet produkt-seksjon
 *
 * Velg et produkt fra Shopify som skal fremheves på forsiden.
 * Tekst og bilde hentes automatisk fra Shopify.
 */
export default defineType({
  name: 'featuredProductSection',
  title: 'Fremhevet produkt',
  type: 'object',
  fields: [
    defineField({
      name: 'productHandle',
      title: 'Velg produkt fra Shopify',
      type: 'string',
      components: {
        input: ShopifyProductInput,
      },
      validation: (Rule) => Rule.required().error('Du må velge et produkt'),
    }),
  ],
  preview: {
    select: {
      productHandle: 'productHandle',
    },
    prepare({ productHandle }) {
      return {
        title: 'Fokusprodukt',
        subtitle: productHandle || 'Velg et produkt',
      }
    },
  },
})
