export default function TokenDetailLoading() {
  return (
    <div className="min-h-screen bg-[#0039C6] flex items-center justify-center">
      <div className="bg-white p-8 rounded-3xl shadow-lg">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-[#c0ff00] border-r-[#c0ff00] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium">Loading token details...</p>
        </div>
      </div>
    </div>
  )
}
