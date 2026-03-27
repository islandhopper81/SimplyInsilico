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
    tagline: 'Take the mental load out of meal planning.',
    imagePath: '/images/products/feed-the-family.jpg',
    url: 'https://feedthefamily.app/',
    isExternal: true,
  },
];
