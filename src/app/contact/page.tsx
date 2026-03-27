'use client';

import { motion } from 'framer-motion';
import ContactForm from '@/components/ui/ContactForm';

export default function ContactPage() {
  return (
    <main>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#9FE1CB]/30 via-[#9FE1CB]/10 to-white py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-6 bg-primary/10 px-4 py-1.5 rounded-full"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Contact
          </motion.p>
          <motion.h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground max-w-3xl mx-auto leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Get in touch
          </motion.h1>
          <motion.p
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Tell us about your business — no pitch, no pressure. We'll get back to you within one business day.
          </motion.p>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </section>

    </main>
  );
}
