import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            🚨 CrowdGuard
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 rounded-lg border-2 border-purple-500 text-purple-300 hover:bg-purple-500/10 transition-all duration-300"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          {/* Main Title */}
          <div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              Real-Time Incident
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                Reporting Platform
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Report incidents instantly, get real-time updates, and help your community stay safe with CrowdGuard.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-105"
            >
              📍 Report Incident
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105"
            >
              🚨 SOS Emergency
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-purple-500 transition-colors duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Real-Time Updates</h3>
            <p className="text-slate-400">
              Get instant notifications about incidents happening in your area with live socket.io updates
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-purple-500 transition-colors duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-white mb-2">Interactive Map</h3>
            <p className="text-slate-400">
              Visualize incidents on a map with severity markers. Green (Low), Yellow (Medium), Red (High)
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-purple-500 transition-colors duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-white mb-2">AI Analysis</h3>
            <p className="text-slate-400">
              Automatic severity detection using Gemini AI to ensure critical incidents get immediate attention
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-purple-500 transition-colors duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-white mb-2">Community Verification</h3>
            <p className="text-slate-400">
              Community members can verify incidents to increase credibility of reports
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-purple-500 transition-colors duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-xl font-bold text-white mb-2">Photo Evidence</h3>
            <p className="text-slate-400">
              Upload images with your incident report for better documentation and verification
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-purple-500 transition-colors duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="text-4xl mb-4">👮</div>
            <h3 className="text-xl font-bold text-white mb-2">Admin Dashboard</h3>
            <p className="text-slate-400">
              Dedicated admin panel to verify, respond to, and manage incidents efficiently
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                10K+
              </div>
              <p className="text-slate-300 mt-2">Incidents Reported</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                50K+
              </div>
              <p className="text-slate-300 mt-2">Active Users</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                95%
              </div>
              <p className="text-slate-300 mt-2">Accuracy Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900 mt-20 py-8">
        <div className="max-w-6xl mx-auto text-center text-slate-400">
          <p>© 2024 CrowdGuard. All rights reserved. Making communities safer together.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;