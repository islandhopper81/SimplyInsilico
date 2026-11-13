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
              <a href={product.imagePath} target="_blank" rel="noopener noreferrer" aria-label={`View ${product.name} image full size`} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                <Image src={product.imagePath} alt={product.imageAlt ?? ""} width={product.screenshot ? 940 : 720} height={product.screenshot ? 1672 : 480} sizes={product.screenshot ? '(max-width: 640px) 85vw, 320px' : '(max-width: 1024px) 100vw, 540px'} priority className={product.screenshot ? 'mx-auto h-auto w-full max-w-[320px] rounded-2xl border border-border shadow-xl' : 'h-auto w-full rounded-2xl border border-primary/10'} />
              </a>
              {product.screenshot ? (
                <p className="mt-3 text-center text-xs text-muted-foreground">Line Change · Lineup view. Fictional player names; image edited for privacy. Select image to view full size.</p>
              ) : product.photoCredit ? (
                <p className="mt-3 text-center text-xs text-muted-foreground">Photo by <a href={product.photoCredit.url} target="_blank" rel="noopener noreferrer" className="underline">{product.photoCredit.name} on Unsplash</a></p>
              ) : (
                <p className="mt-3 text-center text-xs text-muted-foreground">Illustration of the idea, not a product screenshot.</p>
              )}
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
      {product.report && (
        <section className="border-t border-border px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-primary">After the final whistle</p>
              <h2 className="text-3xl font-bold tracking-tight">{product.report.heading}</h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">{product.report.description}</p>
            </div>
            <figure>
              <a href={product.report.imagePath} target="_blank" rel="noopener noreferrer" aria-label="View game report screenshot full size" className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                <Image src={product.report.imagePath} alt={product.report.alt} width={940} height={1672} sizes="(max-width: 640px) 85vw, 375px" className="mx-auto h-auto w-full max-w-[375px] rounded-2xl border border-border shadow-lg" />
              </a>
              <figcaption className="mt-4 text-center text-xs text-muted-foreground">Line Change · Game report. Fictional player names; image edited for privacy. Select image to view full size.</figcaption>
            </figure>
          </div>
        </section>
      )}
      {product.plannedFeatures && (
        <section className="border-t border-border bg-primary/5 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-primary">Planned · Parent communication</p>
            <h2 className="text-3xl font-bold tracking-tight">Keep parents in the loop.</h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">We’re exploring ways to make communication with families part of Line Change. These features are planned and aren’t available yet.</p>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {product.plannedFeatures.map((feature) => (
                <div key={feature.title}>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
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
