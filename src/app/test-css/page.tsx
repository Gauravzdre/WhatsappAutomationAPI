export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">CSS Test</h1>
        <p className="text-lg text-gray-600 mb-6">
          If you can see this styled content, Tailwind CSS is working correctly.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-500 h-16 rounded-lg"></div>
          <div className="bg-green-500 h-16 rounded-lg"></div>
          <div className="bg-blue-500 h-16 rounded-lg"></div>
        </div>
        <button className="mt-6 w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-semibold">
          Test Button
        </button>
      </div>
    </div>
  )
} 