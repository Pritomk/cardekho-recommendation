"use client";

import { motion } from "framer-motion";
import { AlertTriangle, BrainCircuit, CarFront, FileText } from "lucide-react";
import type { DiscoveryPreferences, RecommendationResponse } from "@/types";
import { AiNudgeBanner } from "@/components/AiNudgeBanner";
import { PersonaPanel } from "@/components/PersonaPanel";
import { RecommendationCardView } from "@/components/RecommendationCard";
import { SmartInsights } from "@/components/SmartInsights";
import { ComparePanel } from "@/components/ComparePanel";
import { BuyerReportPanel } from "@/components/BuyerReportPanel";
import { FollowUpPanel } from "@/components/FollowUpPanel";

type Props = {
  result: RecommendationResponse;
  preferences: DiscoveryPreferences;
};

/* ── Shared animation presets ── */
const slideFromLeft = {
  initial: { opacity: 0, x: -80 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-100px" as const },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
};

const slideFromRight = {
  initial: { opacity: 0, x: 80 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-100px" as const },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
};

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
};

export function RecommendationResults({ result, preferences }: Props) {
  const variantIds = result.top_recommendations.map((item) => item.variant_id);

  return (
    <section id="recommendations" className="border-t border-white/10 px-5 py-14 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-14">
        {/* ── Persona Header — slide from left ── */}
        <motion.div
          {...slideFromLeft}
          className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-2 text-sm text-teal">
              <BrainCircuit className="h-4 w-4" />
              Your Driving Profile
            </div>
            <h2 className="text-4xl font-bold text-white sm:text-5xl">
              {result.persona.name}
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-steel/80">
              {result.persona.summary}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-mist">
            Session {result.session_id.slice(0, 8)}
          </div>
        </motion.div>

        {/* ── Persona Cards — slide from right ── */}
        <motion.div {...slideFromRight}>
          <PersonaPanel persona={result.persona} />
        </motion.div>

        {/* ── Top 3 Cars — staggered from right ── */}
        <motion.div {...slideFromRight}>
          <div className="mb-6 flex items-center gap-3">
            <CarFront className="h-6 w-6 text-amber" />
            <h3 className="text-2xl font-bold text-white">Top 3 Cars</h3>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {result.top_recommendations.map((recommendation, index) => (
              <RecommendationCardView
                key={recommendation.variant_id}
                recommendation={recommendation}
                rank={index + 1}
              />
            ))}
          </div>
        </motion.div>

        {/* ── AI Nudge Banners — RIGHT after Top 3, prominent position ── */}
        {result.insights.length > 0 && (
          <motion.div {...fadeUp}>
            <AiNudgeBanner insights={result.insights} />
          </motion.div>
        )}

        {/* ── Why Not Others — slide from left ── */}
        <motion.section
          {...slideFromLeft}
          className="rounded-xl border border-white/10 bg-ink p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-coral" />
            <h3 className="text-xl font-bold text-white">Why Not The Others</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {result.rejected_cars.map((car) => (
              <motion.div
                key={`${car.brand}-${car.model}-${car.variant}`}
                className="rounded-xl bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.07]"
                whileHover={{ scale: 1.01 }}
              >
                <p className="font-semibold text-white">
                  {car.brand} {car.model}
                </p>
                <p className="text-sm text-mist">{car.variant}</p>
                <ul className="mt-3 space-y-2 text-sm text-steel/80">
                  {car.reasons.map((reason) => (
                    <li key={reason}>— {reason}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Compare — slide from left ── */}
        <motion.div {...slideFromLeft}>
          <ComparePanel sessionId={result.session_id} variantIds={variantIds} />
        </motion.div>

        {/* ── Smart Insights (remaining details) — slide from right ── */}
        <motion.div {...slideFromRight}>
          <SmartInsights insights={result.insights} />
        </motion.div>

        {/* ── Buyer Report + Follow-Up — alternating ── */}
        <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <motion.div {...slideFromLeft}>
            <BuyerReportPanel report={result.buyer_report} />
          </motion.div>
          <motion.div {...slideFromRight} id="follow-up">
            <FollowUpPanel
              sessionId={result.session_id}
              recommendations={result.top_recommendations}
              preferences={preferences}
            />
          </motion.div>
        </section>

        {/* ── Recommendation Method — fade up ── */}
        <motion.section
          {...fadeUp}
          className="rounded-xl border border-white/10 bg-white/[0.04] p-6"
        >
          <div className="mb-3 flex items-center gap-3">
            <FileText className="h-5 w-5 text-teal" />
            <h3 className="text-xl font-bold text-white">Recommendation Method</h3>
          </div>
          <p className="text-sm leading-7 text-steel/75">
            The backend calculates candidates first and scores every car across safety, comfort,
            maintenance, mileage, driving match, family match, ownership cost, resale, performance,
            and budget match. The AI layer explains the recommendation and answers follow-up
            questions using your session context.
          </p>
        </motion.section>
      </div>
    </section>
  );
}
