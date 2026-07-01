"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { ChevronDown, Fuel, Gauge, IndianRupee, MessageCircle, Scale, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatLakhs, formatRupees } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RecommendationCard } from "@/types";

type Props = {
  recommendation: RecommendationCard;
  rank: number;
};

export function RecommendationCardView({ recommendation, rank }: Props) {
  const [open, setOpen] = useState(rank === 1);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: rank * 0.12, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "card-hover-glow overflow-hidden rounded-xl border border-white/10 bg-ink",
        rank === 1 && "ring-1 ring-teal/20"
      )}
    >
      <div className="relative h-48 overflow-hidden bg-white/[0.04]">
        {recommendation.image_url && (
          <motion.img
            src={recommendation.image_url}
            alt={`${recommendation.brand} ${recommendation.model}`}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-graphite/90 via-graphite/30 to-transparent" />
        <div
          className={cn(
            "absolute left-4 top-4 rounded-lg px-3 py-2 text-sm font-semibold text-white",
            rank === 1 ? "rank-shimmer bg-teal/80" : "bg-black/55"
          )}
        >
          #{rank}
        </div>
        <div className="absolute bottom-4 right-4 rounded-lg bg-teal px-3 py-2 text-sm font-bold text-graphite">
          {recommendation.total_score}/100
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-mist">{recommendation.brand}</p>
            <h3 className="mt-1 text-2xl font-bold text-white">{recommendation.model}</h3>
            <p className="mt-1 text-sm text-steel/70">{recommendation.variant}</p>
          </div>
          <p className="rounded-xl bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white">
            {formatLakhs(recommendation.price)}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
          <Metric icon={<Fuel className="h-4 w-4" />} label="Mileage" value={`${recommendation.mileage} km/l`} />
          <Metric icon={<ShieldCheck className="h-4 w-4" />} label="Safety" value={`${recommendation.safety_rating} star`} />
          <Metric icon={<Gauge className="h-4 w-4" />} label="Drive" value={recommendation.transmission} />
          <Metric icon={<IndianRupee className="h-4 w-4" />} label="Monthly" value={formatRupees(recommendation.monthly_cost_estimate)} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setOpen((current) => !current)}>
            View Why
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-180")} />
          </Button>
          <Button
            variant="secondary"
            onClick={() => document.getElementById("compare")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Scale className="h-4 w-4" />
            Compare
          </Button>
          <Button
            variant="secondary"
            onClick={() => document.getElementById("follow-up")?.scrollIntoView({ behavior: "smooth" })}
          >
            <MessageCircle className="h-4 w-4" />
            Ask AI
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="mt-5 overflow-hidden border-t border-white/10 pt-5"
            >
              <div>
                <p className="mb-2 text-sm font-semibold text-teal">Why this car for you</p>
                <p className="text-sm leading-7 text-steel/82">{recommendation.why_this_car_for_you}</p>
              </div>
              <div className="mt-4">
                <AnimatedScoreBars scores={recommendation.scores} />
              </div>
              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-amber">Tradeoffs</p>
                <ul className="space-y-2 text-sm text-steel/78">
                  {recommendation.tradeoffs.map((tradeoff) => (
                    <li key={tradeoff}>— {tradeoff}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

function Metric({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-3 transition-colors hover:bg-white/[0.07]">
      <div className="flex items-center gap-2 text-mist">
        {icon}
        {label}
      </div>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function AnimatedScoreBars({ scores }: { scores: RecommendationCard["scores"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const entries: [string, number][] = [
    ["Safety", scores.safety],
    ["Comfort", scores.comfort],
    ["Mileage", scores.mileage],
    ["Maintenance", scores.maintenance],
    ["Family", scores.family_match],
    ["Budget", scores.budget_match]
  ];

  return (
    <div ref={ref} className="space-y-3">
      {entries.map(([label, value], i) => (
        <div key={label}>
          <div className="mb-1 flex justify-between text-xs text-mist">
            <span>{label}</span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: i * 0.08 + 0.3 }}
            >
              {value}
            </motion.span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-teal to-teal/70"
              initial={{ width: 0 }}
              animate={isInView ? { width: `${value}%` } : { width: 0 }}
              transition={{
                duration: 0.8,
                delay: i * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
