'use client'

import { useState, useEffect, useCallback } from 'react'

interface ReadAloudButtonProps {
  text: string
  gradeLevel: number
}

/**
 * Speaker button that reads question text aloud via Web Speech API.
 * Only rendered for G1-3 children (gradeLevel 1-3).
 */
export function ReadAloudButton({ text, gradeLevel }: ReadAloudButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Stop speaking when text changes (new question)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [text])

  const toggleSpeak = useCallback(() => {
    if (!supported) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.85
    utterance.pitch = 1.1
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }, [text, isSpeaking, supported])

  // Only show for G1-3
  if (gradeLevel > 3 || !supported) return null

  return (
    <button
      onClick={toggleSpeak}
      className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
        isSpeaking
          ? 'bg-[#3678FF] text-white scale-110'
          : 'bg-blue-100 text-[#3678FF] hover:bg-blue-200'
      }`}
      aria-label={isSpeaking ? 'Stop reading' : 'Read question aloud'}
      title={isSpeaking ? 'Stop' : 'Read aloud'}
    >
      {isSpeaking ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="4" height="12" rx="1" />
          <rect x="14" y="6" width="4" height="12" rx="1" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      )}
    </button>
  )
}
