import Link from 'next/link';

const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/simply-insilico/' },
];

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {CURRENT_YEAR} Simply Insilico LLC. All rights reserved.
          </p>

          {/* Social media links */}
          <ul className="flex items-center gap-4">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

        </div>
      </div>
    </footer>
  );
}
