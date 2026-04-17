'use client'

import * as runtime from 'react/jsx-runtime'

interface MDXContentProps {
  code: string
}

/**
 * Evaluates Velite's compiled MDX code string and renders the resulting component.
 * Must be a client component because it dynamically executes compiled code.
 */
export function MDXContent({ code }: MDXContentProps) {
  const fn = new Function(code)
  const { default: Component } = fn({ ...runtime })
  return <Component />
}
