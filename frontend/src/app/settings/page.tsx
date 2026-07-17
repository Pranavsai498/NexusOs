export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-500 mt-1">Manage notifications, integrations, and preferences.</p>
        </div>

        <div className="p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Notifications</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
                <span className="text-gray-700">Email alerts for expiring documents</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
                <span className="text-gray-700">Daily Life Brain summary</span>
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">MCP Servers Status</h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Life Brain Orchestrator</span>
                <span className="text-green-600 text-sm font-bold bg-green-100 px-2 py-1 rounded">ONLINE</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Document MCP</span>
                <span className="text-green-600 text-sm font-bold bg-green-100 px-2 py-1 rounded">ONLINE</span>
              </div>
            </div>
          </section>

          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
