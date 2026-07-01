import type {
  CompareResponse,
  DiscoveryPreferences,
  FollowUpResponse,
  RecommendationResponse
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getBrands() {
  return request<string[]>("/api/brands");
}

export function createRecommendations(
  preferences: DiscoveryPreferences,
  sessionId?: string
) {
  return request<RecommendationResponse>("/api/recommendations", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      preferences
    })
  });
}

export function compareRecommendations(sessionId: string, variantIds?: number[]) {
  return request<CompareResponse>("/api/compare", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      variant_ids: variantIds
    })
  });
}

export function askFollowUp(
  sessionId: string,
  question: string,
  variantId?: number
) {
  return request<FollowUpResponse>("/api/follow-up", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      question,
      variant_id: variantId
    })
  });
}

