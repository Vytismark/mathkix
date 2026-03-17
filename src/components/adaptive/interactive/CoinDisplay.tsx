'use client'

export type Coin = 'penny' | 'nickel' | 'dime' | 'quarter'

interface CoinDisplayProps {
  coins: Coin[]
  className?: string
}

const COIN_CONFIG: Record<Coin, { label: string; value: string; bg: string; border: string; text: string }> = {
  penny:   { label: 'Penny',   value: '1¢',  bg: 'bg-amber-600',  border: 'border-amber-700',  text: 'text-amber-50' },
  nickel:  { label: 'Nickel',  value: '5¢',  bg: 'bg-gray-400',   border: 'border-gray-500',   text: 'text-gray-50' },
  dime:    { label: 'Dime',    value: '10¢', bg: 'bg-gray-300',   border: 'border-gray-400',   text: 'text-gray-700' },
  quarter: { label: 'Quarter', value: '25¢', bg: 'bg-yellow-500', border: 'border-yellow-600', text: 'text-yellow-50' },
}

/**
 * Displays a row of styled coin circles with cent values.
 * Read-only visual aid for money-related questions.
 */
export function CoinDisplay({ coins, className = '' }: CoinDisplayProps) {
  return (
    <div className={`flex flex-wrap justify-center gap-3 ${className}`}>
      {coins.map((coin, i) => {
        const cfg = COIN_CONFIG[coin]
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`w-12 h-12 rounded-full ${cfg.bg} ${cfg.border} border-2 flex items-center justify-center font-bold text-sm ${cfg.text} shadow-sm`}
            >
              {cfg.value}
            </div>
            <span className="text-xs text-gray-500 font-medium">{cfg.label}</span>
          </div>
        )
      })}
    </div>
  )
}
