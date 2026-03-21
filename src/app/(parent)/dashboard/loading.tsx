export default function DashboardLoading() {
  return (
    <div className="max-w-5xl animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-8">
        <div>
          <div className="h-8 w-48 bg-white/[0.06] rounded-xl mb-2" />
          <div className="h-4 w-64 bg-white/[0.04] rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-white/[0.06] rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-white/[0.04] rounded-2xl border border-white/[0.06]" />
        ))}
      </div>
      <div className="h-6 w-32 bg-white/[0.06] rounded-lg mb-4" />
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-28 bg-white/[0.04] rounded-2xl border border-white/[0.06]" />
        ))}
      </div>
    </div>
  )
}
