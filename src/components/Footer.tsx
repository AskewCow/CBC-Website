import Link from "next/link";

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
            <a
              href="https://discord.gg/rFe8tJ88ww"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-sky hover:text-foreground transition-colors mt-3"
            >
              discord.gg/rFe8tJ88ww ↗
            </a>
          </div>

          <div>
            <p className="font-mono text-xs text-stone/50 mb-4 uppercase tracking-widest">
              pages
            </p>
            <div className="flex flex-col gap-2">
              {[
                ["/projects", "projects"],
                ["/events", "events"],
                ["/announcements", "announcements"],
                ["/join", "how to join"],
                ["/resources", "resources"],
              ].map(([path, label]) => (
                <Link
                  key={path}
                  href={path}
                  className="font-mono text-xs text-stone hover:text-foreground transition-colors"
                >
                  {path}
                  <span className="text-stone/30 ml-2">— {label}</span>
                </Link>
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
