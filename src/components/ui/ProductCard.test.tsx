import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProductCard from './ProductCard';
import type { Product } from '@/data/products';

const externalProduct: Product = {
  name: 'FeedTheFamily',
  tagline: 'Take the mental load out of meal planning.',
  imagePath: '/images/products/feed-the-family.jpg',
  url: 'https://feedthefamily.app/',
  isExternal: true,
};

const internalProduct: Product = {
  name: 'TestProduct',
  tagline: 'A test product tagline.',
  imagePath: '/images/products/test.svg',
  url: '/test-product',
  isExternal: false,
};

describe('ProductCard', () => {
  it('renders the product name and tagline', () => {
    render(<ProductCard product={externalProduct} />);
    expect(screen.getByText('FeedTheFamily')).toBeInTheDocument();
    expect(screen.getByText('Take the mental load out of meal planning.')).toBeInTheDocument();
  });

  it('renders an external link with target="_blank" for external products', () => {
    render(<ProductCard product={externalProduct} />);
    const link = screen.getByRole('link', { name: 'FeedTheFamily' });
    expect(link).toHaveAttribute('href', 'https://feedthefamily.app/');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders an internal link without target="_blank" for internal products', () => {
    render(<ProductCard product={internalProduct} />);
    const link = screen.getByRole('link', { name: 'TestProduct' });
    expect(link).toHaveAttribute('href', '/test-product');
    expect(link).not.toHaveAttribute('target', '_blank');
  });
});
