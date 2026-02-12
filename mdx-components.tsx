import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold tracking-tight mb-6 text-zinc-900 dark:text-zinc-100">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-4 text-zinc-900 dark:text-zinc-100 border-b border-light-border dark:border-dark-border pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold mt-8 mb-3 text-zinc-900 dark:text-zinc-100">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold mt-6 mb-2 text-zinc-900 dark:text-zinc-100">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
        {children}
      </p>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-brand-primary dark:text-brand-light hover:underline font-medium"
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-1.5 mb-4 text-zinc-600 dark:text-zinc-300">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-1.5 mb-4 text-zinc-600 dark:text-zinc-300">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed">{children}</li>
    ),
    code: ({ children, className }) => {
      // Inline code (no className) vs code blocks (has className from language tag)
      if (!className) {
        return (
          <code className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-brand-primary dark:text-brand-light text-sm font-mono">
            {children}
          </code>
        );
      }
      return <code className={className}>{children}</code>;
    },
    pre: ({ children }) => (
      <pre className="rounded-xl bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 p-4 overflow-x-auto mb-4 text-sm font-mono text-zinc-100">
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="border-b border-zinc-200 dark:border-zinc-700">
        {children}
      </thead>
    ),
    th: ({ children }) => (
      <th className="text-left py-2 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="py-2 px-3 text-zinc-600 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-800">
        {children}
      </td>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-brand-primary/30 pl-4 italic text-zinc-500 dark:text-zinc-400 mb-4">
        {children}
      </blockquote>
    ),
    hr: () => (
      <hr className="border-zinc-200 dark:border-zinc-700 my-8" />
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
        {children}
      </strong>
    ),
    ...components,
  };
}
