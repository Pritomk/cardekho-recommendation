"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { BarChart3, Crown, Loader2, Scale, Trophy } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { compareRecommendations } from "@/lib/api";
import type { CompareItem, CompareResponse, ScoreBreakdown } from "@/types";

type Props = {
  sessionId: string;
  variantIds: number[];
};

const SCORE_LABELS: { key: keyof ScoreBreakdown; label: string; emoji: string }[] = [
  { key: "safety", label: "Safety", emoji: "🛡️" },
  { key: "comfort", label: "Comfort", emoji: "🛋️" },
  { key: "mileage", label: "Mileage", emoji: "⛽" },
  { key: "maintenance", label: "Maintenance", emoji: "🔧" },
  { key: "driving_match", label: "Driving Fit", emoji: "🛣️" },
  { key: "family_match", label: "Family Fit", emoji: "👨‍👩‍👧‍👦" },
  { key: "ownership_cost", label: "Ownership", emoji: "💰" },
  { key: "resale", label: "Resale", emoji: "📈" },
  { key: "performance", label: "Performance", emoji: "⚡" },
  { key: "budget_match", label: "Budget Fit", emoji: "🎯" }
];

const BAR_COLORS = [
  "from-teal to-teal/60",
  "from-amber to-amber/60",
  "from-coral to-coral/60"
];

export function ComparePanel({ sessionId, variantIds }: Props) {
  const [comparison, setComparison] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadComparison() {
    setLoading(true);
    setError(null);
    try {
      setComparison(await compareRecommendations(sessionId, variantIds));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not compare cars");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="compare" className="rounded-xl border border-white/10 bg-ink p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <Scale className="h-6 w-6 text-amber" />
            <h3 className="text-2xl font-bold text-white">Compare Top 3</h3>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-steel/75">
            Point-by-point comparison across 10 scoring dimensions. See exactly where each car excels.
          </p>
        </div>
        <Button onClick={loadComparison} disabled={loading}>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <BarChart3 className="h-5 w-5" />
          )}
          {comparison ? "Refresh" : "Compare"}
        </Button>
      </div>

      {error && <p className="mt-4 rounded-xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}

      <AnimatePresence>
        {comparison && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mt-6 space-y-6"
          >
            {/* Verdict */}
            <div className="flex items-start gap-3 rounded-xl border border-teal/25 bg-teal/8 p-4">
              <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
              <p className="text-sm leading-6 text-steel">{comparison.verdict}</p>
            </div>

            {/* Car column headers */}
            <div className="grid grid-cols-[140px_1fr] gap-4 sm:grid-cols-[160px_1fr]">
              <div />
              <div className="grid grid-cols-3 gap-3">
                {comparison.items.map((item, i) => (
                  <motion.div
                    key={item.variant_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="text-center"
                  >
                    <div
                      className={`mx-auto mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                        i === 0
                          ? "bg-teal/15 text-teal"
                          : i === 1
                            ? "bg-amber/15 text-amber"
                            : "bg-coral/15 text-coral"
                      }`}
                    >
                      #{i + 1}
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{item.label}</p>
                    <p className="mt-1 text-xs text-mist truncate">{item.best_for}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Score rows */}
            <ScoreComparisonGrid items={comparison.items} />

            {/* AI Summaries */}
            <div className="grid gap-4 lg:grid-cols-3">
              {comparison.items.map((item, i) => (
                <motion.article
                  key={item.variant_id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`rounded-xl border p-4 transition-colors hover:bg-white/[0.04] ${
                    i === 0
                      ? "border-teal/20 bg-teal/[0.04]"
                      : i === 1
                        ? "border-amber/15 bg-amber/[0.03]"
                        : "border-coral/15 bg-coral/[0.03]"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    {i === 0 && <Crown className="h-4 w-4 text-teal" />}
                    <h4 className="text-sm font-bold text-white">{item.label}</h4>
                  </div>
                  <p className="text-sm leading-6 text-steel/75">{item.ai_summary}</p>
                </motion.article>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ─── Score Comparison Grid ─── */
function ScoreComparisonGrid({ items }: { items: CompareItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="space-y-1">
      {SCORE_LABELS.map(({ key, label, emoji }, rowIdx) => {
        const values = items.map((item) => item.scores[key]);
        const maxVal = Math.max(...values);

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: rowIdx * 0.04, duration: 0.35 }}
            className="grid grid-cols-[140px_1fr] items-center gap-4 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.03] sm:grid-cols-[160px_1fr]"
          >
            <div className="flex items-center gap-2 text-sm text-mist">
              <span className="text-base">{emoji}</span>
              <span className="font-medium">{label}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {items.map((item, carIdx) => {
                const val = item.scores[key];
                const isBest = val === maxVal && values.filter((v) => v === maxVal).length === 1;
                return (
                  <div key={item.variant_id} className="flex items-center gap-2">
                    <div className="flex-1 h-[6px] rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${BAR_COLORS[carIdx]}`}
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${val}%` } : { width: 0 }}
                        transition={{
                          duration: 0.7,
                          delay: rowIdx * 0.04 + carIdx * 0.06,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                      />
                    </div>
                    <span
                      className={`w-8 text-right text-xs font-semibold tabular-nums ${
                        isBest ? "text-teal" : "text-steel/70"
                      }`}
                    >
                      {Math.round(val)}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
