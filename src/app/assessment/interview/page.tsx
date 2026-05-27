import type { Metadata } from 'next';
import AssessmentInterview from '@/components/ui/AssessmentInterview';

export const metadata: Metadata = {
  title: 'Assessment Interview',
};

export default function AssessmentInterviewPage() {
  return (
    <main>
      <section className="py-16 sm:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <AssessmentInterview />
        </div>
      </section>
    </main>
  );
}
