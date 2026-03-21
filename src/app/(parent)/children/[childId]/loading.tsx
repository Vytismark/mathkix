export default function ChildDetailLoading() {
  return (
    <div className="max-w-3xl animate-pulse">
      <div className="h-4 w-24 bg-white/[0.06] rounded mb-5" />
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.06]" />
        <div>
          <div className="h-8 w-40 bg-white/[0.06] rounded-xl mb-2" />
          <div className="h-4 w-24 bg-white/[0.04] rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white/[0.04] rounded-2xl border border-white/[0.06]" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white/[0.04] rounded-2xl border border-white/[0.06]" />
        ))}
      </div>
    </div>
  )
}
