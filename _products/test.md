---
name: Test Item
# https://developers.google.com/search/docs/data-types/product#structured-data-type-definitions
product:
  "@context": https://schema.org
  "@type": Product
  name: KRV Ads
  description: This is a thing for sale
  identifier: 7fa7863b-5675-4031-9ee8-8a687ad15dac
  brand:
    "@type": Brand
    name: KernValley.US
  aggregateRating:
    "@type": AggregateRating
    ratingValue: 4
    ratingCount: 1
  image:
    - "@type": ImageObject
      url: https://cdn.kernvalley.us/img/branding/ads.kernvalley.us.svg
      encodingFormat: image/svg+xml
      height: 192
      width: 192
  offers:
    - "@type": Offer
      identifier: 79960d18-edc0-4d3a-9729-681ec03b2b58
      name: Test Offer
      price: 40
      priceCurrency: USD
      availibility: InStock
---
<bacon-ipsum></bacon-ipsum>
