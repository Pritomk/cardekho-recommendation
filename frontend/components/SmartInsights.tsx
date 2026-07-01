"use client";

import { motion } from "framer-motion";
import { Fuel, IndianRupee, Lightbulb, UsersRound } from "lucide-react";
import type { SmartInsight } from "@/types";

const icons = {
  budget: IndianRupee,
  fuel: Fuel,
  family: UsersRound,
  future: Lightbulb,
  ownership: IndianRupee,
  knowledge: Lightbulb
};

const cardVariant = {
  hidden: { opacity: 0, x: 60, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      delay: i * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
};

export function SmartInsights({ insights }: { insights: SmartInsight[] }) {
  return (
    <section>
      <div className="mb-6 flex items-center gap-3">
        <Lightbulb className="h-6 w-6 text-teal" />
        <h3 className="text-2xl font-bold text-white">Smart Insights</h3>
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        {insights.map((insight, i) => {
          const Icon = icons[insight.type as keyof typeof icons] ?? Lightbulb;
          return (
            <motion.article
              key={`${insight.type}-${insight.title}`}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={cardVariant}
              whileHover={{ y: -4, scale: 1.02 }}
              className="rounded-xl border border-white/10 bg-ink p-5 transition-shadow hover:shadow-[0_8px_30px_rgba(51,213,183,0.08)]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-teal/12 text-teal">
                <Icon className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold text-white">{insight.title}</h4>
              <p className="mt-3 text-sm leading-6 text-steel/78">{insight.description}</p>
              <p className="mt-4 text-sm font-medium text-amber">{insight.impact}</p>
              
              {insight.source && (
                <div className="mt-4 flex flex-col gap-1 border-t border-white/5 pt-3 text-[10px] uppercase tracking-wider text-mist">
                  <span className="truncate">Source: {insight.source}</span>
                  <span>{insight.updated_date} • {insight.confidence} Conf.</span>
                </div>
              )}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
