// Static product list. Each product card on /products is driven by this data.
// Add new products here as they launch.

export interface Product {
  name: string;
  tagline: string;
  imagePath: string;
  url: string;
  isExternal: boolean;
  status?: 'In development';
}

export const products: Product[] = [
  {
    name: 'FeedTheFamily',
    tagline: 'Take the mental load out of meal planning.',
    imagePath: '/images/products/feed-the-family.jpg',
    url: 'https://feedthefamily.app/',
    isExternal: true,
  },
  {
    name: 'toGather',
    tagline: 'Friendship-aware team formation for leagues and organizers.',
    imagePath: '/images/products/togather.jpg',
    url: '/products/togather',
    isExternal: false,
  },
  {
    name: 'Cerebrum (proof of concept)',
    tagline: 'LLM-powered mutation testing. Know if your tests actually work.',
    imagePath: '/images/products/cerebrum.png',
    url: '/products/cerebrum',
    isExternal: false,
  },
  {
    name: 'Line Change',
    tagline: 'More coaching. A simpler way to manage substitutions and fair playing time.',
    imagePath: '/images/products/line-change-coaching-illustration.png',
    url: '/products/line-change',
    isExternal: false,
    status: 'In development',
  },
  {
    name: 'The Giving Guru',
    tagline: 'Coordinate the gifts equally.',
    imagePath: '/images/products/giving-guru-gift-organizer.png',
    url: '/products/the-giving-guru',
    isExternal: false,
    status: 'In development',
  },
];
