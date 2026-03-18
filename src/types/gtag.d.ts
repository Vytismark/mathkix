declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'js' | 'set',
      targetId: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params?: Record<string, any>
    ) => void
    dataLayer: unknown[]
  }
}

export {}
