import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const cardContent = (
    <div className="group rounded-2xl border border-border bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      <div className="relative w-full aspect-[3/2] overflow-hidden">
        <Image
          src={product.imagePath}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">{product.name}</h3>
        <p className="text-muted-foreground leading-relaxed">{product.tagline}</p>
        <p className="mt-4 text-sm font-medium text-primary group-hover:text-[#1D9E75] transition-colors">
          Learn more →
        </p>
      </div>
    </div>
  );

  if (product.isExternal) {
    return (
      <a href={product.url} target="_blank" rel="noopener noreferrer" aria-label={product.name}>
        {cardContent}
      </a>
    );
  }

  return (
    <Link href={product.url} aria-label={product.name}>
      {cardContent}
    </Link>
  );
}
