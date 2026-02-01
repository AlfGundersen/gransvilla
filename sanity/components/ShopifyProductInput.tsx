import { useCallback, useEffect, useState } from 'react'
import { set, unset } from 'sanity'
import { Card, Stack, Text, Select, Spinner, Box } from '@sanity/ui'

interface ShopifyProduct {
  id: string
  title: string
  handle: string
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  images: {
    edges: {
      node: {
        url: string
      }
    }[]
  }
}

interface ShopifyProductInputProps {
  value?: string
  onChange: (event: ReturnType<typeof set> | ReturnType<typeof unset>) => void
}

export function ShopifyProductInput({ value, onChange }: ShopifyProductInputProps) {
  const [products, setProducts] = useState<ShopifyProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/shopify/products')

        if (!response.ok) {
          throw new Error('Kunne ikke hente produkter')
        }

        const data: ShopifyProduct[] = await response.json()
        setProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kunne ikke hente produkter')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedHandle = event.target.value
      if (selectedHandle) {
        onChange(set(selectedHandle))
      } else {
        onChange(unset())
      }
    },
    [onChange]
  )

  if (loading) {
    return (
      <Card padding={3}>
        <Stack space={3}>
          <Spinner />
          <Text size={1}>Henter produkter fra Shopify...</Text>
        </Stack>
      </Card>
    )
  }

  if (error) {
    return (
      <Card padding={3} tone="critical">
        <Text size={1}>{error}</Text>
      </Card>
    )
  }

  const selectedProduct = products.find((p) => p.handle === value)

  return (
    <Stack space={3}>
      <Select value={value || ''} onChange={handleChange}>
        <option value="">Velg et produkt...</option>
        {products.map((product) => (
          <option key={product.id} value={product.handle}>
            {product.title} - {parseFloat(product.priceRange.minVariantPrice.amount).toLocaleString('nb-NO')} {product.priceRange.minVariantPrice.currencyCode === 'NOK' ? 'kr' : product.priceRange.minVariantPrice.currencyCode}
          </option>
        ))}
      </Select>

      {selectedProduct && selectedProduct.images.edges[0] && (
        <Card padding={2} radius={2} shadow={1}>
          <Stack space={2}>
            <Box style={{ width: 100, height: 100, position: 'relative' }}>
              <img
                src={selectedProduct.images.edges[0].node.url}
                alt={selectedProduct.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 4,
                }}
              />
            </Box>
            <Text size={1} weight="semibold">{selectedProduct.title}</Text>
            <Text size={1} muted>
              {parseFloat(selectedProduct.priceRange.minVariantPrice.amount).toLocaleString('nb-NO')} {selectedProduct.priceRange.minVariantPrice.currencyCode === 'NOK' ? 'kr' : selectedProduct.priceRange.minVariantPrice.currencyCode}
            </Text>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
