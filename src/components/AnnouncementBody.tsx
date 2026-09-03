import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Announcement bodies are the raw markdown an admin typed for the Discord
// #announcements post. On the site we deliberately flatten the styling — bold,
// italics, headings and code all render as plain text, which reads cleaner in
// this typographic system — and keep only links, in the Anthropic sky accent.

const flatten = ({ children }: { children?: ReactNode }) => <>{children}</>;

const components: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "#6A9BCC" }}
      className="underline underline-offset-2 decoration-sky/40 hover:decoration-sky transition-colors"
    >
      {children}
    </a>
  ),
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-3 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 mb-3 last:mb-0">{children}</ol>,
  strong: flatten,
  em: flatten,
  del: flatten,
  code: flatten,
  pre: flatten,
  blockquote: flatten,
  h1: flatten,
  h2: flatten,
  h3: flatten,
  h4: flatten,
  h5: flatten,
  h6: flatten,
  hr: () => null,
  img: () => null,
};

export default function AnnouncementBody({ children }: { children: string }) {
  return (
    <div className="font-sans text-base text-stone leading-relaxed max-w-2xl">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
