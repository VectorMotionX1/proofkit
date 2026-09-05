export type Decision = "Pending" | "Approved" | "Changes requested";

export type Evidence = { id: number; label: string; detail: string };

export type ReviewPayload = {
  requestTitle: string;
  reviewer: string;
  evidence: Evidence[];
  decision: Decision;
  expiresAt?: number;
};

export function encodeReviewPayload(payload: ReviewPayload) {
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function decodeReviewPayload(value: string): ReviewPayload | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(value))) as ReviewPayload;
    if (!parsed.requestTitle || !Array.isArray(parsed.evidence)) return null;
    if (typeof parsed.expiresAt === "number" && Date.now() > parsed.expiresAt) return null;
    return {
      requestTitle: parsed.requestTitle,
      reviewer: parsed.reviewer || "",
      evidence: parsed.evidence.filter((item) => item?.label).slice(0, 20),
      decision: ["Pending", "Approved", "Changes requested"].includes(parsed.decision)
        ? parsed.decision
        : "Pending",
      expiresAt: typeof parsed.expiresAt === "number" ? parsed.expiresAt : undefined,
    };
  } catch {
    return null;
  }
}
