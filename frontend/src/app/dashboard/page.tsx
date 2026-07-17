import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-blue-600 tracking-tight">NexusOS</span>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link href="/dashboard" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Dashboard</Link>
                <Link href="/family" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Family</Link>
                <Link href="/vault" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Vault</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/settings" className="text-gray-500 hover:text-gray-700 text-sm font-medium">Settings</Link>
              <Link href="/profile" className="text-gray-500 hover:text-gray-700 text-sm font-medium">Profile</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Welcome back, John</h1>
          <p className="mt-2 text-lg text-gray-600">Here's what's happening with your family today.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Life Brain Widget */}
          <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                ✨ Life Brain
              </h2>
              <p className="text-blue-100 text-sm mt-1">Your AI master orchestrator</p>
            </div>
            <div className="p-6 flex-1 flex flex-col bg-gray-50">
              <div className="flex-1 min-h-[200px] border border-gray-200 rounded-xl bg-white p-4 mb-4 overflow-y-auto">
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">LB</div>
                  <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-sm text-gray-800">
                    Hello! How can I assist your family today?
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <input type="text" className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ask about documents, schemes, or finance..." />
                <button className="px-5 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm">Send</button>
              </div>
            </div>
          </div>

          {/* Quick Stats / Vault Widget */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Digital Vault</h2>
              <p className="text-sm text-gray-500 mb-4">You have 12 documents securely stored.</p>
              <Link href="/vault" className="text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1">
                Access Vault <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Family Members</h2>
              <p className="text-sm text-gray-500 mb-4">4 active members in your household.</p>
              <Link href="/family" className="text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1">
                Manage Family <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
