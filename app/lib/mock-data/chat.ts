/**
 * Mock data for the account chat. Written around the Acme Co account (Dana's Salesforce sync issue,
 * the Houston QBR, the 300-seat tier) so the canned replies stay coherent with the rest of the prototype.
 * Flutter equivalent: a chat repository adapter returning threads and streamed replies.
 */

import type { ChatThread, ChatTurn } from "@/lib/types";

/** Greeting name — matches the home screen. */
export const CHAT_USER_NAME = "Nate";

export const CHAT_SUGGESTIONS = [
  "Prep me for the Houston QBR",
  "What's still open with this account?",
  "Who should I know at Acme Co?",
  "What's at risk on this account?",
];

export const CHAT_THREADS: ChatThread[] = [
  { id: "t1", title: "What's at risk on this account?", whenLabel: "Yesterday", messageCount: 6, pinned: true },
  { id: "t2", title: "What's still open on this account?", whenLabel: "Today", messageCount: 4, pinned: false },
  { id: "t3", title: "Who should I know at Acme Co?", whenLabel: "Today", messageCount: 3, pinned: false },
  { id: "t4", title: "What happened with the Baton Rouge rollout?", whenLabel: "Tuesday", messageCount: 3, pinned: false },
];

export const DRAFT_NOTE =
  "Hi Dana, thanks for your patience on the Salesforce sync. Engineering tracked the lead-note issue to how notes map during sync, and we expect a fix by Oct. 4. I'll send a short before-and-after once it's live so your team can check a few records. I'd also like to spend ten minutes on it at the start of the QBR on the 14th so Sam can ask questions directly. Talk soon.";

/** A finished conversation, used by the design-system page and when a history row is opened. */
export const CHAT_SAMPLE_TURNS: ChatTurn[] = [
  { id: "s1", role: "user", text: "What should I lead with at the Houston QBR?" },
  {
    id: "s2", role: "assistant",
    text: "Lead with the Salesforce sync fix. Dana has asked about it twice, and support flagged the same issue last week, so it's the main thing standing between you and the renewal. Once that's settled, walk Sam through the 300-seat tier.",
  },
  { id: "s3", role: "user", text: "Draft a quick note to Dana about it" },
  { id: "s4", role: "assistant", text: "Here's a draft. It's short, names a date, and ties it to the QBR:", draft: DRAFT_NOTE },
];

/** Question the simulated voice mode "hears". */
export const VOICE_SAMPLE_QUESTION = "What should I lead with at the Houston QBR?";

let nextId = 1;
export const chatId = () => `c${Date.now()}-${nextId++}`;

/** Canned assistant reply for the prototype. Keyword-matched; no model behind it. */
export function replyFor(question: string): { text: string; draft?: string } {
  const q = question.toLowerCase();
  if (/draft|note|email|write/.test(q)) {
    return { text: "Here's a draft. It's short, names a date, and ties it to the QBR:", draft: DRAFT_NOTE };
  }
  if (/lead|qbr|prep/.test(q)) {
    return { text: CHAT_SAMPLE_TURNS[1].text };
  }
  if (/open|still|follow/.test(q)) {
    return { text: "Two things are still open: add the two documented risks to the account overview, and send Finance the written plan comparison before they review the 300-seat tier." };
  }
  if (/risk/.test(q)) {
    return { text: "Two risks: Dana's Salesforce sync issue puts about $180K ARR at risk, and Baton Rouge weekly active reps fell from 25 to 15 after the branch manager left, which puts another $45K at risk." };
  }
  if (/who|know|contact/.test(q)) {
    return { text: "Dana Ruiz is your day-to-day contact and the one pushing on the sync fix. Sam owns the budget decision on the 300-seat tier, and Finance wants the written plan comparison first." };
  }
  return { text: "I looked through the visits, calls and Salesforce activity on this account. The main thread is the sync fix date and the Baton Rouge usage decline. Want me to dig into either?" };
}
