import { useEffect, useState } from "react";
import API from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const response = await API.get("/admin/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setStats(response.data);
    } catch (error) {
      console.log(error);
      setError("Admin Access Failed");
    }
  };

  // Fetch Incidents
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await API.get("/incidents");
      setIncidents(response.data.data);
    } catch (error) {
      console.log(error);
      setError("Failed to fetch incidents");
    } finally {
      setLoading(false);
    }
  };

  // Update Status
  const updateStatus = async (id, status) => {
    try {
      setStatusLoading((prev) => ({ ...prev, [id]: true }));
      await API.put(`/incidents/${id}/status`, { status });
      fetchIncidents();
    } catch (error) {
      console.log(error);
      alert("Status Update Failed");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Delete Incident
  const deleteIncident = async (id) => {
    if (window.confirm("Are you sure you want to delete this incident?")) {
      try {
        await API.delete(`/incidents/${id}`);
        alert("✅ Incident Deleted");
        fetchIncidents();
      } catch (error) {
        console.log(error);
        alert("Delete Failed");
      }
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchStats();
    fetchIncidents();
  }, []);

  // Filter incidents
  const filteredIncidents = incidents.filter((incident) => {
    const matchesStatus = !filterStatus || incident.status === filterStatus;
    const matchesSearch = !search || incident.title.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate Status Counts
  const pendingCount = incidents.filter((i) => i.status === "Pending").length;
  const verifiedCount = incidents.filter((i) => i.status === "Verified").length;
  const resolvedCount = incidents.filter((i) => i.status === "Resolved").length;

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-300">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            🛡️ Admin Dashboard
          </div>
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Statistics Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">📊 Dashboard Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Total Users */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
              <h3 className="text-3xl font-bold text-purple-400">{stats.totalUsers}</h3>
              <p className="text-slate-400 text-sm mt-2">Total Users</p>
            </div>

            {/* Total Incidents */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
              <h3 className="text-3xl font-bold text-purple-400">{stats.totalIncidents}</h3>
              <p className="text-slate-400 text-sm mt-2">Total Incidents</p>
            </div>

            {/* High Severity */}
            <div className="bg-slate-800/50 border-2 border-red-500/30 rounded-xl p-6 text-center hover:border-red-500 transition-colors">
              <h3 className="text-3xl font-bold text-red-400">{stats.highSeverity}</h3>
              <p className="text-slate-400 text-sm mt-2">🔴 High Severity</p>
            </div>

            {/* Medium Severity */}
            <div className="bg-slate-800/50 border-2 border-yellow-500/30 rounded-xl p-6 text-center hover:border-yellow-500 transition-colors">
              <h3 className="text-3xl font-bold text-yellow-400">{stats.mediumSeverity}</h3>
              <p className="text-slate-400 text-sm mt-2">🟡 Medium Severity</p>
            </div>

            {/* Low Severity */}
            <div className="bg-slate-800/50 border-2 border-green-500/30 rounded-xl p-6 text-center hover:border-green-500 transition-colors">
              <h3 className="text-3xl font-bold text-green-400">{stats.lowSeverity}</h3>
              <p className="text-slate-400 text-sm mt-2">🟢 Low Severity</p>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">📈 Incident Status Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pending */}
            <div className="bg-gradient-to-br from-orange-900/30 to-orange-900/10 border border-orange-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-orange-300">Pending Review</h3>
                  <p className="text-slate-400 text-sm mt-1">Awaiting verification</p>
                </div>
                <div className="text-5xl font-bold text-orange-400">{pendingCount}</div>
              </div>
            </div>

            {/* Verified */}
            <div className="bg-gradient-to-br from-green-900/30 to-green-900/10 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-green-300">Verified</h3>
                  <p className="text-slate-400 text-sm mt-1">Confirmed incidents</p>
                </div>
                <div className="text-5xl font-bold text-green-400">{verifiedCount}</div>
              </div>
            </div>

            {/* Resolved */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-blue-300">Resolved</h3>
                  <p className="text-slate-400 text-sm mt-1">Handled incidents</p>
                </div>
                <div className="text-5xl font-bold text-blue-400">{resolvedCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">🔍 Search & Filter Incidents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search by incident title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* All Incidents Section */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">
            📋 All Incidents ({filteredIncidents.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
              <p className="text-slate-400 text-lg">No incidents found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredIncidents.map((incident) => (
                <div
                  key={incident._id}
                  className={`bg-slate-800/50 border-2 rounded-xl p-6 hover:shadow-lg transition-all ${
                    incident.severity === "High"
                      ? "border-red-500/50"
                      : incident.severity === "Medium"
                      ? "border-yellow-500/50"
                      : "border-green-500/50"
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white">{incident.title}</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        Reported by <span className="font-semibold text-slate-300">{incident.user?.name}</span> on{" "}
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${
                          incident.severity === "High"
                            ? "bg-red-500/20 text-red-300"
                            : incident.severity === "Medium"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-green-500/20 text-green-300"
                        }`}
                      >
                        {incident.severity}
                      </span>
                      <span
                        className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${
                          incident.status === "Pending"
                            ? "bg-orange-500/20 text-orange-300"
                            : incident.status === "Verified"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {incident.status}
                      </span>
                    </div>
                  </div>

                  {/* Image */}
                  {incident.image && (
                    <img
                      src={`http://localhost:5000/uploads/${incident.image}`}
                      alt="Incident"
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}

                  {/* Description */}
                  <p className="text-slate-300 mb-4">{incident.description}</p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <p className="text-slate-400">Location</p>
                      <p className="text-white font-semibold">{incident.location}</p>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <p className="text-slate-400">Reporter</p>
                      <p className="text-white font-semibold">{incident.user?.name}</p>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <p className="text-slate-400">Email</p>
                      <p className="text-white font-semibold text-xs">{incident.user?.email}</p>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <p className="text-slate-400">Reported Date</p>
                      <p className="text-white font-semibold text-xs">
                        {new Date(incident.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {incident.aiAnalysis && (
                    <div className="bg-slate-700/50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                      <h4 className="text-blue-300 font-bold mb-2">🤖 AI Analysis</h4>
                      <pre className="text-slate-300 text-sm whitespace-pre-wrap">
                        {incident.aiAnalysis}
                      </pre>
                    </div>
                  )}

                  {/* Status Update Buttons */}
                  <div className="bg-slate-700/50 p-4 rounded-lg mb-4">
                    <p className="text-slate-300 text-sm font-semibold mb-3">📌 Update Status:</p>
                    <div className="flex gap-3 flex-wrap">
                      {["Pending", "Verified", "Resolved"].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(incident._id, status)}
                          disabled={statusLoading[incident._id]}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            incident.status === status
                              ? "bg-purple-600 text-white"
                              : status === "Pending"
                              ? "bg-orange-500/20 text-orange-300 hover:bg-orange-500/30"
                              : status === "Verified"
                              ? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                              : "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {statusLoading[incident._id] ? "Updating..." : status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => deleteIncident(incident._id)}
                      className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors font-semibold"
                    >
                      🗑️ Delete Incident
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;