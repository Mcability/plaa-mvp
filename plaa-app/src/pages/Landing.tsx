import { BookOpen, Wand2, LayoutTemplate, FileDown } from "lucide-react";
import { useAuth } from "../lib/auth";

const FEATURES = [
  {
    icon: Wand2,
    title: "AI Content Structuring",
    body: "Paste raw manuscript or lyrics and PLAA detects headings, verses, choruses, articles, and captions automatically.",
  },
  {
    icon: LayoutTemplate,
    title: "Smart Layout Generation",
    body: "Three AI-generated style directions per project — palette, typography, and vibe — chosen, not guessed.",
  },
  {
    icon: BookOpen,
    title: "Document-Type Intelligence",
    body: "Hymnal verse/chorus numbering and newsletter article flow, handled natively — not bolted on.",
  },
  {
    icon: FileDown,
    title: "Print-Ready Export",
    body: "Paginated, trim-size-accurate spreads ready to print or save as a polished PDF.",
  },
];

export function Landing() {
  const { signIn } = useAuth();
  return (
    <div>
      <section className="bg-gradient-to-b from-navy to-navy-dark text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 sm:py-28 text-center">
          <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-4">Publishing &amp; Layout Assistant Agent</p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight mb-6">
            From raw content to a launchable publication.
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-base sm:text-lg mb-10">
            PLAA turns hymn lyrics and newsletter copy into fully designed, print-ready layouts —
            with an AI agent handling structure, typography, and pagination so you don't have to.
          </p>
          <button
            onClick={signIn}
            className="bg-gold hover:bg-gold-light text-navy-dark font-semibold px-8 py-3.5 rounded-md text-base transition-colors"
          >
            Sign In to Start Building
          </button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white border border-navy/10 rounded-xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-navy" />
              </div>
              <h3 className="font-display text-lg text-ink mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-parchment border-t border-navy/10">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-ink mb-4">Built for the documents you already make</h2>
          <p className="text-gray-500 mb-8">Hymnals, newsletters, and magazines — start with Phase 1 of PLAA today.</p>
          <button
            onClick={signIn}
            className="bg-navy hover:bg-navy-dark text-white font-semibold px-7 py-3 rounded-md transition-colors"
          >
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
}
