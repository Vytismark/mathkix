'use client'

import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from '@/types/adaptive'

// Web Speech API type shim (not in standard TS DOM lib)
interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

function getSpeechRecognition(): SpeechRecognitionConstructor | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition
    ?? (window as Window & { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition
}

interface AiTeacherBubbleProps {
  childId:         string
  sessionId?:      string
  isOpen:          boolean
  onClose:         () => void
  contextHint?:    string   // equation part the child tapped
  currentQuestion?: string  // full text of the current problem
}

export function AiTeacherBubble({
  childId,
  sessionId,
  isOpen,
  onClose,
  contextHint,
  currentQuestion,
}: AiTeacherBubbleProps) {
  const [messages, setMessages]   = useState<ChatMessage[]>([])
  const [input, setInput]         = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    setSpeechSupported(!!getSpeechRecognition())
  }, [])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string, isAutomatic = false) => {
    const userText = text.trim()
    if (!userText && !isAutomatic) return

    const userMsg: ChatMessage | null = userText ? { role: 'user', content: userText } : null
    if (userMsg) setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/adaptive/ai-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          sessionId: sessionId ?? null,
          message: userText || ' ',
          contextHint: contextHint ?? null,
          currentQuestion: currentQuestion ?? null,
          history: messages.slice(-6),
        }),
      })

      if (!res.body) throw new Error('No stream')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let aiText = ''

      // Add placeholder assistant message
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6).trim()   // trim handles \r\n line endings
            if (payload === '[DONE]') break
            try {
              const { text } = JSON.parse(payload) as { text?: string }
              if (text) {
                aiText += text
                setMessages((prev) => [
                  ...prev.slice(0, -1),
                  { role: 'assistant', content: aiText },
                ])
              }
            } catch { /* ignore parse errors */ }
          }
        }
      }

      // If stream produced no text, replace empty placeholder with fallback
      if (!aiText) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: "Sorry, I didn't catch that. Try asking again!" },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Hmm, I'm having trouble right now. Try again in a moment!" },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoice = () => {
    if (!speechSupported) return
    const SR = getSpeechRecognition()
    if (!SR) return

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SR()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 sm:hidden"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 sm:bottom-24 sm:left-auto sm:right-4 z-50 w-full sm:w-80 rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
        style={{ maxHeight: '85vh' }}>
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🦉</span>
            <span className="font-semibold text-sm">Ask the Teacher</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-lg leading-none">×</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: '160px' }}>
        {messages.length === 0 && !isLoading && (
          <p className="text-gray-400 text-sm text-center mt-4">
            {contextHint
              ? `You tapped on "${contextHint}". What confuses you?`
              : "Hi! What do you need help with? 😊"}
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-xl px-3 py-2 text-sm max-w-[90%] ${
              msg.role === 'user'
                ? 'bg-indigo-100 text-indigo-900 ml-auto text-right'
                : 'bg-gray-100 text-gray-800 mr-auto'
            }`}
          >
            {msg.content || (isLoading && i === messages.length - 1 ? '…' : '')}
          </div>
        ))}
        {isLoading && messages.length === 0 && (
          <div className="bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-500 mr-auto">…</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 p-3 border-t border-gray-100">
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
          placeholder="Type your question…"
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          style={{ maxHeight: '80px' }}
        />
        {speechSupported && (
          <button
            onClick={handleVoice}
            className={`p-2 rounded-lg text-base ${isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            title={isListening ? 'Stop recording' : 'Speak your question'}
          >
            🎤
          </button>
        )}
        <button
          onClick={() => void sendMessage(input)}
          disabled={isLoading || !input.trim()}
          className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 text-sm"
        >
          ➤
        </button>
      </div>
    </div>
    </>
  )
}
