"use client";

import { useState, FormEvent, JSX } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Filter } from "lucide-react";

type ThemeKey =
  | "credit"
  | "market"
  | "liquidity"
  | "operational"
  | "compliance"
  | "cyber"
  | "esg"
  | "capital";

const THEME_PRESETS: {
  id: ThemeKey;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    id: "credit",
    label: "Credit risk",
    shortLabel: "Credit",
    description: "Loan quality, concentration risk, counterparty risk"
  },
  {
    id: "market",
    label: "Market risk",
    shortLabel: "Market",
    description: "Interest rate, FX, equity and spread risk"
  },
  {
    id: "liquidity",
    label: "Liquidity risk",
    shortLabel: "Liquidity",
    description: "Funding, liquidity buffers, stress outflows"
  },
  {
    id: "operational",
    label: "Operational risk",
    shortLabel: "Operational",
    description: "Processes, systems, people and external events"
  },
  {
    id: "compliance",
    label: "Compliance and regulation",
    shortLabel: "Regulation",
    description: "Prudential, conduct and local rules"
  },
  {
    id: "cyber",
    label: "Cyber and technology risk",
    shortLabel: "Cyber",
    description: "Information security, resilience, cloud risk"
  },
  {
    id: "esg",
    label: "ESG and climate risk",
    shortLabel: "ESG",
    description: "Climate scenarios, taxonomy, disclosures"
  },
  {
    id: "capital",
    label: "Capital and leverage",
    shortLabel: "Capital",
    description: "Capital ratios, buffers, leverage constraints"
  }
];

function buildRefinementSuggestions(themeText: string, query: string) {
  const theme = themeText || "this theme";
  const baseQuery = query || "this topic";

  return [
    `Highlight overlapping and conflicting requirements related to ${theme}`,
    `Compare how different regulation sets describe ${theme} and where obligations collide`,
    `Identify duplicate or redundant requirements for ${theme} across multiple documents`,
    `Limit ${baseQuery} to a specific regulation family or jurisdiction`,
    `Explain practical conflicts that banks face when implementing ${theme}`,
    `Show where local rules tighten or contradict broader standards on ${theme}`
  ];
}

export default function BankRiskInsightsPage(): JSX.Element {
  const router = useRouter();

  const [themeText, setThemeText] = useState("Compliance and regulation");
  const [selectedPreset, setSelectedPreset] = useState<ThemeKey | null>("compliance");
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [submittedTheme, setSubmittedTheme] = useState<string | null>(null);
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);

  const activePreset = selectedPreset
    ? THEME_PRESETS.find((t) => t.id === selectedPreset)
    : null;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setSubmittedTheme(themeText.trim() || "Bank risks and regulation");
    setSubmittedQuery(query.trim());

    const encoded = encodeURIComponent(query.trim());
    router.push(`/results?query=${encoded}`);
  };

  const handlePresetClick = (presetId: ThemeKey) => {
    const preset = THEME_PRESETS.find((t) => t.id === presetId);
    if (!preset) return;
    setSelectedPreset(presetId);
    setThemeText(preset.label);
  };

  const currentThemeForSuggestions = submittedTheme ?? themeText;
  const currentQueryForSuggestions = submittedQuery ?? query;
  const suggestions = buildRefinementSuggestions(
    currentThemeForSuggestions,
    currentQueryForSuggestions
  );

  const handleUseRefinedQuery = () => {
    const cleanedTheme = currentThemeForSuggestions.trim();
    const cleanedQuery =
      query.trim() || currentQueryForSuggestions.trim() || "";

    const refinedQuery =
      (cleanedTheme ? `${cleanedTheme}: ` : "") +
      (cleanedQuery || "Find overlaps and contradictions in banking regulations");

    const encoded = encodeURIComponent(refinedQuery);
    router.push(`/results?query=${encoded}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center px-6 py-10">
      <div className="w-full max-w-5xl space-y-10">
        {/* Header and primary selector */}
        <header className="space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight">
            Get insights about
          </h1>
            {/*
          <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-4 flex flex-col gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-slate-800/70 p-2 mt-0.5">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm uppercase tracking-wide text-slate-400">
                  Theme or topic
                </p>
                <input
                  type="text"
                  value={themeText}
                  onChange={(e) => {
                    setThemeText(e.target.value);
                    setSelectedPreset(null);
                  }}
                  placeholder="For example liquidity regulation, credit risk, climate risk"
                  className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-slate-400">
                  Describe any risk or regulatory topic for banks. Use the circles below to quickly fill common themes.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            or try these themes
          </p>

          <div className="flex flex-wrap gap-6 md:flex-nowrap md:justify-between">
            {THEME_PRESETS.map((theme) => {
              const isActive = theme.id === selectedPreset;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handlePresetClick(theme.id)}
                  className="flex flex-col items-center gap-2 focus:outline-none"
                >
                  <div
                    className={[
                      "flex h-16 w-16 items-center justify-center rounded-full border text-xs font-medium",
                      "transition shadow-sm",
                      isActive
                        ? "border-emerald-400 bg-emerald-500/10 ring-2 ring-emerald-500/40"
                        : "border-slate-700 bg-slate-900/60 hover:border-slate-500"
                    ].join(" ")}
                  >
                    <span className="px-2 text-center leading-tight">
                      {theme.shortLabel}
                    </span>
                  </div>
                  <span
                    className={
                      "text-xs text-center max-w-[6rem] " +
                      (isActive ? "text-emerald-300" : "text-slate-400")
                    }
                  >
                    {theme.label}
                  </span>
                </button>
              );
            })}
          </div>*/}
        </header>

        {/* Search and refinement area */}
        <main className="space-y-6">
          {/* Search bar */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">
                AI search on banking risk and regulation
              </h2>
              <span className="text-xs font-normal text-slate-400">
                Theme: {themeText || "not set"}
              </span>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="What overlaps or contradictions in law texts are you interested in?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!themeText.trim() && !query.trim()}
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
            </form>

            {!hasSearched && (
              <p className="text-xs text-slate-400">
                For example  
                “Where do different regulation sets give conflicting signals on liquidity risk for medium sized banks in one region”.
              </p>
            )}
          </section>

          {/* 
          {hasSearched && (
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl p-5 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-slate-800/80 p-2">
                    <Filter className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">
                      Refine your search
                    </h2>
                    <p className="text-xs text-slate-400">
                      Narrow the scope so the engine can better detect overlaps and contradictions in the underlying law texts.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-xs text-slate-400 underline-offset-4 hover:underline"
                  onClick={() => setHasSearched(false)}
                >
                  Clear
                </button>
              </div>

              <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-3 text-sm">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Theme
                  </p>
                  <p className="text-slate-100">
                    {currentThemeForSuggestions}
                  </p>
                </div>
                {currentQueryForSuggestions && (
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Your question
                    </p>
                    <p className="text-slate-100">
                      {currentQueryForSuggestions}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Suggested refinements
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="border border-slate-700 bg-slate-950/60 text-xs px-3 py-1.5 rounded-full text-left hover:border-emerald-400"
                      onClick={() => setQuery(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-t border-slate-800 pt-4">
                <p className="text-xs text-slate-400">
                  When you are satisfied with the wording, use the refined query to search for overlapping and conflicting clauses in your law corpus.
                </p>
                <button
                  type="button"
                  onClick={handleUseRefinedQuery}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-medium bg-slate-100 text-slate-950 hover:bg-white"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Use refined query</span>
                </button>
              </div>
            </section>
          )*/}
        </main>
      </div>
    </div>
  );
}
