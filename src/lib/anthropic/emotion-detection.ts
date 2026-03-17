import type { EmotionSignal } from '@/types/adaptive'

const FRUSTRATED_PHRASES = [
  'i hate this', 'this is stupid', 'i can\'t', 'i cant',
  'i give up', 'this is dumb', 'i don\'t like this',
  'i dont like this', 'this sucks', 'too hard',
]

const CONFUSED_PHRASES = [
  'i don\'t get it', 'i dont get it', 'i don\'t understand',
  'i dont understand', 'what does', 'what do you mean',
  'i\'m confused', 'im confused', 'i\'m lost', 'im lost',
  'how do i', 'what is that', 'huh',
]

const EXCITED_WORDS = [
  'oh!', 'ooh', 'yay', 'yes!', 'cool', 'awesome',
  'i got it', 'i think i got it', 'wait i think',
  'is it', 'i know',
]

/**
 * Detect the child's emotional state from their chat message.
 * Priority: frustrated > confused > excited > disengaged > neutral
 */
export function detectEmotion(message: string): EmotionSignal {
  const raw = message.trim()
  if (!raw) return 'neutral'

  const lower = raw.toLowerCase()

  // --- Frustrated: strong negative signals or ALL CAPS ---
  if (FRUSTRATED_PHRASES.some(p => lower.includes(p))) return 'frustrated'
  // 3+ consecutive uppercase letters (exclude short words like "OK", "XP")
  if (raw.length > 4 && /[A-Z]{3,}/.test(raw) && raw === raw.toUpperCase()) return 'frustrated'
  if (lower.includes('ugh') || lower.includes('argh')) return 'frustrated'

  // --- Confused: questions about understanding ---
  if (CONFUSED_PHRASES.some(p => lower.includes(p))) return 'confused'
  if ((lower.match(/\?/g) || []).length >= 3) return 'confused'

  // --- Excited: positive energy with exclamation ---
  if (raw.includes('!') && EXCITED_WORDS.some(w => lower.includes(w))) return 'excited'
  if ((raw.match(/!/g) || []).length >= 2 && lower.length > 3) return 'excited'

  // --- Disengaged: minimal effort responses ---
  if (raw.length <= 2) return 'disengaged'
  if (['ok', 'k', 'idk', 'no', 'ya', 'ye', 'meh', '.', '..', '...'].includes(lower)) return 'disengaged'

  return 'neutral'
}
