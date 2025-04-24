export default function SettingsLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="h-10 w-64 bg-[#222] rounded-xl animate-pulse mb-2"></div>
      <div className="h-6 w-96 bg-[#222] rounded-xl animate-pulse mb-8"></div>

      <div className="bg-[#111] rounded-3xl p-6 border-4 border-black mb-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-[#222] animate-pulse"></div>
          <div className="flex-1">
            <div className="h-8 w-48 bg-[#222] rounded-xl animate-pulse mb-4"></div>
            <div className="h-10 w-full max-w-md bg-[#222] rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#111] rounded-3xl p-6 border-4 border-black h-[500px]">
          <div className="h-8 w-48 bg-[#222] rounded-xl animate-pulse mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-[#222] rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>

        <div className="bg-[#111] rounded-3xl p-6 border-4 border-black h-[500px]">
          <div className="h-8 w-48 bg-[#222] rounded-xl animate-pulse mb-6"></div>
          <div className="h-64 bg-[#222] rounded-xl animate-pulse"></div>
        </div>
      </div>

      <div className="bg-[#111] rounded-3xl p-6 border-4 border-black">
        <div className="h-8 w-48 bg-[#222] rounded-xl animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-[#222] rounded-xl animate-pulse"></div>
          <div className="h-32 bg-[#222] rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
