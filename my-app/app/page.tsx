import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-4xl w-full text-center">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-white mb-4">
              Web3Nova Academy
            </h1>
            <p className="text-2xl text-white opacity-90">
              Payment Management Platform
            </p>
          </div>

          {/* Description */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 mb-8">
            <p className="text-xl text-white mb-6">
              Secure platform for students to track their course payments and manage their scholarship status.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl mb-2">📚</div>
                <h3 className="font-semibold mb-1">Web Development</h3>
                <p className="text-sm opacity-90">Full-stack development</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl mb-2">⛓️</div>
                <h3 className="font-semibold mb-1">Smart Contract</h3>
                <p className="text-sm opacity-90">Blockchain development</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl mb-2">🎨</div>
                <h3 className="font-semibold mb-1">UI/UX Design</h3>
                <p className="text-sm opacity-90">User experience design</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold text-lg hover:bg-opacity-90 transition shadow-lg"
            >
              Student Login
            </Link>
            <Link
              href="/tracker"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-indigo-600 transition"
            >
              View Payment Tracker
            </Link>
          </div>

          {/* Footer Info */}
          <div className="text-white text-sm opacity-75">
            <p>Secure • Transparent • Efficient</p>
          </div>
        </div>
      </div>
    </div>
  );
}