"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lightbulb, TrendingUp, Zap } from "lucide-react";
import type { SmartInsight } from "@/types";

type Props = {
  insights: SmartInsight[];
};

const NUDGE_TYPES: Record<string, { icon: typeof Lightbulb; accent: string; border: string; bg: string }> = {
  budget: {
    icon: TrendingUp,
    accent: "text-amber",
    border: "border-amber/25",
    bg: "bg-gradient-to-r from-amber/[0.08] to-amber/[0.03]"
  },
  fuel: {
    icon: Zap,
    accent: "text-teal",
    border: "border-teal/25",
    bg: "bg-gradient-to-r from-teal/[0.08] to-teal/[0.03]"
  },
  family: {
    icon: Lightbulb,
    accent: "text-coral",
    border: "border-coral/20",
    bg: "bg-gradient-to-r from-coral/[0.06] to-coral/[0.02]"
  },
  future: {
    icon: Lightbulb,
    accent: "text-teal",
    border: "border-teal/20",
    bg: "bg-gradient-to-r from-teal/[0.06] to-teal/[0.02]"
  },
  ownership: {
    icon: TrendingUp,
    accent: "text-amber",
    border: "border-amber/20",
    bg: "bg-gradient-to-r from-amber/[0.06] to-amber/[0.02]"
  },
  knowledge: {
    icon: Lightbulb,
    accent: "text-teal",
    border: "border-teal/25",
    bg: "bg-gradient-to-r from-teal/[0.08] to-teal/[0.03]"
  }
};

const DEFAULT_STYLE = {
  icon: Lightbulb,
  accent: "text-teal",
  border: "border-teal/20",
  bg: "bg-gradient-to-r from-teal/[0.06] to-teal/[0.02]"
};

/**
 * Displays the top 1–2 most actionable AI insights as prominent
 * nudge banners right after the recommendation cards.
 * Designed to be eye-catching with contrast but not annoying.
 */
export function AiNudgeBanner({ insights }: Props) {
  // Show the most actionable nudges (knowledge/budget/fuel first), max 2
  const nudges = insights
    .filter((i) => ["knowledge", "budget", "fuel"].includes(i.type))
    .slice(0, 2);

  // If no high-priority nudge, show the first available insight
  if (nudges.length === 0 && insights.length > 0) {
    nudges.push(insights[0]);
  }

  if (nudges.length === 0) return null;

  return (
    <div className="space-y-3">
      {nudges.map((insight, i) => {
        const style = NUDGE_TYPES[insight.type] ?? DEFAULT_STYLE;
        const Icon = style.icon;

        return (
          <motion.div
            key={`${insight.type}-${insight.title}`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`group relative overflow-hidden rounded-xl border ${style.border} ${style.bg} p-5 transition-all duration-300 hover:scale-[1.005]`}
          >
            {/* Subtle animated accent line on the left */}
            <motion.div
              className={`absolute left-0 top-0 h-full w-[3px] ${style.accent.replace("text-", "bg-")}`}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.4 }}
              style={{ transformOrigin: "top" }}
            />

            <div className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.accent.replace(
                  "text-",
                  "bg-"
                )}/15 ${style.accent}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${style.accent}`}>
                    AI Suggestion
                  </span>
                  <ArrowRight className={`h-3 w-3 ${style.accent} opacity-0 transition-opacity group-hover:opacity-100`} />
                </div>
                <h4 className="mt-1 text-base font-bold text-white">{insight.title}</h4>
                <p className="mt-1.5 text-sm leading-6 text-steel/80">{insight.description}</p>
                <p className={`mt-2 text-xs font-medium ${style.accent} opacity-80`}>
                  {insight.impact}
                </p>
                {insight.source && (
                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] uppercase tracking-wider text-mist">
                    <span>Source: {insight.source}</span>
                    <span className="flex items-center gap-1">
                      {insight.updated_date} • {insight.confidence} Confidence
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
