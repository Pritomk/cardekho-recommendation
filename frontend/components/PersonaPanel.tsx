"use client";

import { motion } from "framer-motion";
import { Gauge, HeartHandshake, Route, ShieldCheck, Sofa, Target, WalletCards } from "lucide-react";
import type { DriverPersona } from "@/types";

const rows = [
  ["Driving habits", "driving_habits", Route],
  ["Budget behaviour", "budget_behaviour", WalletCards],
  ["Risk tolerance", "risk_tolerance", ShieldCheck],
  ["Comfort preference", "comfort_preference", Sofa],
  ["Family needs", "family_needs", HeartHandshake],
  ["Ownership goals", "ownership_goals", Target]
] as const;

const cardVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    x: i % 2 === 0 ? -40 : 40,
    y: 10
  }),
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.08,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
};

export function PersonaPanel({ persona }: { persona: DriverPersona }) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map(([label, key, Icon], i) => (
        <motion.div
          key={key}
          custom={i}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={cardVariants}
          className="rounded-xl border border-white/10 bg-ink p-4 transition-colors hover:bg-white/[0.04]"
          whileHover={{ y: -2, scale: 1.01 }}
        >
          <div className="mb-3 flex items-center gap-2 text-sm text-mist">
            <Icon className="h-4 w-4 text-teal" />
            {label}
          </div>
          <p className="text-sm leading-6 text-steel">{persona[key]}</p>
        </motion.div>
      ))}
      <motion.div
        custom={rows.length}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={cardVariants}
        className="rounded-xl border border-amber/25 bg-amber/10 p-4"
        whileHover={{ y: -2, scale: 1.01 }}
      >
        <div className="mb-3 flex items-center gap-2 text-sm text-amber">
          <Gauge className="h-4 w-4" />
          Persona
        </div>
        <p className="text-sm leading-6 text-steel">{persona.summary}</p>
      </motion.div>
    </section>
  );
}
