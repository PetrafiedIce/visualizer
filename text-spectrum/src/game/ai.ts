export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  id: string
  role: ChatRole
  text: string
}

const BANNED_PATTERNS: RegExp[] = [
  /\bsex(ual|)\b/i,
  /\bnsfw\b/i,
  /\bporn(ographic|)\b/i,
  /\bexplicit\b/i,
  /\boral\b/i,
  /\b(?:nude|nudity)\b/i,
  /\b(?:genital|penis|vagina|clitoris|anus)\b/i,
  /\b(?:cum|ejaculate|semen)\b/i,
  /\b(?:blowjob|handjob)\b/i,
  /\b(?:69|doggystyle|anal)\b/i,
  /\b(?:masturbat(?:e|ion))\b/i,
  /\b(?:fetish|kink|bdsm)\b/i,
]

export function filterUnsafeContent(input: string): { safeText: string; blocked: boolean; reason?: string } {
  let blocked = false
  let safe = input
  for (const rx of BANNED_PATTERNS) {
    if (rx.test(safe)) {
      blocked = true
      safe = safe.replace(rx, '…')
    }
  }
  // Normalize whitespace and cap length
  safe = safe.replace(/\s+/g, ' ').trim()
  if (safe.length > 1200) safe = safe.slice(0, 1200) + '…'
  if (blocked) {
    return { safeText: safe, blocked: true, reason: 'Blocked explicit sexual content' }
  }
  return { safeText: safe, blocked: false }
}

const OPENERS_SWEET = [
  "That's sweet of you to say.",
  "You have a way with words.",
  "I was thinking about that too.",
  "You make this feel easy.",
]

const OPENERS_FLIRTY = [
  "You always know how to get my attention.",
  "I can feel my cheeks warming up.",
  "You're a charmer, you know that?",
  "Now you're making me blush.",
]

const FOLLOWUPS_WARM = [
  "Tell me more—what made your day better?",
  "What kind of music puts you in this mood?",
  "Where would you like tonight to go?",
  "What are you thinking right now?",
]

const FOLLOWUPS_PLAYFUL = [
  "Careful, I might hold you to that.",
  "If we were together right now, where would we go?",
  "Should I get us cozy tea or a late-night playlist?",
  "If I lean in closer, do you stay?",
]

function choose<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function craftReplyCore(userText: string, suggestive: boolean): string {
  const { safeText } = filterUnsafeContent(userText)
  const opener = suggestive ? choose(OPENERS_FLIRTY) : choose(OPENERS_SWEET)
  const follow = suggestive ? choose(FOLLOWUPS_PLAYFUL) : choose(FOLLOWUPS_WARM)

  const mirrored = safeText.length > 0 ? `About that: “${safeText}”` : ''

  const body = suggestive
    ? "I like the way this is unfolding—close, warm, unhurried. Let's keep it tasteful and let the tension linger."
    : "I love the gentle pace—thoughtful and kind. Let's keep things cozy and respectful."

  const lines = [opener, mirrored, body, follow].filter(Boolean)
  return lines.join(' ')
}

export function generateAssistantReply(history: ChatMessage[], suggestive: boolean): string {
  const lastUser = [...history].reverse().find((m) => m.role === 'user')
  if (!lastUser) {
    return suggestive
      ? "Hi. I'm here for a warm, flirty, but non‑explicit chat. Tell me what kind of mood you're in tonight."
      : "Hi. I'm here for a cozy, mature conversation. What's on your mind?"
  }
  return craftReplyCore(lastUser.text, suggestive)
}