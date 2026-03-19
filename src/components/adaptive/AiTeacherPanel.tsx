'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { ChatMessage } from '@/types/adaptive'
import { detectEmotion } from '@/lib/anthropic/emotion-detection'
import { detectProblemType } from '@/lib/anthropic/problem-type-detection'

// ── Web Speech API type shim ───────────────────────────────
interface SpeechRecognitionEvent {
  results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }>>
}
interface SpeechRecognitionErrorEvent {
  error: 'not-allowed' | 'no-speech' | 'audio-capture' | 'network' | 'aborted' | string
}
interface SpeechRecognitionInstance extends EventTarget {
  lang:             string
  interimResults:   boolean
  maxAlternatives:  number
  continuous:       boolean
  start():  void
  stop():   void
  abort():  void
  onresult: ((event: SpeechRecognitionEvent) => void)       | null
  onend:    (() => void)                                     | null
  onerror:  ((event: SpeechRecognitionErrorEvent) => void)  | null
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

function getSR(): SpeechRecognitionConstructor | undefined {
  if (typeof window === 'undefined') return undefined
  return (
    (window as Window & { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ??
    (window as Window & { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition
  )
}

// ── Mic status machine ─────────────────────────────────────
type MicStatus =
  | 'unavailable'  // API not in this browser
  | 'idle'         // ready to use
  | 'listening'    // actively recording
  | 'transcribed'  // got text - shows ✓ briefly
  | 'error_denied' // browser blocked permission
  | 'error_silent' // user spoke but nothing was heard
  | 'error_other'  // anything else

function micErrorMessage(status: MicStatus): string | null {
  switch (status) {
    case 'error_denied': return '🚫 Microphone blocked - ask a grown-up to allow it in browser settings'
    case 'error_silent': return "🎤 I didn't hear anything - try speaking closer to the mic"
    case 'error_other':  return "😕 Mic didn't work in this browser - try typing instead"
    default:             return null
  }
}

// ── Props ──────────────────────────────────────────────────
// Grade-based feature tiers:
// G1:  auto-greet + click-to-explain only (no free chat)
// G2:  auto-greet + click-to-explain + chat (chat de-emphasized)
// G3+: full system (all scaffolding tiers, emotion detection, free chat)
type TeacherMode = 'observe' | 'soft' | 'full'

function getTeacherMode(grade: number): TeacherMode {
  if (grade <= 1) return 'observe'  // G1
  if (grade === 2) return 'soft'    // Grade 2
  return 'full'                     // Grade 3+
}

interface AiTeacherPanelProps {
  childId:          string
  sessionId?:       string
  gradeLevel?:      number   // determines feature tier (G1 observe, G2 soft, G3+ full)
  currentQuestion:  string   // changes trigger auto-greeting
  correctAnswer?:   string   // hidden from child, used by Ms. Owl to know if reasoning is on track
  contextHint?:     string   // equation part tapped
  questionDomain?:  string   // e.g. 'OA', 'NF', 'G'
  questionType?:    string   // e.g. 'multiple_choice', 'numeric'
  progressSummary?: string   // e.g. "3 of 8 correct so far"
  wrongAnswerTrigger?: number // increment to trigger wrong-answer explanation
  className?:       string
}

export function AiTeacherPanel({
  childId,
  sessionId,
  gradeLevel = 3,
  currentQuestion,
  correctAnswer,
  contextHint,
  questionDomain,
  questionType,
  progressSummary,
  wrongAnswerTrigger = 0,
  className = '',
}: AiTeacherPanelProps) {
  const mode = getTeacherMode(gradeLevel)
  const [messages, setMessages]   = useState<ChatMessage[]>([])
  const [input, setInput]         = useState('')
  const [interimText, setInterimText] = useState('') // live transcript preview
  const [isLoading, setIsLoading] = useState(false)
  const [micStatus, setMicStatus] = useState<MicStatus>('unavailable')
  const [struggleCount, setStruggleCount] = useState(0)

  const greetedQuestionRef = useRef<string>('')
  const prevContextHintRef = useRef<string | undefined>(undefined)
  const bottomRef          = useRef<HTMLDivElement>(null)
  const inputRef           = useRef<HTMLTextAreaElement>(null)
  const recognitionRef     = useRef<SpeechRecognitionInstance | null>(null)
  const messagesRef        = useRef<ChatMessage[]>([])
  // Timer to auto-clear transcribed / error states
  const micTimerRef        = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isListeningRef     = useRef(false)
  // Used to distinguish "blocked instantly" from "user spoke but nothing heard"
  const listenStartMsRef   = useRef(0)
  const gotAudioRef        = useRef(false)   // true if onresult fired at least once

  // Compute problem type whenever question changes
  const problemType = useMemo(
    () => detectProblemType({ text: currentQuestion ?? '', domain: questionDomain ?? '' }),
    [currentQuestion, questionDomain],
  )

  useEffect(() => {
    setMicStatus(getSR() ? 'idle' : 'unavailable')
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Core streaming send ────────────────────────────────────
  const sendMessage = useCallback(async (text: string, isAutomatic = false, wrongExplain = false) => {
    const userText = text.trim()
    if (!userText && !isAutomatic) return

    const isAutoGreet = isAutomatic && !userText && !wrongExplain
    const isWrongExplain = wrongExplain
    const userMsg: ChatMessage | null = userText ? { role: 'user', content: userText } : null
    const historySnapshot = messagesRef.current.slice(-6)

    // Detect emotion from child's message (auto messages are neutral)
    const emotionSignal = isAutomatic ? 'neutral' : detectEmotion(userText)

    // Increment struggle count for non-automatic child messages
    if (!isAutomatic && userText) {
      setStruggleCount((prev) => prev + 1)
    }

    if (userMsg) {
      setMessages((prev) => {
        const next = [...prev, userMsg]
        messagesRef.current = next
        return next
      })
    }
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/adaptive/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          sessionId:       sessionId ?? null,
          message:         userText || ' ',
          contextHint:     contextHint ?? null,
          currentQuestion: currentQuestion ?? null,
          correctAnswer:   correctAnswer ?? null,
          history:         historySnapshot,
          autoGreet:       isAutoGreet,
          wrongExplain,
          struggleCount,
          emotionSignal,
          problemType,
          progressSummary: progressSummary ?? null,
        }),
      })

      if (!res.body) throw new Error('No stream')

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let aiText    = ''

      setMessages((prev) => {
        const next = [...prev, { role: 'assistant' as const, content: '' }]
        messagesRef.current = next
        return next
      })

      let streamErrorMsg = ''
      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') break outer
          try {
            const parsed = JSON.parse(payload) as { text?: string; error?: string }
            if (parsed.error) { streamErrorMsg = parsed.error; break outer }
            if (parsed.text) {
              aiText += parsed.text
              setMessages((prev) => {
                const next = [...prev.slice(0, -1), { role: 'assistant' as const, content: aiText }]
                messagesRef.current = next
                return next
              })
            }
          } catch { /* ignore malformed JSON chunks */ }
        }
      }
      if (streamErrorMsg) throw new Error(streamErrorMsg)

      if (!aiText) {
        if (isAutoGreet) {
          // Silently remove the empty placeholder for auto-greets
          setMessages((prev) => {
            const next = prev.slice(0, -1)
            messagesRef.current = next
            return next
          })
        } else if (isWrongExplain) {
          // Fallback explanation when AI is unavailable
          const fallback = correctAnswer
            ? `That was a tricky one! The answer is ${correctAnswer}. Study it and feel free to ask me why before moving on!`
            : "That was a tricky one! Look at the correct answer and ask me anything about it before you continue."
          setMessages((prev) => {
            const next = [...prev.slice(0, -1), { role: 'assistant' as const, content: fallback }]
            messagesRef.current = next
            return next
          })
        } else {
          setMessages((prev) => {
            const next = [...prev.slice(0, -1), { role: 'assistant' as const, content: "Hmm, I didn't get that. Try asking again!" }]
            messagesRef.current = next
            return next
          })
        }
      }
    } catch {
      if (isAutoGreet) {
        // Fail silently for auto-greets
        setMessages((prev) => {
          const next = prev.filter((m) => m.content !== '')
          messagesRef.current = next
          return next
        })
      } else if (isWrongExplain) {
        // Fallback explanation when AI throws
        const fallback = correctAnswer
          ? `That was a tricky one! The answer is ${correctAnswer}. Study it and feel free to ask me why before moving on!`
          : "That was a tricky one! Look at the correct answer and ask me anything about it before you continue."
        setMessages((prev) => {
          const next = prev.filter((m) => m.content !== '')
          const withFallback = [...next, { role: 'assistant' as const, content: fallback }]
          messagesRef.current = withFallback
          return withFallback
        })
      } else {
        setMessages((prev) => {
          const next = [...prev, { role: 'assistant' as const, content: "I'm having a little trouble right now. Ask me again in a moment!" }]
          messagesRef.current = next
          return next
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [childId, sessionId, currentQuestion, correctAnswer, contextHint, struggleCount, problemType, progressSummary])

  // ── Auto-greet on new question ────────────────────────────
  useEffect(() => {
    if (!currentQuestion || currentQuestion === greetedQuestionRef.current) return
    greetedQuestionRef.current = currentQuestion
    setMessages([])
    messagesRef.current = []
    setStruggleCount(0) // reset struggle on new question
    const t = setTimeout(() => void sendMessage('', true), 300)
    return () => clearTimeout(t)
  }, [currentQuestion, sendMessage])

  // ── Auto-explain tapped equation part ────────────────────
  useEffect(() => {
    if (contextHint && contextHint !== prevContextHintRef.current) {
      prevContextHintRef.current = contextHint
      void sendMessage('', true)
    }
  }, [contextHint, sendMessage])

  // ── Auto-explain wrong answer ────────────────────────────
  const prevWrongTriggerRef = useRef(0)
  useEffect(() => {
    if (wrongAnswerTrigger > 0 && wrongAnswerTrigger !== prevWrongTriggerRef.current) {
      prevWrongTriggerRef.current = wrongAnswerTrigger
      // Clear existing messages and send wrong-answer explanation
      setMessages([])
      messagesRef.current = []
      const t = setTimeout(() => void sendMessage('', true, true), 200)
      return () => clearTimeout(t)
    }
  }, [wrongAnswerTrigger, sendMessage])

  // ── Mic helpers ───────────────────────────────────────────
  function clearMicTimer() {
    if (micTimerRef.current) clearTimeout(micTimerRef.current)
  }

  function setMicTemporary(status: MicStatus, durationMs: number) {
    clearMicTimer()
    setMicStatus(status)
    micTimerRef.current = setTimeout(() => setMicStatus('idle'), durationMs)
  }

  const stopListening = useCallback(() => {
    isListeningRef.current = false
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setInterimText('')
    setMicStatus('idle')
  }, [])

  const handleVoice = useCallback(() => {
    if (micStatus === 'unavailable') return

    // If already listening, stop
    if (micStatus === 'listening') {
      stopListening()
      return
    }

    const SR = getSR()
    if (!SR) { setMicStatus('unavailable'); return }

    const recognition = new SR()
    recognition.lang            = 'en-US'
    recognition.interimResults  = true   // live preview as child speaks
    recognition.maxAlternatives = 1
    recognition.continuous      = false

    recognition.onresult = (e) => {
      gotAudioRef.current = true   // browser is actively processing audio
      let interim = ''
      let finalText = ''
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i]
        const transcript = res[0].transcript
        // SpeechRecognitionResult has an `isFinal` property not in our shim - cast
        if ((res as unknown as { isFinal: boolean }).isFinal) {
          finalText += transcript
        } else {
          interim += transcript
        }
      }
      if (finalText) {
        setInput(finalText)
        setInterimText('')
      } else {
        setInterimText(interim)
      }
    }

    recognition.onend = () => {
      setInterimText('')
      isListeningRef.current = false
      const elapsedMs = Date.now() - listenStartMsRef.current
      const wasInstant = elapsedMs < 400  // browser killed it before user could speak
      const hadAudio   = gotAudioRef.current

      setInput((current) => {
        if (current.trim()) {
          // Got a transcript - show green ✓
          setMicTemporary('transcribed', 2000)
        } else if (wasInstant && !hadAudio) {
          // Ended almost immediately with no audio events → browser blocked it (Brave etc.)
          setMicTemporary('error_other', 5000)
        } else {
          // User had time to speak but nothing came through
          setMicTemporary('error_silent', 3500)
        }
        return current
      })
      recognitionRef.current = null
    }

    recognition.onerror = (e) => {
      setInterimText('')
      recognitionRef.current = null
      if (e.error === 'not-allowed' || e.error === 'audio-capture') {
        setMicTemporary('error_denied', 5000)
      } else if (e.error === 'no-speech') {
        setMicTemporary('error_silent', 3500)
      } else if (e.error !== 'aborted') {
        setMicTemporary('error_other', 3500)
      } else {
        setMicStatus('idle')
      }
    }

    recognitionRef.current = recognition
    isListeningRef.current = true
    listenStartMsRef.current = Date.now()
    gotAudioRef.current = false
    recognition.start()
    clearMicTimer()
    setMicStatus('listening')
  }, [micStatus, stopListening]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mic button appearance ─────────────────────────────────
  function micButtonStyle(): string {
    switch (micStatus) {
      case 'listening':    return 'bg-red-500 text-white shadow-lg shadow-red-200'
      case 'transcribed':  return 'bg-green-500 text-white'
      case 'error_denied':
      case 'error_silent':
      case 'error_other':  return 'bg-orange-100 text-orange-500'
      default:             return 'bg-slate-100 text-slate-500 hover:bg-slate-200'
    }
  }

  function micButtonIcon(): string {
    switch (micStatus) {
      case 'transcribed':  return '✓'
      case 'error_denied':
      case 'error_silent':
      case 'error_other':  return '🎤'
      default:             return '🎤'
    }
  }

  const micError = micErrorMessage(micStatus)

  // ── Render ────────────────────────────────────────────────
  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-indigo-100 shadow-md overflow-hidden ${className}`}>

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white shrink-0">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg shrink-0">
          🦉
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight">Ms. Owl</p>
          <p className="text-[11px] text-white/70 leading-tight">Your math teacher</p>
        </div>
        {isLoading && (
          <div className="ml-auto flex gap-1 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce [animation-delay:300ms]" />
          </div>
        )}
      </div>

      {/* Current question context strip - shows Ms. Owl is looking at the same thing */}
      {currentQuestion && (
        <div className="shrink-0 px-3 py-2 bg-indigo-50/70 border-b border-indigo-100 flex items-start gap-2">
          <span className="text-sm shrink-0 mt-0.5">📌</span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wide leading-none mb-0.5">
              Looking at
            </p>
            <p className="text-xs text-indigo-800 leading-snug line-clamp-2 font-medium">
              {currentQuestion}
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-6">
            <span className="text-3xl">🦉</span>
            <p className="text-slate-400 text-xs">Getting ready to help you…</p>
          </div>
        )}
        {isLoading && messages.length === 0 && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-sm shrink-0 mt-0.5">🦉</div>
            <div className="bg-indigo-50 rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-slate-600">
              <TypingDots />
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          msg.role === 'assistant' ? (
            <div key={i} className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-sm shrink-0 mt-0.5">🦉</div>
              <div className="bg-indigo-50 rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-slate-700 leading-relaxed max-w-[85%]">
                {msg.content || (isLoading && i === messages.length - 1 ? <TypingDots /> : '')}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <div className="bg-violet-100 text-violet-900 rounded-2xl rounded-tr-sm px-3 py-2 text-sm leading-relaxed max-w-[85%]">
                {msg.content}
              </div>
            </div>
          )
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── G1 observe mode: no input, just a tap-hint footer ── */}
      {mode === 'observe' && (
        <div className="px-3 py-3 border-t border-slate-100 shrink-0 text-center">
          <p className="text-xs text-slate-400">
            Tap any part of the problem to ask Ms. Owl about it
          </p>
        </div>
      )}

      {/* ── Grade 2+ modes: listening + error banners + input ── */}
      {mode !== 'observe' && (
        <>
          {/* Listening banner */}
          {micStatus === 'listening' && (
            <div className="mx-3 mb-1 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <span className="text-xs font-semibold text-red-600">
                {interimText ? `"${interimText}"` : 'Listening... speak now'}
              </span>
              <button
                onClick={stopListening}
                className="ml-auto text-xs text-red-400 hover:text-red-600 font-medium"
              >
                Stop
              </button>
            </div>
          )}

          {/* Error banner */}
          {micError && (
            <div className="mx-3 mb-1 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
              <span className="text-xs text-orange-700 leading-snug">{micError}</span>
            </div>
          )}

          {/* Input row */}
          <div className="flex items-end gap-2 p-3 border-t border-slate-100 shrink-0">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void sendMessage(input)
                }
              }}
              placeholder={
                micStatus === 'listening' ? 'Listening...'
                : mode === 'soft' ? 'Tap the problem or type here...'
                : 'Ask me anything...'
              }
              rows={1}
              className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-slate-400"
              style={{ maxHeight: '72px' }}
            />

            {/* Mic button */}
            {micStatus !== 'unavailable' && (
              <button
                onClick={handleVoice}
                title={
                  micStatus === 'listening' ? 'Tap to stop recording'
                  : micStatus === 'transcribed' ? 'Got it!'
                  : micStatus === 'error_denied' ? 'Microphone blocked'
                  : 'Tap to speak'
                }
                className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-200 ${micButtonStyle()} ${
                  micStatus === 'listening' ? 'scale-110' : ''
                }`}
              >
                {micButtonIcon()}
              </button>
            )}

            <button
              onClick={() => void sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="shrink-0 w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Shared typing dots ─────────────────────────────────────
function TypingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="animate-bounce [animation-delay:0ms]">·</span>
      <span className="animate-bounce [animation-delay:120ms]">·</span>
      <span className="animate-bounce [animation-delay:240ms]">·</span>
    </span>
  )
}
