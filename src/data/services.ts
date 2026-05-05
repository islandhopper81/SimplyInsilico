// Static services list. Each service card on /services is driven by this data.
//
// isVisible controls whether the service appears on the site.
// Set to false and redeploy to hide a service without removing it from the codebase.
// The Bioinformatics service may need to be hidden depending on employer conflict concerns.

export interface Service {
  name: string;
  description: string;
  ctaLabel: string;
  isVisible: boolean;
}

export const services: Service[] = [
  {
    name: 'AI Transformation Consulting',
    description:
      "Most small businesses know AI could help them — they just don't have the time to figure out how. " +
      'We start by listening to your business, then identify where AI can eliminate the busywork slowing ' +
      'you down or amplify what you already do well. From automating scheduling and generating marketing ' +
      'content to building custom tools for your specific workflow, we find the right fit for you — no ' +
      'technical background required.',
    ctaLabel: 'Get in touch',
    isVisible: true,
  },
  {
    name: 'Bioinformatics Consulting',
    description:
      'Custom bioinformatics pipelines and data analysis for researchers and life sciences organizations. ' +
      'Whether you need to process sequencing data, build reproducible analysis workflows, or make sense ' +
      'of complex biological datasets, we deliver clean, documented solutions tailored to your project.',
    ctaLabel: 'Get in touch',
    isVisible: false,
  },
];
