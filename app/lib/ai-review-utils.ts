/**
 * Shared utilities for the AI post-meeting review overlay and review page.
 * Mock data and conversation simulation for the prototype.
 */

export type Confidence = "high" | "medium" | "unknown";

export interface Suggestion {
  id: string;
  field: string;
  label: string;
  value: string;
  confidence: Confidence;
  evidence?: string;
  selected: boolean;
  dismissed: boolean;
}

export interface ChatMessage {
  id: string;
  role: "ai" | "rep";
  text: string;
}

export function buildSuggestions(accountId: string): Suggestion[] {
  if (accountId === "innovative-tech-tucson") {
    return [
      {
        id: "s-first",
        field: "firstName",
        label: "First Name",
        value: "Sandra",
        confidence: "high",
        selected: true,
        dismissed: false,
      },
      {
        id: "s-last",
        field: "lastName",
        label: "Last Name",
        value: "Perez",
        confidence: "high",
        selected: true,
        dismissed: false,
      },
      {
        id: "s-title",
        field: "title",
        label: "Title",
        value: "Operations Director",
        confidence: "high",
        selected: true,
        dismissed: false,
      },
      {
        id: "s-segment",
        field: "marketSegment",
        label: "Market Segment",
        value: "Commercial Fleet",
        confidence: "medium",
        evidence: "Sandra mentioned managing customer-facing vehicle fleets for regional service teams",
        selected: false,
        dismissed: false,
      },
      {
        id: "s-industry",
        field: "industry",
        label: "Industry",
        value: "Technology Services",
        confidence: "medium",
        evidence: "Inferred from company name and vendor evaluation context",
        selected: false,
        dismissed: false,
      },
      {
        id: "s-phone",
        field: "phone",
        label: "Phone",
        value: "Not captured",
        confidence: "unknown",
        selected: false,
        dismissed: false,
      },
    ];
  }

  if (accountId === "saddleback-fleet-services" || accountId.startsWith("hs-")) {
    return [
      {
        id: "s-last",
        field: "lastName",
        label: "Last Name",
        value: "Unknown",
        confidence: "unknown",
        selected: false,
        dismissed: false,
      },
      {
        id: "s-segment",
        field: "marketSegment",
        label: "Market Segment",
        value: "Commercial",
        confidence: "medium",
        evidence: "Fleet Services in company name suggests commercial vehicle segment",
        selected: false,
        dismissed: false,
      },
      {
        id: "s-phone",
        field: "phone",
        label: "Phone",
        value: "Not captured",
        confidence: "unknown",
        selected: false,
        dismissed: false,
      },
    ];
  }

  return [];
}

export function getAIResponse(
  input: string,
  suggestions: Suggestion[]
): { text: string; updatedSuggestions: Suggestion[] } {
  const lower = input.toLowerCase();
  let updatedSuggestions = [...suggestions];

  // Title correction
  if (lower.match(/title|job|position|role/)) {
    const match = input.match(/(?:her|his|their)?\s*(?:title|job|position|role)[:\s]+(?:is\s+)?(?:actually\s+)?([^.!?\n]+)/i);
    const newTitle = match?.[1]?.trim();
    if (newTitle) {
      updatedSuggestions = updatedSuggestions.map((s) =>
        s.field === "title" ? { ...s, value: newTitle, selected: true, confidence: "high" } : s
      );
      return {
        text: `Got it.\n✓ Updated Title → "${newTitle}"`,
        updatedSuggestions,
      };
    }
  }

  // Remove a suggestion
  if (lower.match(/remove|skip|drop|don.t (use|include|apply)|wrong|not sure about|leave/) && lower.match(/market|segment/)) {
    updatedSuggestions = updatedSuggestions.map((s) =>
      s.field === "marketSegment" ? { ...s, dismissed: true, selected: false } : s
    );
    return {
      text: "Removed the Market Segment suggestion. You can set it manually when you know more.",
      updatedSuggestions,
    };
  }

  if (lower.match(/remove|skip|drop|don.t (use|include|apply)|wrong|not sure about|leave/) && lower.match(/industry/)) {
    updatedSuggestions = updatedSuggestions.map((s) =>
      s.field === "industry" ? { ...s, dismissed: true, selected: false } : s
    );
    return {
      text: "Removed the Industry suggestion.",
      updatedSuggestions,
    };
  }

  // Phone
  if (lower.match(/phone|number|mobile|cell/)) {
    return {
      text: "Noted — I'll flag Phone as a priority to capture next time. It wasn't mentioned during this recording.",
      updatedSuggestions,
    };
  }

  // Expansion / account intelligence
  if (lower.match(/expand|opening|new location|warehouse|second location|Idaho|next quarter/)) {
    return {
      text: "That's valuable account intelligence.\nI've added it to the meeting summary and flagged it as a potential expansion opportunity. No CRM field for this, but it's saved.",
      updatedSuggestions,
    };
  }

  // Industry correction
  if (lower.match(/industry|sector/)) {
    const match = input.match(/(?:industry|sector)[:\s]+(?:is\s+)?(?:actually\s+)?([^.!?\n]+)/i);
    const newIndustry = match?.[1]?.trim();
    if (newIndustry) {
      updatedSuggestions = updatedSuggestions.map((s) =>
        s.field === "industry" ? { ...s, value: newIndustry, selected: true, confidence: "high" } : s
      );
      return {
        text: `Got it.\n✓ Updated Industry → "${newIndustry}"`,
        updatedSuggestions,
      };
    }
  }

  // Last name correction
  if (lower.match(/last name|surname|family name/)) {
    const match = input.match(/(?:last name|surname|family name)[:\s]+(?:is\s+)?(?:actually\s+)?([^.!?\n]+)/i);
    const newLast = match?.[1]?.trim();
    if (newLast) {
      updatedSuggestions = updatedSuggestions.map((s) =>
        s.field === "lastName" ? { ...s, value: newLast, selected: true } : s
      );
      return {
        text: `Got it.\n✓ Updated Last Name → "${newLast}"`,
        updatedSuggestions,
      };
    }
  }

  return {
    text: "Got it. I've added that to your meeting notes.",
    updatedSuggestions,
  };
}
