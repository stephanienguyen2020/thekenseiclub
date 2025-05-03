export default function WatchlistLoading() {
  return (
    <div className="p-6">
      <h1 className="text-4xl font-black text-white mb-8">Watchlist</h1>
      <div className="bg-white rounded-3xl p-6 border-4 border-black">
        <div className="mb-6">
          <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl border-4 border-black p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
                  <div>
                    <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-12 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex gap-2">
                    <div className="w-16 h-10 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
