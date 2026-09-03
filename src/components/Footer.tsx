import type { ReactNode } from "react";
import {
  CONTACT_EMAIL,
  DISCORD_INVITE,
  INSTAGRAM_URL,
  LINKEDIN_URL,
} from "@/lib/constants";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
  className: "h-4 w-4 shrink-0",
} as const;

const DiscordIcon = () => (
  <svg {...iconProps}>
    <path d="M20.317 4.369A19.79 19.79 0 0 0 15.432 2.85a.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.099.245.198.372.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.662a.06.06 0 0 0-.031-.028ZM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.332-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.332-.946 2.418-2.157 2.418Z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg {...iconProps}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
  </svg>
);

const InstagramIcon = () => (
  <svg {...iconProps}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const EmailIcon = () => (
  <svg {...iconProps}>
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

type Contact = {
  href: string;
  label: string;
  color: string;
  external: boolean;
  icon: ReactNode;
};

const CONTACTS: Contact[] = [
  { href: DISCORD_INVITE, label: "discord", color: "text-stone", external: true, icon: <DiscordIcon /> },
  { href: LINKEDIN_URL, label: "linkedin", color: "text-stone", external: true, icon: <LinkedInIcon /> },
  { href: INSTAGRAM_URL, label: "instagram", color: "text-stone", external: true, icon: <InstagramIcon /> },
  { href: `mailto:${CONTACT_EMAIL}`, label: "email", color: "text-stone", external: false, icon: <EmailIcon /> },
];

export default function Footer() {
  return (
    <footer className="border-t border-border mt-24 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 font-mono text-sm mb-3">
              <span style={{ color: "#D97757" }}>✦</span>
              <span>claude builder club</span>
            </div>
            <p className="font-mono text-xs text-stone">Trinity College Dublin</p>
            <p className="font-mono text-xs text-stone/50 mt-1">est. 2025</p>
          </div>

          <div>
            <p className="font-mono text-xs text-stone/50 mb-4 uppercase tracking-widest">
              contact
            </p>
            <div className="flex flex-col items-start gap-2.5">
              {CONTACTS.map(({ href, label, color, external, icon }) => (
                <a
                  key={label}
                  href={href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group inline-flex items-center gap-2 font-mono text-xs text-stone transition-colors hover:text-terracotta"
                >
                  <span className={`${color} transition-colors group-hover:text-terracotta`}>
                    {icon}
                  </span>
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-xs text-stone/50 mb-4 uppercase tracking-widest">
              newsletter
            </p>
            <p className="font-mono text-xs text-stone mb-3 leading-relaxed">
              Signup form pending — follow updates in Discord.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@tcd.ie"
                disabled
                className="flex-1 min-w-0 bg-surface border border-border font-mono text-xs px-3 py-2 text-stone placeholder:text-stone/30 cursor-not-allowed"
              />
              <button
                disabled
                className="font-mono text-xs px-3 py-2 border border-border text-stone/30 cursor-not-allowed whitespace-nowrap"
              >
                soon
              </button>
            </div>
            <p className="font-mono text-xs text-stone/30 mt-1.5">
              form pending
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="font-mono text-xs text-stone/40">
            © 2026 Claude Builder Club · Trinity College Dublin
          </p>
          <p className="font-mono text-xs text-stone/25">
            built with ✦ claude
          </p>
        </div>
      </div>
    </footer>
  );
}
