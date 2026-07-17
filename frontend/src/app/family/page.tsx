export default function FamilyPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Family Members</h1>
            <p className="text-gray-600">Manage profiles and permissions for your household.</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-blue-700">
            + Add Member
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                J
              </div>
              <div>
                <h3 className="font-bold text-lg">John Doe</h3>
                <p className="text-sm text-gray-500">Primary Admin (Father)</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Linked Documents: 5</p>
              <p>Health Profiles: Active</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xl">
                J
              </div>
              <div>
                <h3 className="font-bold text-lg">Jane Doe</h3>
                <p className="text-sm text-gray-500">Admin (Mother)</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Linked Documents: 4</p>
              <p>Health Profiles: Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
