"use client";

import { motion } from "framer-motion";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { askFollowUp } from "@/lib/api";
import type { DiscoveryPreferences, FollowUpResponse, RecommendationCard } from "@/types";

type Props = {
  sessionId: string;
  recommendations: RecommendationCard[];
  preferences: DiscoveryPreferences;
};

const examples = [
  "Is this good for hills?",
  "Can I keep this for 10 years?",
  "Is maintenance expensive?",
  "What changes if I drive more?"
];

export function FollowUpPanel({ sessionId, recommendations, preferences }: Props) {
  const [question, setQuestion] = useState(examples[0]);
  const [response, setResponse] = useState<FollowUpResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(nextQuestion = question) {
    if (!nextQuestion.trim()) return;
    setLoading(true);
    setError(null);
    setQuestion(nextQuestion);
    try {
      setResponse(await askFollowUp(sessionId, nextQuestion, recommendations[0]?.variant_id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not answer follow-up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-ink p-6 h-full">
      <div className="mb-5 flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-amber" />
        <h3 className="text-2xl font-bold text-white">Ask AI</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {examples.map((example, i) => (
          <motion.button
            key={example}
            type="button"
            onClick={() => submit(example)}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-sm text-steel transition-colors hover:border-white/25 hover:bg-white/[0.07]"
          >
            {example}
          </motion.button>
        ))}
      </div>

      <div className="mt-5 flex gap-2">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !loading) submit();
          }}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-mist focus:border-teal focus:shadow-[0_0_12px_rgba(51,213,183,0.15)]"
          placeholder="Ask about your shortlist"
        />
        <Button size="icon" onClick={() => submit()} disabled={loading} aria-label="Send follow-up">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>

      {error && <p className="mt-4 rounded-xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}

      {response && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-5 rounded-xl border border-teal/25 bg-teal/10 p-4 space-y-4"
        >
          <p className="text-sm leading-7 text-steel">{response.answer}</p>
          
          {(response.context_used.knowledge_sources as any[])?.length > 0 && (
            <div className="rounded-lg bg-black/20 p-3">
              <p className="mb-2 text-xs font-semibold text-white/60 uppercase tracking-wider">Trusted Sources</p>
              <ul className="space-y-2">
                {(response.context_used.knowledge_sources as any[]).map((src, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-teal truncate max-w-[60%]">{src.source}</span>
                    <span className="text-mist">{src.updated_date} • {src.confidence} Confidence</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <p className="text-xs text-mist pt-1 border-t border-teal/10">
            Profile: {preferences.driving_style}, {preferences.monthly_running_km} km/month,{" "}
            {recommendations[0]?.brand} {recommendations[0]?.model}
          </p>
        </motion.div>
      )}
    </section>
  );
}
