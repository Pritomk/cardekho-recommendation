export type DiscoveryPreferences = {
  purpose: string;
  budget_min: number;
  budget_max: number;
  family_size: number;
  transmission: string | null;
  fuel_types: string[];
  driving_style: string;
  monthly_running_km: number;
  priority_ranking: string[];
  favorite_brands: string[];
  avoid_brands: string[];
  future_plans: string[];
};

export type DriverPersona = {
  name: string;
  summary: string;
  driving_habits: string;
  budget_behaviour: string;
  risk_tolerance: string;
  comfort_preference: string;
  family_needs: string;
  ownership_goals: string;
};

export type ScoreBreakdown = {
  safety: number;
  comfort: number;
  maintenance: number;
  mileage: number;
  driving_match: number;
  family_match: number;
  ownership_cost: number;
  resale: number;
  performance: number;
  budget_match: number;
};

export type RecommendationCard = {
  variant_id: number;
  brand: string;
  model: string;
  variant: string;
  image_url: string | null;
  price: number;
  mileage: number;
  safety_rating: number;
  transmission: string;
  fuel_type: string;
  monthly_cost_estimate: number;
  total_score: number;
  scores: ScoreBreakdown;
  why_this_car_for_you: string;
  tradeoffs: string[];
  pros: string[];
  cons: string[];
};

export type RejectedCar = {
  brand: string;
  model: string;
  variant: string;
  reasons: string[];
};

export type SmartInsight = {
  title: string;
  type: string;
  description: string;
  impact: string;
  source?: string;
  updated_date?: string;
  confidence?: string;
};

export type BuyerReport = {
  sections: Record<string, string>;
};

export type RecommendationResponse = {
  session_id: string;
  persona: DriverPersona;
  top_recommendations: RecommendationCard[];
  rejected_cars: RejectedCar[];
  insights: SmartInsight[];
  buyer_report: BuyerReport;
};

export type CompareItem = {
  variant_id: number;
  label: string;
  best_for: string;
  ai_summary: string;
  scores: ScoreBreakdown;
};

export type CompareResponse = {
  session_id: string;
  items: CompareItem[];
  verdict: string;
};

export type FollowUpResponse = {
  answer: string;
  context_used: Record<string, unknown>;
};

