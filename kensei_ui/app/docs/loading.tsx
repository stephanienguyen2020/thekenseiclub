export default function DocsLoading() {
  return (
    <div className="min-h-screen bg-gray-100 animate-pulse">
      {/* Header */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="h-12 bg-gray-700 rounded-md w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-700 rounded-md w-1/2"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-1/4">
          <div className="border-4 border-black bg-white p-4">
            <div className="h-6 bg-gray-300 rounded-md w-1/2 mb-4"></div>
            <div className="space-y-2">
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-6 bg-gray-300 rounded-md w-full"></div>
                ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4 space-y-12">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="border-4 border-black bg-white p-6">
                <div className="h-8 bg-gray-300 rounded-md w-1/3 mb-4"></div>
                <div className="space-y-2">
                  {Array(Math.floor(Math.random() * 5) + 3)
                    .fill(0)
                    .map((_, j) => (
                      <div key={j} className="h-4 bg-gray-300 rounded-md w-full"></div>
                    ))}
                </div>
                <div className="h-40 bg-gray-300 rounded-md w-full my-6"></div>
                <div className="space-y-2">
                  {Array(Math.floor(Math.random() * 3) + 2)
                    .fill(0)
                    .map((_, j) => (
                      <div key={j} className="h-4 bg-gray-300 rounded-md w-full"></div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
