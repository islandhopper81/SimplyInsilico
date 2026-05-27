import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Assessment Confirmed',
};

export default function AssessmentConfirmationPage() {
  return (
    <main>
      <section className="py-20 sm:py-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
            You&apos;re all set!
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Expect your tailored architecture assessment within 48 hours. We&apos;ll send it to the
            email you provided during the interview.
          </p>
        </div>
      </section>
    </main>
  );
}
