"use client";

/**
 * FLUTTER HANDOFF: InteractionDetailScreen
 * Route: /relationships/[id]/activity/[activityId]
 * Widget: StatefulWidget (scroll-aware top bar, participant drawers, action item completion)
 * Tokens: --md-sys-color-background, --md-sys-color-dark-primary, --md-sys-color-dark-secondary,
 *         --md-sys-color-text-primary, --md-sys-color-text-secondary, --md-sys-color-text-muted,
 *         --md-sys-color-text-disabled, --md-sys-color-brand-teal, --md-sys-color-neonindigo,
 *         --md-sys-color-success, --md-sys-color-error, --md-sys-color-alpha-white-10,
 *         --radius-md, --radius-xl, --radius-full
 * Flutter equivalent: interaction_detail_page.dart
 */

import React, { use, useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import AddActionItemSheet from "@/components/accounts/AddActionItemSheet";
import CompletionToast from "@/components/ui/CompletionToast";
import NoteSheet from "@/components/ui/NoteSheet";
import { mockAccounts, mockAccountDetails } from "@/lib/mock-data/accounts";
import { useActionItems } from "@/lib/context/ActionItemsContext";
import type { ActionItem, ActivityItem } from "@/lib/types";

const FEATURE_PARTICIPANTS = true;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Participant {
  id: string;
  initials: string;
  name: string;
  color: string | null;
  isYou?: boolean;
  contactId?: string;
  contactTitle?: string;
  contactCompany?: string;
}

interface Contact {
  id: string;
  name: string;
  title?: string;
  company?: string;
}

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_PARTICIPANTS: Participant[] = [
  { id: "you",  initials: "You", name: "You",          color: null,      isYou: true },
  { id: "p-rn", initials: "RN",  name: "Ray Navarro",  color: "#92C569", contactId: "c-rn", contactTitle: "Fleet Manager",    contactCompany: "Desert Star Auto" },
  { id: "p-tm", initials: "TM",  name: "Terry Mills",  color: "#B594FF", contactId: "c-tm", contactTitle: "Service Director", contactCompany: "Desert Star Auto" },
];

const DEMO_CONTACTS: Contact[] = [
  { id: "c-rn", name: "Ray Navarro", title: "Fleet Manager",    company: "Desert Star Auto" },
  { id: "c-tm", name: "Terry Mills", title: "Service Director", company: "Desert Star Auto" },
  { id: "c-mp", name: "Mike Parsons", title: "Parts Manager",   company: "Desert Star Auto" },
  { id: "c-jl", name: "Janet Lee",    title: "Owner",           company: "Desert Star Auto" },
];

// ── Demo action items / activity for new-capture ──────────────────────────────

const DEMO_ACTION_ITEMS: ActionItem[] = [
  {
    id: "demo-ai-1",
    title: "Send Sandra the formal proposal",
    dueDate: null,
    status: "open",
    description: "Price, timeline, and onboarding plan",
    originActivity: "Sandra confirmed we're the frontrunner for the contract",
    originActivityId: "new-capture",
  },
  {
    id: "demo-ai-2",
    title: "Intro email to Marcus (IT lead)",
    dueDate: null,
    status: "open",
    description: "Loop him in before final sign-off.",
    originActivity: "Sandra confirmed we're the frontrunner for the contract",
    originActivityId: "new-capture",
  },
];

const DEMO_CAPTURE_ACTIVITY: ActivityItem = {
  id: "new-capture",
  accountId: "new-capture",
  title: "Sandra confirmed we're the frontrunner for the contract",
  summary: "Strong meeting — Sandra is ready to move forward and asked for a formal proposal by end of next week.",
  date: new Date(),
  durationMinutes: 28,
  hasTranscript: true,
  repName: "Jordan Mills",
  type: "visit",
  interactionType: "inperson",
  aiSummary: {
    title: "Sandra confirmed we're the frontrunner for the contract",
    tldr: "Sandra confirmed they're moving forward and asked for a formal proposal by end of next week. A competitor came in 15% lower, but she said our support model was the differentiator.",
    keyPoints: [
      "Sandra confirmed the company is **ready to move forward** with the partnership.",
      "She asked for a **formal proposal by Friday** — price, timeline, and onboarding plan.",
      "Mentioned a competitor quote came in **15% lower**, but our support model was the differentiator.",
      "Their IT lead (Marcus) needs to be looped in before final sign-off.",
      "Follow up with an intro email to Marcus this week.",
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatOccurredAt(date: Date): string {
  const d = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const t = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${d} · ${t}`;
}

function dueDateMeta(date: Date | null): { text: string; teal: boolean } {
  if (!date) return { text: "No due date", teal: false };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(date); due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (diff < -1) return { text: `Overdue ${-diff} days`, teal: true };
  if (diff === -1) return { text: "Due yesterday", teal: true };
  if (diff === 0) return { text: "Due today", teal: true };
  if (diff === 1) return { text: "Due tomorrow", teal: false };
  return { text: `Due ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, teal: false };
}

function replaceAllOccurrences(text: string, oldName: string, newName: string): string {
  if (!oldName) return text;
  return text.split(oldName).join(newName);
}

function replaceNthOccurrenceAcrossFields(
  fields: string[],
  name: string,
  newName: string,
  targetIndex: number
): string[] {
  let count = 0;
  return fields.map(field => {
    const parts = field.split(name);
    if (parts.length === 1) return field;
    const result: string[] = [];
    for (let i = 0; i < parts.length; i++) {
      result.push(parts[i]);
      if (i < parts.length - 1) {
        result.push(count === targetIndex ? newName : name);
        count++;
      }
    }
    return result.join("");
  });
}

function renderRichText(
  text: string,
  participants: Participant[],
  occurrenceCounter: Record<string, number>,
  onNameClick?: (participantId: string, occurrenceIndex: number) => void
): React.ReactNode[] {
  const named = participants.filter(a => !a.isYou && a.color);
  if (named.length === 0) return [text];

  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  const nameRe = new RegExp(
    `(${named.map(a => a.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "g"
  );
  const nodes: React.ReactNode[] = [];

  boldParts.forEach((part, pi) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(
        <strong key={`b${pi}`} style={{ color: "var(--md-sys-color-text-primary)", fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
      return;
    }
    part.split(nameRe).forEach((sub, si) => {
      const att = named.find(a => a.name === sub);
      if (att) {
        const occIdx = occurrenceCounter[att.name] ?? 0;
        occurrenceCounter[att.name] = occIdx + 1;
        nodes.push(
          <button
            key={`${pi}-${si}`}
            onClick={() => onNameClick?.(att.id, occIdx)}
            style={{
              background: "none", border: "none", padding: 0,
              cursor: onNameClick ? "pointer" : "default",
              color: att.color!, textDecoration: "underline", textDecorationStyle: "dotted",
              textDecorationColor: att.color!, textUnderlineOffset: "3px",
              fontFamily: "inherit", fontSize: "inherit", lineHeight: "inherit", fontWeight: "inherit",
            }}
          >
            {sub}
          </button>
        );
      } else if (sub) {
        nodes.push(sub);
      }
    });
  });
  return nodes;
}

// ── ParticipantAvatar ─────────────────────────────────────────────────────────

function ParticipantAvatar({ participant, size = 36 }: { participant: Participant; size?: number }) {
  const fontSize = participant.isYou ? Math.round(size * 0.28) : Math.round(size * 0.33);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: participant.isYou ? "transparent" : (participant.color ?? "var(--md-sys-color-text-muted)"),
      border: participant.isYou ? "1.5px solid var(--md-sys-color-text-muted)" : "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: "Barlow, sans-serif",
        fontSize,
        fontWeight: 700,
        color: participant.isYou ? "var(--md-sys-color-text-muted)" : "#fff",
        lineHeight: 1,
        userSelect: "none",
      }}>
        {participant.initials}
      </span>
    </div>
  );
}

// ── ParticipantsDrawer ────────────────────────────────────────────────────────

interface ParticipantsDrawerProps {
  participants: Participant[];
  contacts: Contact[];
  onRename: (id: string, newName: string) => void;
  onUnlink: (id: string) => void;
  onLinkContact: (id: string, contact: Contact) => void;
  onAdd: () => void;
  onClose: () => void;
}

const DRAWER_DURATION = 320;
const DRAWER_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

function ParticipantsDrawer({
  participants, contacts, onRename, onUnlink, onLinkContact, onAdd, onClose,
}: ParticipantsDrawerProps) {
  const [visible, setVisible] = useState(false);
  const [editingNames, setEditingNames] = useState<Record<string, string>>(
    () => Object.fromEntries(participants.map(p => [p.id, p.name]))
  );

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function close() {
    setVisible(false);
    setTimeout(onClose, DRAWER_DURATION);
  }

  function getSuggestions(id: string): Contact[] {
    const val = (editingNames[id] ?? "").toLowerCase().trim();
    if (val.length < 2) return [];
    return contacts.filter(c => c.name.toLowerCase().includes(val)).slice(0, 3);
  }

  function commitRename(id: string) {
    const newName = (editingNames[id] ?? "").trim();
    if (newName) onRename(id, newName);
  }

  return (
    <>
      <div
        onClick={close}
        style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40,
          opacity: visible ? 1 : 0,
          transition: `opacity ${DRAWER_DURATION}ms ${DRAWER_EASING}`,
        }}
      />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "var(--md-sys-color-dark-secondary)",
        borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
        zIndex: 41,
        maxHeight: "80%",
        display: "flex", flexDirection: "column",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: `transform ${DRAWER_DURATION}ms ${DRAWER_EASING}`,
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 4, flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: "var(--radius-full)", background: "var(--md-sys-color-alpha-white-10)" }} />
        </div>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 20px 14px", flexShrink: 0,
        }}>
          <span style={{
            fontFamily: "Barlow, sans-serif", fontSize: 11, fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--md-sys-color-text-muted)",
          }}>
            Participants
          </span>
          <button
            onClick={close}
            style={{
              fontFamily: "Barlow, sans-serif", fontSize: 15, fontWeight: 600,
              color: "var(--md-sys-color-brand-teal)", background: "none",
              border: "none", cursor: "pointer", padding: "4px 0",
            }}
          >
            Done
          </button>
        </div>

        {/* List */}
        <div style={{ overflowY: "auto", flex: 1, padding: "0 20px" }}>
          {participants.map(p => {
            const sugg = getSuggestions(p.id);
            return (
              <div key={p.id} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <ParticipantAvatar participant={p} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {p.isYou ? (
                      <p style={{
                        fontFamily: "Barlow, sans-serif", fontSize: 15, fontWeight: 600,
                        color: "var(--md-sys-color-text-primary)",
                      }}>
                        You
                      </p>
                    ) : (
                      <input
                        value={editingNames[p.id] ?? p.name}
                        onChange={e => setEditingNames(prev => ({ ...prev, [p.id]: e.target.value }))}
                        onBlur={() => commitRename(p.id)}
                        style={{
                          fontFamily: "Barlow, sans-serif", fontSize: 15, fontWeight: 600,
                          color: "var(--md-sys-color-text-primary)",
                          background: "none", border: "none", outline: "none",
                          padding: 0, width: "100%",
                        }}
                      />
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      {p.isYou ? (
                        <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "var(--md-sys-color-text-muted)" }}>
                          That's you
                        </span>
                      ) : p.contactId ? (
                        <>
                          <Icon name="link" size={14} style={{ color: "var(--md-sys-color-brand-teal)", flexShrink: 0 }} />
                          <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "var(--md-sys-color-brand-teal)" }}>
                            {p.contactTitle}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "var(--md-sys-color-text-muted)" }}>
                          Save as contact
                        </span>
                      )}
                    </div>
                  </div>
                  {!p.isYou && (
                    <button
                      onClick={() => onUnlink(p.id)}
                      aria-label="Remove participant"
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        padding: 4, display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Icon name="link_off" size={18} style={{ color: "var(--md-sys-color-text-muted)" }} />
                    </button>
                  )}
                </div>
                {/* Contact suggestions */}
                {sugg.length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 8, paddingLeft: 52, flexWrap: "wrap" }}>
                    {sugg.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onLinkContact(p.id, c);
                          onRename(p.id, c.name);
                          setEditingNames(prev => ({ ...prev, [p.id]: c.name }));
                        }}
                        style={{
                          fontFamily: "Barlow, sans-serif", fontSize: 13, fontWeight: 600,
                          color: "var(--md-sys-color-brand-teal)",
                          background: "color-mix(in srgb, var(--md-sys-color-brand-teal) 12%, transparent)",
                          border: "1px solid color-mix(in srgb, var(--md-sys-color-brand-teal) 30%, transparent)",
                          borderRadius: "var(--radius-full)",
                          padding: "4px 12px", cursor: "pointer",
                        }}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add participant */}
          <button
            onClick={onAdd}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "none", border: "none", cursor: "pointer",
              padding: "4px 0", marginBottom: 8,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              border: "1.5px dashed var(--md-sys-color-text-disabled)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Icon name="add" size={18} style={{ color: "var(--md-sys-color-text-muted)" }} />
            </div>
            <span style={{
              fontFamily: "Barlow, sans-serif", fontSize: 15,
              color: "var(--md-sys-color-text-muted)",
            }}>
              Add participant
            </span>
          </button>
        </div>

        {/* Caption */}
        <div style={{ padding: "12px 20px 36px", flexShrink: 0 }}>
          <p style={{
            fontFamily: "Barlow, sans-serif", fontSize: 12,
            color: "var(--md-sys-color-text-disabled)",
            textAlign: "center", lineHeight: "18px",
          }}>
            Participants are people in this interaction. Linking a name to a contact keeps your notes connected across visits.
          </p>
        </div>
      </div>
    </>
  );
}

// ── SpeakerDrawer ─────────────────────────────────────────────────────────────

interface SpeakerDrawerProps {
  participantId: string;
  occurrenceIndex: number;
  participants: Participant[];
  contacts: Contact[];
  onReassignMention: (participantId: string, occurrenceIndex: number, newParticipantId: string) => void;
  onLinkContact: (participantId: string, contact: Contact) => void;
  onUnlinkContact: (participantId: string) => void;
  onRename: (id: string, newName: string) => void;
  onRemove: (participantId: string) => void;
  onClose: () => void;
}

function SpeakerDrawer({
  participantId, occurrenceIndex, participants, contacts,
  onReassignMention, onLinkContact, onUnlinkContact, onRename, onRemove, onClose,
}: SpeakerDrawerProps) {
  const participant = participants.find(p => p.id === participantId);
  const [editingName, setEditingName] = useState(participant?.name ?? "");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!participant) return null;

  function close() {
    setVisible(false);
    setTimeout(onClose, DRAWER_DURATION);
  }

  const otherParticipants = participants.filter(p => p.id !== participantId && !p.isYou);
  const linkedContact = participant.contactId ? contacts.find(c => c.id === participant.contactId) : null;

  function commitName() {
    const n = editingName.trim();
    if (n && n !== participant!.name) onRename(participant!.id, n);
  }

  return (
    <>
      <div
        onClick={close}
        style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40,
          opacity: visible ? 1 : 0,
          transition: `opacity ${DRAWER_DURATION}ms ${DRAWER_EASING}`,
        }}
      />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "var(--md-sys-color-dark-secondary)",
        borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
        zIndex: 41,
        maxHeight: "85%",
        display: "flex", flexDirection: "column",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: `transform ${DRAWER_DURATION}ms ${DRAWER_EASING}`,
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 4, flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: "var(--radius-full)", background: "var(--md-sys-color-alpha-white-10)" }} />
        </div>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 20px 16px", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ParticipantAvatar participant={participant} size={40} />
            <div>
              <input
                value={editingName}
                onChange={e => setEditingName(e.target.value)}
                onBlur={commitName}
                style={{
                  fontFamily: "Barlow, sans-serif", fontSize: 15, fontWeight: 600,
                  color: "var(--md-sys-color-text-primary)",
                  background: "none", border: "none", outline: "none",
                  padding: 0,
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                {linkedContact ? (
                  <>
                    <Icon name="link" size={14} style={{ color: "var(--md-sys-color-brand-teal)", flexShrink: 0 }} />
                    <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "var(--md-sys-color-brand-teal)" }}>
                      {linkedContact.title}
                    </span>
                  </>
                ) : (
                  <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "var(--md-sys-color-text-muted)" }}>
                    Not linked to a contact
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={close}
            style={{
              fontFamily: "Barlow, sans-serif", fontSize: 15, fontWeight: 600,
              color: "var(--md-sys-color-brand-teal)", background: "none",
              border: "none", cursor: "pointer", padding: "4px 0",
            }}
          >
            Done
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "0 20px" }}>
          {/* Section 1: Reassign this mention */}
          <div style={{ marginBottom: 24 }}>
            <p style={{
              fontFamily: "Barlow, sans-serif", fontSize: 11, fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "var(--md-sys-color-text-muted)", marginBottom: 12,
            }}>
              Just this mention · Reassign speaker
            </p>
            {otherParticipants.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {otherParticipants.map(op => (
                  <button
                    key={op.id}
                    onClick={() => onReassignMention(participantId, occurrenceIndex, op.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      fontFamily: "Barlow, sans-serif", fontSize: 14, fontWeight: 500,
                      color: op.color ?? "var(--md-sys-color-text-primary)",
                      background: `color-mix(in srgb, ${op.color ?? "#fff"} 12%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${op.color ?? "#fff"} 28%, transparent)`,
                      borderRadius: "var(--radius-full)",
                      padding: "6px 14px", cursor: "pointer",
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%",
                      background: op.color ?? "var(--md-sys-color-text-muted)",
                      flexShrink: 0,
                    }} />
                    {op.name}
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 14, color: "var(--md-sys-color-text-muted)" }}>
                No other participants to reassign to.
              </p>
            )}
          </div>

          {/* Section 2: Link to contact */}
          <div style={{ marginBottom: 16 }}>
            <p style={{
              fontFamily: "Barlow, sans-serif", fontSize: 11, fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "var(--md-sys-color-text-muted)", marginBottom: 4,
            }}>
              All mentions · Link to a contact
            </p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {contacts.map(c => {
                const isLinked = participant.contactId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => isLinked ? onUnlinkContact(participantId) : onLinkContact(participantId, c)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 0", background: "none", border: "none",
                      borderBottom: "1px solid var(--md-sys-color-alpha-white-10)",
                      cursor: "pointer", textAlign: "left",
                    }}
                  >
                    <div>
                      <p style={{
                        fontFamily: "Barlow, sans-serif", fontSize: 15, fontWeight: 500,
                        color: "var(--md-sys-color-text-primary)",
                      }}>
                        {c.name}
                      </p>
                      <p style={{
                        fontFamily: "Barlow, sans-serif", fontSize: 13,
                        color: "var(--md-sys-color-text-muted)", marginTop: 1,
                      }}>
                        {c.title} · {c.company}
                      </p>
                    </div>
                    {isLinked && (
                      <Icon name="check" size={18} style={{ color: "var(--md-sys-color-brand-teal)", flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 20px 0", flexShrink: 0,
          borderTop: "1px solid var(--md-sys-color-alpha-white-10)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <button
            onClick={() => linkedContact ? onUnlinkContact(participantId) : undefined}
            style={{
              fontFamily: "Barlow, sans-serif", fontSize: 14, fontWeight: 500,
              color: linkedContact ? "var(--md-sys-color-brand-teal)" : "var(--md-sys-color-text-muted)",
              background: "none", border: "none",
              cursor: linkedContact ? "pointer" : "default",
              padding: "8px 0",
            }}
          >
            {linkedContact ? "Unlink contact" : "Save as contact"}
          </button>
          <button
            onClick={() => { onRemove(participantId); close(); }}
            style={{
              fontFamily: "Barlow, sans-serif", fontSize: 14, fontWeight: 600,
              color: "var(--md-sys-color-error)",
              background: "none", border: "none", cursor: "pointer", padding: "8px 0",
            }}
          >
            Remove
          </button>
        </div>

        {/* Caption */}
        <div style={{ padding: "8px 20px 36px", flexShrink: 0 }}>
          <p style={{
            fontFamily: "Barlow, sans-serif", fontSize: 12,
            color: "var(--md-sys-color-text-disabled)",
            textAlign: "center", lineHeight: "18px",
          }}>
            Reassigning affects only the mention you tapped. Linking a contact applies to every mention of this participant.
          </p>
        </div>
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function InteractionDetailPageContent({
  params,
}: {
  params: Promise<{ id: string; activityId: string }>;
}) {
  const { id, activityId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Scroll-aware top bar
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [scrollingUp, setScrollingUp] = useState(false);

  // Interaction type picker
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [interactionTypeOverride, setInteractionTypeOverride] = useState<"inperson" | "phone" | null>(null);

  // Action items
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [completedItemIds, setCompletedItemIds] = useState<string[]>([]);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);

  // Participant drawers (behind FEATURE_PARTICIPANTS)
  const [participants, setParticipants] = useState<Participant[]>(DEMO_PARTICIPANTS);
  const [noteTldrOverride, setNoteTldrOverride] = useState<string | null>(null);
  const [noteKeyPointsOverride, setNoteKeyPointsOverride] = useState<string[] | null>(null);
  const [participantsDrawerOpen, setParticipantsDrawerOpen] = useState(false);
  const [speakerDrawer, setSpeakerDrawer] = useState<{ participantId: string; occurrenceIndex: number } | null>(null);

  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { getItems, updateItem } = useActionItems();
  const allActionItems = getItems(id);

  // Data (non-hook, declared before handlers so handlers can reference activity)
  const isNewCapture = activityId === "new-capture";
  const detail = mockAccountDetails[id];
  const account =
    detail ??
    mockAccounts.find((a) => a.id === id) ??
    (isNewCapture
      ? {
          id,
          name: searchParams.get("name") ?? "New Lead",
          type: "standalone" as const,
          halosightType: "prospect" as const,
          distanceMiles: 0,
          lastVisited: new Date(),
          taskCount: 0,
        }
      : undefined);
  const activity =
    detail?.recentActivity.find((a) => a.id === activityId) ??
    (isNewCapture ? DEMO_CAPTURE_ACTIVITY : undefined);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const current = el.scrollTop;
    setHasScrolled(current > 10);
    setScrollingUp(current < lastScrollTopRef.current);
    lastScrollTopRef.current = current;
  }

  function handleComplete(itemId: string) {
    if (pendingItemId) return;
    setPendingItemId(itemId);
    completionTimerRef.current = setTimeout(() => {
      const item = allActionItems.find((i) => i.id === itemId);
      if (item) updateItem(id, { ...item, status: "done" });
      setCompletedItemIds((prev) => [...prev, itemId]);
      setPendingItemId(null);
    }, 8000);
  }

  function handleUndoComplete() {
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    setPendingItemId(null);
  }

  function handleAddNote() {
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    setNoteSheetOpen(true);
  }

  function handleNoteDone(note: string) {
    const item = allActionItems.find((i) => i.id === pendingItemId);
    if (item) updateItem(id, { ...item, status: "done", ...(note.trim() ? { note } : {}) });
    if (pendingItemId) setCompletedItemIds((prev) => [...prev, pendingItemId]);
    setNoteSheetOpen(false);
    setPendingItemId(null);
  }

  // Participant handlers
  function handleRenameParticipant(pid: string, newName: string) {
    const p = participants.find(x => x.id === pid);
    if (!p || p.isYou || newName === p.name) return;
    const oldName = p.name;
    const tldr = noteTldrOverride ?? activity?.aiSummary?.tldr ?? "";
    const kps = noteKeyPointsOverride ?? activity?.aiSummary?.keyPoints ?? [];
    setNoteTldrOverride(replaceAllOccurrences(tldr, oldName, newName));
    setNoteKeyPointsOverride(kps.map(kp => replaceAllOccurrences(kp, oldName, newName)));
    const newInitials = newName.split(" ").map(w => w[0] ?? "").join("").slice(0, 2).toUpperCase();
    setParticipants(prev => prev.map(x => x.id === pid ? { ...x, name: newName, initials: newInitials } : x));
  }

  function handleUnlinkParticipant(pid: string) {
    setParticipants(prev => prev.filter(p => p.id !== pid));
  }

  function handleLinkContact(pid: string, contact: Contact) {
    setParticipants(prev => prev.map(p =>
      p.id === pid ? { ...p, contactId: contact.id, contactTitle: contact.title, contactCompany: contact.company } : p
    ));
  }

  function handleUnlinkContact(pid: string) {
    setParticipants(prev => prev.map(p =>
      p.id === pid ? { ...p, contactId: undefined, contactTitle: undefined, contactCompany: undefined } : p
    ));
  }

  function handleAddParticipant() {
    const nonYou = participants.filter(p => !p.isYou);
    const n = nonYou.length + 1;
    const speakerColors = ["#E8855A", "#6BB8E8", "#E8C55A", "#5AE8A0", "#E85AA0"];
    setParticipants(prev => [...prev, {
      id: `p-new-${Date.now()}`,
      initials: `S${n}`,
      name: `Speaker ${n}`,
      color: speakerColors[nonYou.length % speakerColors.length],
    }]);
  }

  function handleReassignMention(pid: string, occurrenceIndex: number, newPid: string) {
    const oldP = participants.find(p => p.id === pid);
    const newP = participants.find(p => p.id === newPid);
    if (!oldP || !newP) return;
    const tldr = noteTldrOverride ?? activity?.aiSummary?.tldr ?? "";
    const kps = noteKeyPointsOverride ?? activity?.aiSummary?.keyPoints ?? [];
    const updated = replaceNthOccurrenceAcrossFields([tldr, ...kps], oldP.name, newP.name, occurrenceIndex);
    setNoteTldrOverride(updated[0]);
    setNoteKeyPointsOverride(updated.slice(1));
    setSpeakerDrawer(null);
  }

  const justCompletedHandled = useRef(false);
  useEffect(() => {
    const justCompleted = searchParams.get("just_completed");
    if (justCompleted && !justCompletedHandled.current) {
      justCompletedHandled.current = true;
      handleComplete(justCompleted);
      router.replace(`/relationships/${id}/activity/${activityId}`);
    }
  }, []); // eslint-disable-line

  if (!account || !activity) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ background: "var(--md-sys-color-background)" }}
      >
        <p style={{ color: "var(--md-sys-color-text-muted)" }}>Interaction not found</p>
      </div>
    );
  }

  const backHref = isNewCapture
    ? `/relationships/${id}?just_created=true&name=${encodeURIComponent(searchParams.get("name") ?? "")}&captured=true&tab=activity`
    : `/relationships/${id}?tab=activity`;

  const interactionType = interactionTypeOverride ?? activity.interactionType ?? "inperson";
  const interactionLabel = interactionType === "phone" ? "Phone call" : "In-person";

  const activityActionItems = isNewCapture
    ? DEMO_ACTION_ITEMS
    : allActionItems.filter(
        (i) => i.originActivityId === activityId && i.status !== "done" && !completedItemIds.includes(i.id)
      );

  const displayTldr = noteTldrOverride ?? activity.aiSummary?.tldr ?? "";
  const displayKeyPoints = noteKeyPointsOverride ?? activity.aiSummary?.keyPoints ?? [];

  const showKebab = !hasScrolled || scrollingUp;
  const glassCircle = (visible: boolean): React.CSSProperties => ({
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    background: hasScrolled ? "rgba(20, 23, 38, 0.88)" : "transparent",
    backdropFilter: hasScrolled ? "blur(16px) saturate(180%)" : undefined,
    boxShadow: hasScrolled ? "inset 0 0 0 1px rgba(255,255,255,0.08)" : "none",
    transition: "background 180ms ease",
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? "auto" : "none",
  });

  return (
    <div style={{ position: "relative", height: "100%", background: "var(--md-sys-color-background)", overflow: "hidden" }}>
      {/* ── Floating top bar ─────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        paddingTop: 40, paddingBottom: 10, paddingLeft: 16, paddingRight: 16,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button onClick={() => router.push(backHref)} aria-label="Go back" style={glassCircle(true)}>
          <Icon name="arrow_back" size={22} style={{ color: "var(--md-sys-color-text-primary)" }} />
        </button>
        <button aria-label="More options" style={glassCircle(showKebab)}>
          <Icon name="more_vert" size={22} style={{ color: "var(--md-sys-color-text-primary)" }} />
        </button>
      </div>

      {/* ── Scroll container ─────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ position: "absolute", inset: 0, overflowY: "auto", paddingBottom: 48 }}
      >
        {/* Header block */}
        <div style={{ padding: "86px 24px 10px" }}>
          <p style={{
            fontFamily: "Barlow, sans-serif", fontSize: 11, fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--md-sys-color-brand-teal)", marginBottom: 10,
          }}>
            {account.name}
          </p>

          <h1 style={{
            fontFamily: "Barlow, sans-serif", fontSize: 32, fontWeight: 500,
            lineHeight: 1.2, color: "var(--md-sys-color-text-primary)", marginBottom: 14,
          }}>
            {activity.title}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 15, color: "var(--md-sys-color-text-muted)" }}>
              {formatOccurredAt(activity.date)}
            </span>
            <span style={{ color: "var(--md-sys-color-text-muted)" }}>·</span>
            {/* Interaction type picker */}
            <div style={{ position: "relative" }}>
              {typePickerOpen && (
                <div className="fixed inset-0" style={{ zIndex: 20 }} onClick={() => setTypePickerOpen(false)} />
              )}
              <button
                onClick={() => setTypePickerOpen((o) => !o)}
                style={{
                  display: "flex", alignItems: "center", gap: 2,
                  background: "none", border: "none", cursor: "pointer",
                  padding: 0, position: "relative", zIndex: 21,
                }}
              >
                <span style={{
                  fontFamily: "Barlow, sans-serif", fontSize: 15, fontWeight: 600,
                  color: "var(--md-sys-color-neonindigo)",
                }}>
                  {interactionLabel}
                </span>
                <Icon name="unfold_more" size={16} style={{ color: "var(--md-sys-color-neonindigo)" }} />
              </button>

              {typePickerOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 21,
                  minWidth: 180,
                  background: "var(--md-sys-color-dark-primary)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--md-sys-color-alpha-white-10)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
                  overflow: "hidden",
                }}>
                  {(["inperson", "phone"] as const).map((type) => {
                    const label = type === "phone" ? "Phone call" : "In-person";
                    const selected = interactionType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => { setInteractionTypeOverride(type); setTypePickerOpen(false); }}
                        style={{
                          width: "100%", display: "flex", alignItems: "center",
                          justifyContent: "space-between", padding: "10px 18px",
                          background: "none", border: "none", cursor: "pointer", textAlign: "left",
                        }}
                      >
                        <span style={{
                          fontFamily: "Barlow, sans-serif", fontSize: 16, fontWeight: 500,
                          color: "var(--md-sys-color-text-primary)",
                        }}>
                          {label}
                        </span>
                        {selected && (
                          <Icon name="check" size={18} style={{ color: "var(--md-sys-color-neonindigo)", flexShrink: 0 }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Attendees row */}
          {FEATURE_PARTICIPANTS && (
            <button
              onClick={() => setParticipantsDrawerOpen(true)}
              style={{
                display: "flex", alignItems: "center", gap: 10, marginTop: 14,
                background: "none", border: "none", cursor: "pointer", padding: 0,
              }}
            >
              <div style={{ display: "flex" }}>
                {participants.map((p, i) => (
                  <div key={p.id} style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: p.isYou ? "transparent" : (p.color ?? "var(--md-sys-color-text-muted)"),
                    border: p.isYou
                      ? "1.5px solid var(--md-sys-color-text-muted)"
                      : "2px solid var(--md-sys-color-background)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginLeft: i > 0 ? -8 : 0,
                    position: "relative",
                    zIndex: participants.length - i,
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontFamily: "Barlow, sans-serif",
                      fontSize: p.isYou ? 9 : 10, fontWeight: 700,
                      color: p.isYou ? "var(--md-sys-color-text-muted)" : "#fff",
                      lineHeight: 1, userSelect: "none",
                    }}>
                      {p.initials}
                    </span>
                  </div>
                ))}
              </div>
              <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "var(--md-sys-color-text-muted)" }}>
                {participants.map(p => p.name).join(", ")}
              </span>
            </button>
          )}
        </div>

        {/* Note body */}
        {(displayTldr || displayKeyPoints.length > 0) && (
          <div style={{ padding: "10px 24px 0" }}>
            {displayTldr && (() => {
              const counter: Record<string, number> = {};
              return (
                <p style={{
                  fontFamily: "Barlow, sans-serif", fontSize: 16, lineHeight: "24px",
                  color: "var(--md-sys-color-text-primary)", marginBottom: 20,
                }}>
                  {FEATURE_PARTICIPANTS
                    ? renderRichText(displayTldr, participants, counter, (pid, occ) => setSpeakerDrawer({ participantId: pid, occurrenceIndex: occ }))
                    : displayTldr
                  }
                </p>
              );
            })()}

            {displayKeyPoints.length > 0 && (() => {
              const counter: Record<string, number> = {};
              // Count occurrences already consumed in tldr
              if (displayTldr && FEATURE_PARTICIPANTS) {
                const named = participants.filter(p => !p.isYou && p.color);
                named.forEach(p => {
                  const re = new RegExp(p.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
                  const matches = displayTldr.match(re);
                  if (matches) counter[p.name] = matches.length;
                });
              }
              return (
                <>
                  <p style={{
                    fontFamily: "Barlow, sans-serif", fontSize: 20, fontWeight: 700,
                    lineHeight: "28px", color: "var(--md-sys-color-text-primary)", marginBottom: 14,
                  }}>
                    Key Points
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {displayKeyPoints.map((point, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: "var(--md-sys-color-text-muted)",
                          flexShrink: 0, marginTop: 9,
                        }} />
                        <span style={{
                          fontFamily: "Barlow, sans-serif", fontSize: 16, lineHeight: "24px",
                          color: "var(--md-sys-color-text-primary)",
                        }}>
                          {FEATURE_PARTICIPANTS
                            ? renderRichText(point, participants, counter, (pid, occ) => setSpeakerDrawer({ participantId: pid, occurrenceIndex: occ }))
                            : point
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 22, paddingBottom: 4 }}>
              <Icon name="edit" size={14} style={{ color: "var(--md-sys-color-text-disabled)" }} />
              <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 14, color: "var(--md-sys-color-text-disabled)" }}>
                Tap any text to edit
              </span>
            </div>
          </div>
        )}

        {/* Action Items */}
        <div style={{ padding: "28px 20px 48px" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14,
          }}>
            <span style={{
              fontFamily: "Barlow, sans-serif", fontSize: 11, fontWeight: 600,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--md-sys-color-text-muted)",
            }}>
              Action Items
            </span>
            <button
              onClick={() => setShowAddSheet(true)}
              aria-label="Add action item"
              style={{
                width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--md-sys-color-text-primary)", marginRight: -4,
              }}
            >
              <Icon name="add" size={20} />
            </button>
          </div>

          {activityActionItems.length > 0 ? (
            <div style={{
              borderRadius: "var(--radius-xl)", overflow: "hidden",
              border: "1px solid var(--md-sys-color-alpha-white-10)",
            }}>
              {activityActionItems.map((item, i) => {
                const due = dueDateMeta(item.dueDate);
                const isPending = pendingItemId === item.id;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                      borderTop: i > 0 ? "1px solid var(--md-sys-color-alpha-white-10)" : "none",
                    }}
                  >
                    <button
                      onClick={() => handleComplete(item.id)}
                      aria-label="Mark complete"
                      style={{
                        width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                        border: isPending ? "none" : "1.5px solid var(--md-sys-color-text-disabled)",
                        background: isPending ? "var(--md-sys-color-success)" : "transparent",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 180ms ease",
                      }}
                    >
                      {isPending && <Icon name="check" size={12} style={{ color: "#fff" }} />}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: "Barlow, sans-serif", fontSize: 15, fontWeight: 600,
                        lineHeight: "22px", color: "var(--md-sys-color-text-primary)",
                      }}>
                        {item.title}
                      </p>
                      <p style={{
                        fontFamily: "Barlow, sans-serif", fontSize: 13, lineHeight: "18px",
                        marginTop: 2,
                        color: due.teal ? "var(--md-sys-color-brand-teal)" : "var(--md-sys-color-text-muted)",
                      }}>
                        {due.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <button
              onClick={() => setShowAddSheet(true)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px", cursor: "pointer",
                background: "var(--md-sys-color-dark-secondary)",
                border: "none", borderRadius: "var(--radius-xl)", textAlign: "left",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "color-mix(in srgb, var(--md-sys-color-neonindigo) 15%, transparent)",
              }}>
                <Icon name="add" size={18} style={{ color: "var(--md-sys-color-neonindigo)" }} />
              </div>
              <div>
                <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 15, fontWeight: 600, color: "var(--md-sys-color-text-primary)" }}>
                  Add an action item
                </p>
                <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "var(--md-sys-color-text-secondary)", marginTop: 2 }}>
                  Track follow-ups from this visit
                </p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* ── Sheets / overlays ────────────────────────────────────────────────── */}
      {showAddSheet && (
        <AddActionItemSheet accountId={id} onClose={() => setShowAddSheet(false)} />
      )}

      <CompletionToast
        visible={pendingItemId !== null && !noteSheetOpen}
        bottom={32}
        onUndo={handleUndoComplete}
        onAddNote={handleAddNote}
        onDismiss={() => {
          if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
          const item = allActionItems.find((i) => i.id === pendingItemId);
          if (item) updateItem(id, { ...item, status: "done" });
          if (pendingItemId) setCompletedItemIds((prev) => [...prev, pendingItemId]);
          setPendingItemId(null);
        }}
      />
      <NoteSheet visible={noteSheetOpen} onDone={handleNoteDone} />

      {FEATURE_PARTICIPANTS && participantsDrawerOpen && (
        <ParticipantsDrawer
          participants={participants}
          contacts={DEMO_CONTACTS}
          onRename={handleRenameParticipant}
          onUnlink={handleUnlinkParticipant}
          onLinkContact={handleLinkContact}
          onAdd={handleAddParticipant}
          onClose={() => setParticipantsDrawerOpen(false)}
        />
      )}

      {FEATURE_PARTICIPANTS && speakerDrawer && (
        <SpeakerDrawer
          participantId={speakerDrawer.participantId}
          occurrenceIndex={speakerDrawer.occurrenceIndex}
          participants={participants}
          contacts={DEMO_CONTACTS}
          onReassignMention={handleReassignMention}
          onLinkContact={handleLinkContact}
          onUnlinkContact={handleUnlinkContact}
          onRename={handleRenameParticipant}
          onRemove={handleUnlinkParticipant}
          onClose={() => setSpeakerDrawer(null)}
        />
      )}
    </div>
  );
}

export default function InteractionDetailPage({
  params,
}: {
  params: Promise<{ id: string; activityId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center h-full"
          style={{ background: "var(--md-sys-color-background)" }}
        />
      }
    >
      <InteractionDetailPageContent params={params} />
    </Suspense>
  );
}
