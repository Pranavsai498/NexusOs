export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md border-t-4 border-blue-600">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Join NexusOS</h2>
          <p className="mt-2 text-sm text-gray-600">Start managing your family's life</p>
        </div>
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" className="w-full px-4 py-2 mt-1 border rounded focus:ring-blue-500 focus:border-blue-500" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" className="w-full px-4 py-2 mt-1 border rounded focus:ring-blue-500 focus:border-blue-500" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" className="w-full px-4 py-2 mt-1 border rounded focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••" />
          </div>
          <button type="button" className="w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold shadow-sm transition-colors">
            Create Account
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
