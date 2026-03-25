// Contact form configuration.
// FORMSPREE_ENDPOINT is the Formspree form URL — set it in .env.local and expose via NEXT_PUBLIC_.

export const CONTACT_CONFIG = {
  formspreeEndpoint: process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ?? '',
};
