"use client";

import { AnimatePresence, Reorder, motion } from "framer-motion";
import {
  Baby,
  BriefcaseBusiness,
  Building2,
  CarFront,
  Check,
  ChevronLeft,
  ChevronRight,
  Gem,
  HeartHandshake,
  KeyRound,
  Minus,
  Mountain,
  Plus,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards
} from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getBrands } from "@/lib/api";
import type { DiscoveryPreferences } from "@/types";

type Props = {
  preferences: DiscoveryPreferences;
  progress: number;
  loading: boolean;
  error: string | null;
  onChange: <K extends keyof DiscoveryPreferences>(
    key: K,
    value: DiscoveryPreferences[K]
  ) => void;
  onGenerate: () => void;
};

const purposes = [
  { label: "Daily Commute", icon: BriefcaseBusiness },
  { label: "Family", icon: Users },
  { label: "Adventure", icon: Mountain },
  { label: "Luxury", icon: Gem },
  { label: "First Car", icon: KeyRound },
  { label: "Business", icon: Building2 }
];

const drivingStyles = [
  { label: "City", icon: CarFront },
  { label: "Highway", icon: Route },
  { label: "Mixed", icon: Sparkles },
  { label: "Village", icon: HeartHandshake },
  { label: "Mountain", icon: Mountain }
];

const fuelTypes = ["Petrol", "Diesel", "Hybrid", "CNG", "EV"];
const futurePlans = ["Planning Kids", "Long Trips", "Need Big Boot", "Elderly Parents", "Pets"];
const fallbackBrands = ["Hyundai", "Honda", "Maruti Suzuki", "Tata", "Mahindra", "Kia", "Toyota", "Skoda"];

const STEPS = [
  { title: "Purpose", short: "Purpose" },
  { title: "Budget", short: "Budget" },
  { title: "Fuel", short: "Fuel" },
  { title: "Brands", short: "Brands" },
  { title: "Plans", short: "Plans" }
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.96
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.96
  })
};

const staggerContainer = {
  center: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15
    }
  }
};

const staggerItem = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

export function DiscoveryExperience({
  preferences,
  progress,
  loading,
  error,
  onChange,
  onGenerate
}: Props) {
  const [brands, setBrands] = useState(fallbackBrands);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    getBrands().then(setBrands).catch(() => setBrands(fallbackBrands));
  }, []);

  const goTo = useCallback(
    (nextStep: number) => {
      setDirection(nextStep > step ? 1 : -1);
      setStep(nextStep);
    },
    [step]
  );

  const next = useCallback(() => {
    if (step < STEPS.length - 1) goTo(step + 1);
  }, [step, goTo]);

  const prev = useCallback(() => {
    if (step > 0) goTo(step - 1);
  }, [step, goTo]);

  function toggleList<K extends "fuel_types" | "favorite_brands" | "avoid_brands" | "future_plans">(
    key: K,
    value: string
  ) {
    const current = preferences[key];
    onChange(
      key,
      current.includes(value)
        ? current.filter((item) => item !== value)
        : ([...current, value] as DiscoveryPreferences[K])
    );
  }

  const completedSteps = useMemo(() => {
    const completed = new Set<number>();
    if (preferences.purpose) completed.add(0);
    if (preferences.budget_max > 800000 || preferences.family_size !== 4 || preferences.transmission)
      completed.add(1);
    if (preferences.fuel_types.length > 0 || preferences.monthly_running_km !== 900)
      completed.add(2);
    if (preferences.favorite_brands.length > 0 || preferences.avoid_brands.length > 0)
      completed.add(3);
    if (preferences.future_plans.length > 0) completed.add(4);
    return completed;
  }, [preferences]);

  return (
    <section id="discovery" className="border-t border-white/10 px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        {/* ── Step Indicator ── */}
        <div className="mb-10">
          <div className="step-indicator mb-2">
            {STEPS.map((s, i) => (
              <StepNode
                key={s.title}
                index={i}
                label={s.short}
                active={step === i}
                completed={completedSteps.has(i) && step !== i}
                isLast={i === STEPS.length - 1}
                currentStep={step}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>

        {/* ── Wizard Body ── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Main panel */}
          <div className="relative min-h-[380px] overflow-hidden rounded-xl border border-white/10 bg-ink p-6 shadow-glow sm:p-8">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
              >
                <motion.div variants={staggerContainer} initial="enter" animate="center">
                  {step === 0 && (
                    <StepContent title="What's Your Purpose?" subtitle="Pick your primary driving need and style">
                      <motion.div variants={staggerItem}>
                        <h3 className="mb-3 text-sm font-medium text-mist">Primary Purpose</h3>
                        <ChoiceGrid>
                          {purposes.map(({ label, icon: Icon }) => (
                            <ChoiceCard
                              key={label}
                              active={preferences.purpose === label}
                              label={label}
                              onClick={() => onChange("purpose", label)}
                            >
                              <Icon className="h-6 w-6" />
                            </ChoiceCard>
                          ))}
                        </ChoiceGrid>
                      </motion.div>
                      <motion.div variants={staggerItem} className="mt-8">
                        <h3 className="mb-3 text-sm font-medium text-mist">Driving Style</h3>
                        <ChoiceGrid>
                          {drivingStyles.map(({ label, icon: Icon }) => (
                            <ChoiceCard
                              key={label}
                              active={preferences.driving_style === label}
                              label={label}
                              onClick={() => onChange("driving_style", label)}
                            >
                              <Icon className="h-6 w-6" />
                            </ChoiceCard>
                          ))}
                        </ChoiceGrid>
                      </motion.div>
                    </StepContent>
                  )}

                  {step === 1 && (
                    <StepContent title="Budget & Family" subtitle="Set your budget range and family needs">
                      <motion.div variants={staggerItem}>
                        <h3 className="mb-3 text-sm font-medium text-mist">Maximum Budget</h3>
                        <div className="grid gap-5 md:grid-cols-[1fr_180px] md:items-center">
                          <input
                            className="range-track w-full"
                            type="range"
                            min={800000}
                            max={3000000}
                            step={50000}
                            value={preferences.budget_max}
                            onChange={(event) => onChange("budget_max", Number(event.target.value))}
                          />
                          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                            <p className="text-sm text-mist">Upper range</p>
                            <p className="text-3xl font-semibold text-white">₹{preferences.budget_max / 100000}L</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div variants={staggerItem} className="mt-8 grid gap-6 md:grid-cols-2">
                        <div>
                          <h3 className="mb-3 text-sm font-medium text-mist">Family Size</h3>
                          <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-5">
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              onClick={() => onChange("family_size", Math.max(1, preferences.family_size - 1))}
                            >
                              <Minus className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center gap-3 text-white">
                              <Users className="h-7 w-7 text-amber" />
                              <span className="text-5xl font-semibold">{preferences.family_size}</span>
                            </div>
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              onClick={() => onChange("family_size", Math.min(8, preferences.family_size + 1))}
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h3 className="mb-3 text-sm font-medium text-mist">Transmission</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {["Automatic", "Manual"].map((item) => (
                              <Button
                                key={item}
                                variant={preferences.transmission === item ? "primary" : "secondary"}
                                size="lg"
                                className="h-full min-h-16"
                                onClick={() => onChange("transmission", item)}
                              >
                                {item}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </StepContent>
                  )}

                  {step === 2 && (
                    <StepContent title="Fuel & Running" subtitle="Choose your preferred fuel type and monthly usage">
                      <motion.div variants={staggerItem}>
                        <h3 className="mb-3 text-sm font-medium text-mist">Fuel Type</h3>
                        <ChipCloud>
                          {fuelTypes.map((item) => (
                            <Chip
                              key={item}
                              active={preferences.fuel_types.includes(item)}
                              onClick={() => toggleList("fuel_types", item)}
                            >
                              {item}
                            </Chip>
                          ))}
                        </ChipCloud>
                      </motion.div>

                      <motion.div variants={staggerItem} className="mt-8">
                        <h3 className="mb-3 text-sm font-medium text-mist">Monthly Running</h3>
                        <div className="grid gap-5 md:grid-cols-[1fr_180px] md:items-center">
                          <input
                            className="range-track w-full"
                            type="range"
                            min={200}
                            max={2500}
                            step={50}
                            value={preferences.monthly_running_km}
                            onChange={(event) => onChange("monthly_running_km", Number(event.target.value))}
                          />
                          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                            <p className="text-sm text-mist">Monthly</p>
                            <p className="text-3xl font-semibold text-white">{preferences.monthly_running_km} km</p>
                          </div>
                        </div>
                      </motion.div>
                    </StepContent>
                  )}

                  {step === 3 && (
                    <StepContent title="Brands & Priorities" subtitle="Tell us your brand preferences and what matters most">
                      <motion.div variants={staggerItem} className="grid gap-6 xl:grid-cols-2">
                        <div>
                          <h3 className="mb-3 text-sm font-medium text-mist">Favorite Brands</h3>
                          <ChipCloud>
                            {brands.map((item) => (
                              <Chip
                                key={item}
                                active={preferences.favorite_brands.includes(item)}
                                onClick={() => toggleList("favorite_brands", item)}
                              >
                                {item}
                              </Chip>
                            ))}
                          </ChipCloud>
                        </div>
                        <div>
                          <h3 className="mb-3 text-sm font-medium text-mist">Brands to Avoid</h3>
                          <ChipCloud>
                            {brands.map((item) => (
                              <Chip
                                key={item}
                                active={preferences.avoid_brands.includes(item)}
                                onClick={() => toggleList("avoid_brands", item)}
                              >
                                {item}
                              </Chip>
                            ))}
                          </ChipCloud>
                        </div>
                      </motion.div>

                      <motion.div variants={staggerItem} className="mt-8">
                        <h3 className="mb-3 text-sm font-medium text-mist">Priority Ranking (drag to reorder)</h3>
                        <Reorder.Group
                          axis="x"
                          values={preferences.priority_ranking}
                          onReorder={(items) => onChange("priority_ranking", items)}
                          className="flex flex-wrap gap-3"
                        >
                          {preferences.priority_ranking.map((item, index) => (
                            <Reorder.Item
                              key={item}
                              value={item}
                              className="cursor-grab rounded-lg border border-white/10 bg-white/[0.08] px-4 py-3 text-sm text-steel active:cursor-grabbing"
                            >
                              <span className="mr-2 text-mist">{index + 1}</span>
                              {item}
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>
                      </motion.div>
                    </StepContent>
                  )}

                  {step === 4 && (
                    <StepContent title="Future Plans" subtitle="Help us factor in your upcoming life changes">
                      <motion.div variants={staggerItem}>
                        <h3 className="mb-3 text-sm font-medium text-mist">What&apos;s Coming Up?</h3>
                        <ChipCloud>
                          {futurePlans.map((item) => (
                            <Chip
                              key={item}
                              active={preferences.future_plans.includes(item)}
                              onClick={() => toggleList("future_plans", item)}
                            >
                              {item === "Planning Kids" && <Baby className="h-4 w-4" />}
                              {item === "Need Big Boot" && <WalletCards className="h-4 w-4" />}
                              {item}
                            </Chip>
                          ))}
                        </ChipCloud>
                      </motion.div>

                      <motion.div variants={staggerItem} className="mt-10">
                        <div className="rounded-xl border border-teal/20 bg-teal/5 p-6 text-center">
                          <Sparkles className="mx-auto mb-3 h-8 w-8 text-teal" />
                          <p className="text-lg font-semibold text-white">Ready to find your perfect car?</p>
                          <p className="mt-2 text-sm text-mist">
                            Our AI will analyze your profile and recommend the top 3 cars tailored just for you.
                          </p>
                          <Button
                            className="btn-glow mt-5"
                            size="lg"
                            onClick={onGenerate}
                            disabled={loading}
                          >
                            <Sparkles className="h-5 w-5" />
                            Generate Top 3
                          </Button>
                        </div>
                      </motion.div>
                    </StepContent>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* ── Navigation Buttons ── */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={prev}
                disabled={step === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              {step < STEPS.length - 1 ? (
                <Button onClick={next} className="gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={onGenerate} disabled={loading} className="btn-glow gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate
                </Button>
              )}
            </div>

            {error && <p className="mt-4 rounded-lg bg-coral/10 p-3 text-sm text-coral">{error}</p>}
          </div>

          {/* ── Sidebar Summary ── */}
          <aside className="hidden lg:block">
            <div className="glass-panel sticky top-5 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal/15 text-teal">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-mist">Your driving profile</p>
                  <p className="text-2xl font-semibold text-white">{progress}%</p>
                </div>
              </div>
              <div className="mt-5">
                <Progress value={progress} />
              </div>
              <div className="mt-6 space-y-4 text-sm text-mist">
                <ProfileLine label="Purpose" value={preferences.purpose} />
                <ProfileLine label="Budget" value={`₹${preferences.budget_max / 100000}L`} />
                <ProfileLine label="Family" value={`${preferences.family_size} people`} />
                <ProfileLine
                  label="Driving"
                  value={`${preferences.driving_style}, ${preferences.monthly_running_km} km/mo`}
                />
                {preferences.fuel_types.length > 0 && (
                  <ProfileLine label="Fuel" value={preferences.fuel_types.join(", ")} />
                )}
                {preferences.favorite_brands.length > 0 && (
                  <ProfileLine label="Brands" value={preferences.favorite_brands.join(", ")} />
                )}
              </div>
              <Button
                className="btn-glow mt-6 w-full"
                size="lg"
                onClick={onGenerate}
                disabled={loading}
              >
                <Sparkles className="h-5 w-5" />
                Generate Top 3
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ─── Step Node ─── */
function StepNode({
  index,
  label,
  active,
  completed,
  isLast,
  currentStep,
  onClick
}: {
  index: number;
  label: string;
  active: boolean;
  completed: boolean;
  isLast: boolean;
  currentStep: number;
  onClick: () => void;
}) {
  return (
    <>
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "step-dot",
            active && "active",
            completed && "completed"
          )}
        >
          {completed ? <Check className="h-4 w-4" /> : index + 1}
        </button>
        <span className={cn("step-label", active && "active", completed && "completed")}>
          {label}
        </span>
      </div>
      {!isLast && (
        <div className="step-line mt-[-18px]">
          <div
            className="step-line-fill"
            style={{
              transform: `scaleX(${currentStep > index ? 1 : 0})`
            }}
          />
        </div>
      )}
    </>
  );
}

/* ─── Step Content Wrapper ─── */
function StepContent({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm text-mist">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

/* ─── Sub-components ─── */

function ChoiceGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{children}</div>;
}

function ChoiceCard({
  active,
  label,
  onClick,
  children
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "flex min-h-28 flex-col items-start justify-between rounded-xl border p-4 text-left transition-colors",
        active
          ? "border-teal bg-teal/12 text-white shadow-[0_0_20px_rgba(51,213,183,0.15)]"
          : "border-white/10 bg-white/[0.04] text-steel hover:border-white/25 hover:bg-white/[0.07]"
      )}
    >
      <span className={active ? "text-teal" : "text-mist"}>{children}</span>
      <span className="text-base font-medium">{label}</span>
    </motion.button>
  );
}

function ChipCloud({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function Chip({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors",
        active
          ? "border-amber bg-amber/15 text-white shadow-[0_0_14px_rgba(244,185,66,0.15)]"
          : "border-white/10 bg-white/[0.04] text-steel hover:border-white/25"
      )}
    >
      {children}
    </motion.button>
  );
}

function ProfileLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="max-w-[140px] truncate text-right text-steel">{value}</span>
    </div>
  );
}
