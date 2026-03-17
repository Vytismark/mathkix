'use client'

interface ClickableEquationProps {
  expression: string
  onPartClick: (partLabel: string) => void
  disabled?: boolean
}

/**
 * Tokenises a math expression into tappable segments.
 * Each segment shows a highlight on hover; clicking opens the AI teacher
 * with context about what the child tapped.
 *
 * Token types recognised:
 *   - fractions: "3/4"
 *   - numbers: "12", "3.5"
 *   - operators: "+", "-", "×", "÷", "=", "?", "<", ">", "≤", "≥"
 *   - variables/unknowns: single letters
 *   - parentheses and brackets
 *   - whitespace (not interactive)
 */

type Token = {
  text: string
  label: string   // human-readable description for AI context
  interactive: boolean
}

function tokenise(expression: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < expression.length) {
    // Skip whitespace
    if (/\s/.test(expression[i])) {
      tokens.push({ text: expression[i], label: '', interactive: false })
      i++
      continue
    }

    // Fraction: digit(s)/digit(s)
    const fractionMatch = expression.slice(i).match(/^(\d+)\/(\d+)/)
    if (fractionMatch) {
      const text = fractionMatch[0]
      const [, num, den] = fractionMatch
      tokens.push({
        text,
        label: `the fraction ${num} over ${den}`,
        interactive: true,
      })
      i += text.length
      continue
    }

    // Number (integer or decimal)
    const numberMatch = expression.slice(i).match(/^\d+(\.\d+)?/)
    if (numberMatch) {
      const text = numberMatch[0]
      tokens.push({ text, label: `the number ${text}`, interactive: true })
      i += text.length
      continue
    }

    // Operators
    if ('+-×÷=?<>≤≥'.includes(expression[i])) {
      const ch = expression[i]
      const labels: Record<string, string> = {
        '+': 'the plus sign', '-': 'the minus sign',
        '×': 'the multiplication sign', '÷': 'the division sign',
        '=': 'the equals sign', '?': 'the unknown',
        '<': 'the less-than sign', '>': 'the greater-than sign',
        '≤': 'less than or equal to', '≥': 'greater than or equal to',
      }
      tokens.push({ text: ch, label: labels[ch] ?? ch, interactive: true })
      i++
      continue
    }

    // Variable (single letter)
    if (/[a-zA-Z]/.test(expression[i])) {
      const ch = expression[i]
      tokens.push({ text: ch, label: `the variable ${ch}`, interactive: true })
      i++
      continue
    }

    // Parentheses / brackets
    if ('()[]'.includes(expression[i])) {
      const ch = expression[i]
      tokens.push({ text: ch, label: `the bracket ${ch}`, interactive: true })
      i++
      continue
    }

    // Anything else: non-interactive pass-through
    tokens.push({ text: expression[i], label: '', interactive: false })
    i++
  }

  return tokens
}

export function ClickableEquation({ expression, onPartClick, disabled = false }: ClickableEquationProps) {
  const tokens = tokenise(expression)

  return (
    <span className="inline-flex flex-wrap items-center gap-0.5 font-mono text-lg leading-relaxed">
      {tokens.map((token, idx) =>
        token.interactive && !disabled ? (
          <button
            key={idx}
            onClick={() => onPartClick(token.label)}
            className="px-1 rounded hover:bg-yellow-100 hover:text-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors cursor-pointer"
            title={`Tap to ask about ${token.label}`}
          >
            {token.text}
          </button>
        ) : (
          <span key={idx}>{token.text}</span>
        )
      )}
    </span>
  )
}
