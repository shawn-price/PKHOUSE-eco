export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-white mb-4">PKHOUSE ECO</h1>
        <p className="text-xl text-slate-300 mb-8">Real Estate Ecosystem Platform</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-700 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-2">For Consumers</h2>
            <p className="text-slate-300">Browse properties and find your perfect home</p>
          </div>
          <div className="bg-slate-700 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-2">For Middlemen</h2>
            <p className="text-slate-300">Manage deals and commissions</p>
          </div>
          <div className="bg-slate-700 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-2">For Agents</h2>
            <p className="text-slate-300">Track your network and partnerships</p>
          </div>
        </div>
      </div>
    </main>
  )
}