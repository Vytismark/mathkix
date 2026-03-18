export function getPasswordStrength(pw: string): { level: number; label: string; color: string } {
  if (pw.length === 0)  return { level: 0, label: '',        color: '' }
  if (pw.length < 4)    return { level: 1, label: 'Too short', color: '#ef4444' }
  if (pw.length < 8)    return { level: 2, label: 'Weak',      color: '#f59e0b' }
  const hasUpper  = /[A-Z]/.test(pw)
  const hasNum    = /\d/.test(pw)
  const hasSymbol = /[^A-Za-z0-9]/.test(pw)
  const extras = [hasUpper, hasNum, hasSymbol].filter(Boolean).length
  if (pw.length >= 12 && extras >= 2) return { level: 4, label: 'Strong',  color: '#10b981' }
  if (pw.length >= 8  && extras >= 1) return { level: 3, label: 'Good',    color: '#10b981' }
  return { level: 2, label: 'Fair', color: '#f59e0b' }
}
