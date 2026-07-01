"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import type { BuyerReport } from "@/types";

export function BuyerReportPanel({ report }: { report: BuyerReport }) {
  return (
    <section className="rounded-xl border border-white/10 bg-ink p-6 h-full">
      <div className="mb-5 flex items-center gap-3">
        <FileText className="h-6 w-6 text-teal" />
        <h3 className="text-2xl font-bold text-white">AI Buyer Report</h3>
      </div>
      <div className="space-y-4">
        {Object.entries(report.sections).map(([title, body], i) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="border-t border-white/10 pt-4 first:border-t-0 first:pt-0"
          >
            <h4 className="font-bold text-white">{title}</h4>
            <p className="mt-2 text-sm leading-6 text-steel/76">{body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
