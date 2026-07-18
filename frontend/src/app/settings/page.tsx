'use client';
import { Sidebar } from '@/components/navigation/Sidebar';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex">
      <Sidebar />
      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10 pb-32">
        <div className="max-w-4xl bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <h1 className="text-3xl font-bold font-heading text-slate-900">Platform Settings</h1>
            <p className="text-slate-500 mt-1 font-medium font-sans">Manage notifications, integrations, and preferences.</p>
          </div>

          <div className="p-8 space-y-8 text-sm font-semibold text-slate-700">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
                  <span>Email alerts for expiring documents</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
                  <span>Daily Life Brain summary reports</span>
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">MCP Servers Status</h2>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Life Brain Orchestrator</span>
                  <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">ONLINE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Document MCP</span>
                  <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">ONLINE</span>
                </div>
              </div>
            </section>

            <button className="bg-slate-900 text-white px-6 py-3.5 rounded-xl hover:bg-slate-800 font-bold shadow-md cursor-pointer transition-colors">
              Save Preferences
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
