import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('Navbar', () => {
  it('renders all four nav links in the desktop nav', () => {
    render(<Navbar />);
    // Mobile menu is closed by default — each link appears once (desktop nav only)
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Services' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
  });

  it('mobile menu is hidden by default', () => {
    render(<Navbar />);
    const hamburger = screen.getByRole('button', { name: 'Open menu' });
    expect(hamburger).toBeInTheDocument();
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });

  it('clicking the hamburger button opens the mobile menu', () => {
    render(<Navbar />);
    const hamburger = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(hamburger);
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('clicking the hamburger again closes the mobile menu', () => {
    render(<Navbar />);
    const hamburger = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(hamburger);
    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });

  it('renders the brand name linking to home', () => {
    render(<Navbar />);
    const brandLink = screen.getByRole('link', { name: 'Simply Insilico' });
    expect(brandLink).toHaveAttribute('href', '/');
  });
});
