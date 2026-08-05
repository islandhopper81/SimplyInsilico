'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CTA_LINKS = [
  { label: 'Try Cerebrum →', href: 'https://cerebrum.simplyinsilico.com/' },
  { label: 'View on GitHub →', href: 'https://github.com/islandhopper81/cerebrum' },
  { label: 'Install from PyPI →', href: 'https://pypi.org/project/cerebrum-engine/' },
];

function CtaLinks() {
  return (
    <div className="flex flex-wrap gap-4">
      {CTA_LINKS.map((link, index) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: index === 0 ? 'default' : 'outline' }))}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export default function CerebrumLandingPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-10">
        <p className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-6 bg-primary/10 px-4 py-1.5 rounded-full">
          Proof of concept
        </p>
        <h1 className="text-4xl font-bold text-foreground mb-3">
          Cerebrum: LLM-Powered Mutation Testing
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          A proof of concept for software engineers who want to know if their tests actually
          work.
        </p>
      </header>

      <div className="rounded-2xl bg-muted/40 border border-border p-6 mb-10">
        <p className="text-sm font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
          Early and unproven
        </p>
        <p className="text-foreground leading-relaxed">
          This is a proof of concept, not a polished product. It has mainly been tested against
          the author&rsquo;s own codebases so far, it is rough in places, and it is not yet clear
          how well it holds up against other people&rsquo;s projects. If you try it, go in with
          that expectation.
        </p>
      </div>

      <div className="mb-14">
        <CtaLinks />
      </div>

      <article className="prose prose-neutral max-w-none">
        <p>
          Cerebrum is a tool built for software engineers. If you write code and you write tests
          for that code, Cerebrum is for you. It runs mutation testing on your codebase using an
          LLM, and it tells you which of your tests are actually catching bugs and which ones are
          just there for show.
        </p>
        <p>
          This is a proof of concept, not a polished product. I built it to solve a problem for
          myself, and the core engine and web interface both work. But it has mainly been run
          against my own codebases so far, it is rough in places, and I genuinely do not know yet
          how well it holds up against other people&rsquo;s projects. If you try it, go in with
          that expectation.
        </p>

        <h2>Why I built this</h2>
        <p>
          I have spent my career in bioinformatics and clinical genomics, building pipelines
          where a silent bug does not just cost you a bad deploy, it can cost you a wrong answer
          in a clinical report. Test coverage numbers never told me the whole story. A line of
          code being executed by a test is not the same thing as that test actually verifying the
          code is correct. Mutation testing closes that gap, and I wanted a version of it that did
          not require weeks of manual setup to get value from.
        </p>

        <h2>What is mutation testing, and why does it matter</h2>
        <p>
          Code coverage answers one question: did my tests run this line of code? Mutation
          testing answers a much more useful question: if this line of code were wrong, would my
          tests notice?
        </p>
        <p>
          Here is how it works. Cerebrum takes your source code and introduces small, deliberate
          bugs, called mutants. A mutant might flip a comparison operator, change a boundary
          condition, or swap a variable. Then it runs your existing test suite against each
          mutant. If a test fails, the mutant is killed, which means your tests are doing their
          job. If every test still passes even though the code is now broken, the mutant
          survives, and that is a signal that you have a gap in your test suite.
        </p>
        <p>
          This is fundamentally a test for your test cases. Coverage tells you where your tests
          look. Mutation testing tells you whether your tests are actually paying attention when
          they get there.
        </p>
        <p>
          This matters more than ever right now because of how much code is being written with AI
          assistance. When you are vibe coding, iterating quickly with an LLM writing or
          rewriting chunks of your codebase, it is very easy for a subtle breaking change to slip
          through a test suite that looks complete but is not actually verifying behavior. A
          surviving mutant is often exactly the kind of regression that a fast, AI-assisted
          development loop can introduce without anyone noticing until it hits production.
          Mutation testing is one of the more reliable ways to catch that.
        </p>

        <h2>We are not the only ones who think this matters</h2>
        <p>
          Meta has been investing heavily in this space. In early 2025, Meta&rsquo;s engineering
          team published work on a system called ACH, Automated Compliance Hardening, which
          combines mutation-guided test generation with LLMs. Engineers describe the kind of bug
          they are worried about in plain text, and the system generates both realistic mutants
          and the tests needed to catch them. More recently, Meta has reported using a related
          approach they call Just-in-Time testing, generating tests at pull request time based on
          the specific code diff, and they have reported meaningfully higher bug detection rates
          in AI-assisted development environments as a result.
        </p>
        <p>
          That is one of the largest engineering organizations in the world concluding that
          traditional test coverage is not enough in an AI-assisted development world, and that
          mutation testing is a key part of the answer. Cerebrum is built on the same core idea,
          packaged for teams who do not have Meta&rsquo;s internal tooling budget.
        </p>

        <h2>The history, and why LLMs change things</h2>
        <p>
          Mutation testing is not a new idea. It has been studied in academic circles since the
          late 1970s, and the core concept has not changed much since then. What has kept it out
          of mainstream, everyday use for decades comes down to a few practical problems:
        </p>
        <ul>
          <li>
            Cost. Generating and running a large number of mutants against a full test suite is
            computationally expensive, and it gets worse as codebases grow.
          </li>
          <li>
            Unrealistic mutants. Traditional mutation operators are mechanical. They produce a lot
            of mutants that no real developer would ever write, which wastes time and dilutes the
            signal.
          </li>
          <li>
            The equivalent mutant problem. Some mutants change the code&rsquo;s text but not its
            actual behavior, so no test could ever kill them even in principle. Telling these
            apart from real gaps has historically required manual review.
          </li>
          <li>
            Manual effort. Someone still had to write or curate the tests meant to catch the
            mutants that mattered, which made mutation testing a labor-intensive process reserved
            for teams with the time and expertise to run it well.
          </li>
        </ul>
        <p>
          LLMs are well suited to attacking all four of these problems at once. An LLM can reason
          about what a realistic bug in a given piece of code would actually look like, rather
          than blindly applying a fixed set of syntactic operators. It can recognize when a mutant
          is behaviorally equivalent to the original and skip it. And it can generate targeted
          tests to catch the mutants that do represent real risk, cutting out most of the manual
          work. This is exactly what has let mutation testing start moving from an academic
          curiosity into practical, everyday use over the last couple of years, and it is the same
          shift Meta&rsquo;s own published work describes.
        </p>

        <figure>
          <img
            src="/images/products/cerebrum-dashboard.png"
            alt="The Cerebrum web interface showing a project overview with surviving bug count, mutation score, and test coverage, along with trend charts for surviving bugs per run, mutation score over time, and coverage over time."
          />
          <figcaption>
            The Cerebrum dashboard for a project under test, showing mutation score, surviving
            mutants, and coverage trends across runs.
          </figcaption>
        </figure>

        <h2>How Cerebrum works</h2>
        <p>Cerebrum is built as two components.</p>
        <p>
          <strong>cerebrum-engine</strong> is the core mutation testing engine. It analyzes your
          codebase, uses an LLM to generate realistic mutants, runs your existing test suite
          against each one, and scores the results. This is the part that does the actual
          mutation testing work and can be run from the command line or wired into CI.
        </p>
        <p>
          <strong>cerebrum-cloud</strong> is the hosted web application and dashboard. It gives
          you a place to view results across runs, track mutation score and coverage trends over
          time, and see which mutants are surviving so you know exactly where to focus your next
          test. It is what turns a one-off mutation testing run into something you can track
          project over project, run over run.
        </p>
        <p>
          Together, they are meant to slot into a normal engineering workflow: run
          cerebrum-engine against your codebase, whether locally or in CI, and see the results
          show up in cerebrum-cloud without extra setup.
        </p>

        <h2>Where things stand today</h2>
        <p>This is a proof of concept. That means:</p>
        <ul>
          <li>
            The core mutation testing engine and the web dashboard both work, and I use them
            myself.
          </li>
          <li>
            Testing so far has mostly been against my own codebases. I have not yet validated how
            well this holds up against a wide range of other people&rsquo;s projects, languages,
            or test setups.
          </li>
          <li>The interface, scoring approach, and integrations are all still in flux.</li>
          <li>
            Expect rough edges. Do not expect polish, and do not expect this to be
            production-hardened yet.
          </li>
        </ul>
        <p>
          If you try it out, I would genuinely like to know what worked, what broke, and whether
          it held up against your own codebase. That is exactly the kind of feedback that turns a
          proof of concept into something more.
        </p>

        <h2>Get started</h2>
        <p>Ready to see how your test suite holds up? Give Cerebrum a try.</p>
      </article>

      <div className="mt-4">
        <CtaLinks />
      </div>
    </main>
  );
}
