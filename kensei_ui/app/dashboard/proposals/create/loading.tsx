export default function Loading() {
  return (
    <div className="p-6">
      <div className="flex items-center mb-8">
        <div className="bg-gray-200 w-40 h-10 rounded-xl animate-pulse"></div>
      </div>

      <div className="bg-white rounded-3xl p-8 border-4 border-black mb-8">
        <div className="bg-gray-200 p-4 rounded-xl border-4 border-black mb-8 animate-pulse">
          <div className="h-8 w-64 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 w-full bg-gray-300 rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-xl border-4 border-gray-200 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="w-6 h-6 rounded-full bg-gray-200"></div>
              </div>

              <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200">
                <div className="flex justify-between mb-2">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <div className="h-14 w-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

      <div className="bg-gray-200 p-6 rounded-xl border-4 border-black animate-pulse">
        <div className="h-6 w-48 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-300 mt-1"></div>
              <div className="h-4 w-full bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
