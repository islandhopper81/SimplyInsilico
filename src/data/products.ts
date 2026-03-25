// Static product list. Each product card on /products is driven by this data.
// Add new products here as they launch.

export interface Product {
  name: string;
  tagline: string;
  imagePath: string;
  url: string;
  isExternal: boolean;
}

export const products: Product[] = [
  {
    name: 'FeedTheFamily',
    tagline: 'Placeholder tagline for FeedTheFamily.',
    imagePath: '/images/products/feed-the-family.png',
    url: 'https://placeholder-ftf-url.com', // TODO: replace with real FeedTheFamily URL
    isExternal: true,
  },
];
