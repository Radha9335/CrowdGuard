import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Profile() {
  const navigate = useNavigate();
  const [userName] = useState(localStorage.getItem("userName"));
  const [userEmail] = useState(localStorage.getItem("userEmail"));
  const [userRole] = useState(localStorage.getItem("role"));
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await API.get("/incidents");
      const userIncidents = response.data.data.filter(
        (incident) => incident.user?._id === localStorage.getItem("userId")
      );
      
      setUserStats({
        totalReported: userIncidents.length,
        high: userIncidents.filter((i) => i.severity === "High").length,
        medium: userIncidents.filter((i) => i.severity === "Medium").length,
        low: userIncidents.filter((i) => i.severity === "Low").length,
        verified: userIncidents.filter((i) => i.status === "Verified").length,
        resolved: userIncidents.filter((i) => i.status === "Resolved").length,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 hover:opacity-80 transition-opacity"
          >
            ← CrowdGuard
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">{userName}</h1>
              <p className="text-slate-400">{userEmail}</p>
              <p className="text-purple-300 font-semibold mt-1">
                Role: <span className="capitalize">{userRole}</span>
              </p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-xl font-bold text-white mb-4">📋 Member Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-slate-400">Member Since</p>
                <p className="text-white font-semibold">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-slate-400">Account Status</p>
                <p className="text-green-300 font-semibold">✅ Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Statistics */}
        {userStats && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-6">📊 Your Incident Reports</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
                <h3 className="text-3xl font-bold text-purple-400">
                  {userStats.totalReported}
                </h3>
                <p className="text-slate-400 text-sm mt-2">Total Reported</p>
              </div>
              <div className="bg-slate-800/50 border-2 border-red-500/30 rounded-xl p-6 text-center hover:border-red-500 transition-colors">
                <h3 className="text-3xl font-bold text-red-400">
                  {userStats.high}
                </h3>
                <p className="text-slate-400 text-sm mt-2">High Severity</p>
              </div>
              <div className="bg-slate-800/50 border-2 border-yellow-500/30 rounded-xl p-6 text-center hover:border-yellow-500 transition-colors">
                <h3 className="text-3xl font-bold text-yellow-400">
                  {userStats.verified}
                </h3>
                <p className="text-slate-400 text-sm mt-2">Verified</p>
              </div>
              <div className="bg-slate-800/50 border-2 border-green-500/30 rounded-xl p-6 text-center hover:border-green-500 transition-colors">
                <h3 className="text-3xl font-bold text-green-400">
                  {userStats.resolved}
                </h3>
                <p className="text-slate-400 text-sm mt-2">Resolved</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4">⚙️ Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105"
            >
              📍 Report New Incident
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105"
            >
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;