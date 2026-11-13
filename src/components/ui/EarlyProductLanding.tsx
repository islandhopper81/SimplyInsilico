import Image from 'next/image';
import Link from 'next/link';
import type { EarlyProduct } from '@/data/earlyProducts';
import ProductInterestForm from './ProductInterestForm';

export default function EarlyProductLanding({ product }: { product: EarlyProduct }) {
  return (
    <div>
      <section className="bg-gradient-to-br from-[#9FE1CB]/30 via-[#9FE1CB]/10 to-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">← All products</Link>
          <div className="mt-10 grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-5 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-primary">In development</p>
              <p className="mb-3 text-lg font-semibold text-primary">{product.name}</p>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{product.headline}</h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{product.description}</p>
              <a href="#interest" className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-[#1D9E75] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Interested? Let us know →</a>
              <p className="mt-3 text-sm text-muted-foreground">An early look. Not yet widely available.</p>
            </div>
            <div>
              <Image src={product.imagePath} alt="" width={720} height={480} priority className="w-full rounded-2xl border border-primary/10" />
              <p className="mt-3 text-center text-xs text-muted-foreground">Illustration of the idea, not a product screenshot.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight">Built around a familiar challenge</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{product.audience}</p>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {product.features.map((feature, index) => (
            <div key={feature.title} className="border-t-2 border-primary/20 pt-6">
              <p className="mb-4 font-mono text-sm text-primary">0{index + 1}</p>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section id="interest" className="scroll-mt-24 bg-muted/40 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Would {product.name} help you?</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">We’re sharing this early to learn who it could help and what matters most. Tell us you’re interested, or share the problem you’d like it to solve.</p>
            <p className="mt-5 leading-relaxed text-muted-foreground">{product.name} is still in development and isn’t widely available yet. Features may change as we learn. We haven’t announced a public launch date.</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
            <ProductInterestForm productName={product.name} feedbackPrompt={product.feedbackPrompt} />
          </div>
        </div>
      </section>
    </div>
  );
}
