// Static services list. Each service card on /services is driven by this data.

export interface Service {
  name: string;
  description: string;
  ctaLabel: string;
}

export const services: Service[] = [
  {
    name: 'AI Transformation Consulting',
    description:
      'We help small businesses understand, adopt, and operationalize AI — from strategy to implementation.',
    ctaLabel: 'Get in touch',
  },
  {
    name: 'Bioinformatics Consulting',
    description:
      'Specialized data analysis and pipeline development for life sciences and research organizations.',
    ctaLabel: 'Get in touch',
  },
];
