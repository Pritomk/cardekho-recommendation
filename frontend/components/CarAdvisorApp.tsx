"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ChevronDown, Edit3, Loader2, Sparkles } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { createRecommendations } from "@/lib/api";
import type { DiscoveryPreferences, RecommendationResponse } from "@/types";
import { DiscoveryExperience } from "@/components/DiscoveryExperience";
import { RecommendationResults } from "@/components/RecommendationResults";

const initialPreferences: DiscoveryPreferences = {
  purpose: "Daily Commute",
  budget_min: 700000,
  budget_max: 1800000,
  family_size: 4,
  transmission: "Automatic",
  fuel_types: ["Petrol", "Hybrid"],
  driving_style: "City",
  monthly_running_km: 900,
  priority_ranking: [
    "Safety",
    "Comfort",
    "Mileage",
    "Maintenance",
    "Resale",
    "Performance",
    "Luxury"
  ],
  favorite_brands: [],
  avoid_brands: [],
  future_plans: []
};

export function CarAdvisorApp() {
  const [preferences, setPreferences] = useState<DiscoveryPreferences>(initialPreferences);
  const [touched, setTouched] = useState<Set<string>>(new Set(["purpose"]));
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoveryCollapsed, setDiscoveryCollapsed] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroImgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const progress = useMemo(() => Math.min(100, 10 + touched.size * 12), [touched]);

  const updatePreference = useCallback(
    <K extends keyof DiscoveryPreferences>(key: K, value: DiscoveryPreferences[K]) => {
      setPreferences((current) => ({ ...current, [key]: value }));
      setTouched((current) => new Set(current).add(key));
    },
    []
  );

  async function generateRecommendations() {
    setLoading(true);
    setError(null);
    try {
      const response = await createRecommendations(preferences, sessionId);
      setResult(response);
      setSessionId(response.session_id);
      setTouched((current) => new Set(current).add("recommendations"));
      setDiscoveryCollapsed(true);
      setTimeout(() => {
        document.getElementById("recommendations")?.scrollIntoView({ behavior: "smooth" });
      }, 120);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not generate recommendations");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-graphite text-steel">
      {/* ── Hero Section with Parallax ── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[88svh] items-end overflow-hidden px-5 pb-12 pt-24 sm:px-8 lg:px-12"
      >
        <motion.div
          className="parallax-bg absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=85)",
            y: heroImgY
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,15,18,0.15),rgba(13,15,18,0.95))]" />
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          style={{ y: heroTextY, opacity: heroOpacity }}
          className="relative z-10 max-w-4xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm text-steel backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-teal" />
            AI Car Buying Advisor
          </div>
          <h1 className="max-w-4xl text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Find the Right Car,{" "}
            <span className="gradient-text">Not Just the Popular One.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-steel/85">
            A recommendation engine that builds your driving profile, scores real tradeoffs, and
            explains every pick in human terms.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => {
                setDiscoveryCollapsed(false);
                setTimeout(() => {
                  document.getElementById("discovery")?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
            >
              Start Discovering
              <ArrowDown className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={generateRecommendations}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              Quick Match
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── Collapsed Summary Bar ── */}
      <AnimatePresence>
        {discoveryCollapsed && result && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="summary-bar sticky top-0 z-30 overflow-hidden"
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
              <div className="flex flex-wrap items-center gap-2">
                <SummaryChip label={preferences.purpose} />
                <SummaryChip label={`₹${preferences.budget_max / 100000}L`} />
                <SummaryChip label={`${preferences.family_size} people`} />
                <SummaryChip label={preferences.driving_style} />
                {preferences.fuel_types.slice(0, 2).map((ft) => (
                  <SummaryChip key={ft} label={ft} />
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDiscoveryCollapsed(false);
                  setTimeout(() => {
                    document.getElementById("discovery")?.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }}
                className="shrink-0 gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Edit Preferences
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Discovery Wizard ── */}
      <AnimatePresence>
        {!discoveryCollapsed && (
          <motion.div
            initial={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <DiscoveryExperience
              preferences={preferences}
              progress={progress}
              loading={loading}
              error={error}
              onChange={updatePreference}
              onGenerate={generateRecommendations}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Section Divider ── */}
      {result && <div className="section-divider" />}

      {/* ── Loading Skeletons ── */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.section
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-5 py-12 sm:px-8 lg:px-12"
          >
            <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-96 rounded-xl border border-white/10 p-4">
                  <div className="skeleton h-44 rounded-lg" />
                  <div className="skeleton mt-5 h-6 w-2/3 rounded" />
                  <div className="skeleton mt-3 h-4 w-full rounded" />
                  <div className="skeleton mt-2 h-4 w-5/6 rounded" />
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {result && !loading && (
          <RecommendationResults
            key={result.session_id}
            result={result}
            preferences={preferences}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function SummaryChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-steel">
      {label}
    </span>
  );
}
