'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How does the placement quiz work?',
    answer:
      'Your child answers a short set of adaptive questions that take about 3 minutes. The quiz starts at their enrolled grade level and adjusts up or down based on each answer. At the end, MathKix maps their strengths and gaps across every Common Core math domain and begins lessons at exactly the right level.',
  },
  {
    question: 'What if my child is behind their grade level?',
    answer:
      'That is completely fine - and it is one of the main reasons parents use MathKix. The placement quiz detects gaps automatically, and the adaptive engine serves questions from earlier standards until your child masters them. There is no "grade shaming" - your child only sees encouragement and progress.',
  },
  {
    question: 'Does MathKix replace school math?',
    answer:
      'MathKix is designed as a supplement, not a replacement. It reinforces what your child learns at school by providing daily practice aligned to the same Common Core standards their teacher uses. Many parents use it for 5-15 minutes a day after school or on weekends.',
  },
  {
    question: 'What devices does it work on?',
    answer:
      'MathKix runs in any modern web browser - Chrome, Safari, Firefox, or Edge. It works on phones, tablets, laptops, and desktops. No app download required. The interface is optimized for touch on tablets and phones with large tap targets designed for small fingers.',
  },
  {
    question: 'Can I track my child\'s progress?',
    answer:
      'Yes. Your parent dashboard shows mastery across every math domain, daily activity, streak data, and which standards your child has completed. You can see exactly where they are strong and where they need more practice.',
  },
  {
    question: 'What happens after the free trial?',
    answer:
      'After 30 days, you can choose monthly ($9.99/mo), annual ($79.99/yr), or lifetime ($149.99 one-time) billing. If you cancel, your child\'s progress is saved for 90 days in case you come back. No cancellation fees, no contracts.',
  },
]

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col gap-2">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIdx === i
          return (
            <div
              key={i}
              className="rounded-xl border overflow-hidden transition-colors"
              style={{
                background: isOpen ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                borderColor: isOpen ? 'rgba(231,76,60,0.2)' : 'rgba(255,255,255,0.07)',
              }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-sm font-semibold text-white pr-4">{item.question}</span>
                <ChevronDown
                  className="w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}
                />
              </button>
              <div
                className="overflow-hidden transition-all duration-200"
                style={{
                  maxHeight: isOpen ? 300 : 0,
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <p className="px-6 pb-5 text-sm text-slate-400 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
