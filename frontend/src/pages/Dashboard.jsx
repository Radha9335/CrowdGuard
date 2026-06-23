import { io } from "socket.io-client";
import MapView from "../components/MapView";
import { useEffect, useState, useRef } from "react";
import API from "../services/api";

function Dashboard() {
  const socketRef = useRef(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [image, setImage] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const totalIncidents = incidents.length;
  const highCount = incidents.filter((i) => i.severity === "High").length;
  const mediumCount = incidents.filter((i) => i.severity === "Medium").length;
  const lowCount = incidents.filter((i) => i.severity === "Low").length;

  // ONE fetchIncidents function (merged from your two duplicates)
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await API.get(
        `/incidents?page=${page}&limit=5&search=${search}&severity=${filterSeverity}`
      );
      setIncidents(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.log(error);
      setError("Failed to fetch incidents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchIncidents();
  }, [search, filterSeverity]);

  useEffect(() => {
    fetchIncidents();
  }, [page]);

  // ... rest of your component stays exactly the same
  // Handle SOS
  const handleSOS = async () => {
    try {
      setFormLoading(true);
      await API.post(
        "/incidents",
        {
          title: "🚨 SOS Emergency",
          description: "Emergency reported by user - IMMEDIATE RESPONSE NEEDED",
          location: "Current User Location",
          severity: "High",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("🚨 Emergency Alert Sent!");
      fetchIncidents();
    } catch (error) {
      alert(error.response?.data?.message || "SOS Failed");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Form Submit
  const handleSubmit = async () => {
    // Validation
    if (!title.trim() || !description.trim() || !location.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (title.length < 5) {
      setError("Title must be at least 5 characters");
      return;
    }

    if (description.length < 10) {
      setError("Description must be at least 10 characters");
      return;
    }

    try {
      setFormLoading(true);
      setError("");

      const editId = localStorage.getItem("editId");

      if (editId) {
        await API.put(`/incidents/${editId}`, {
          title,
          description,
          location,
          severity,
        });
        alert("✅ Incident Updated!");
        localStorage.removeItem("editId");
      } else {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("location", location);
        formData.append("severity", severity);
        if (image) {
          formData.append("image", image);
        }

        await API.post("/incidents", formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("✅ Incident Reported!");
      }

      fetchIncidents();
      setTitle("");
      setDescription("");
      setLocation("");
      setSeverity("Low");
      setImage(null);
    } catch (error) {
      setError(error.response?.data?.message || "Operation Failed");
    } finally {
      setFormLoading(false);
    }
  };

  // Fetch incidents on mount and when filters change
  const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

// Fetch incidents on mount and when filters change
const fetchIncidents = async () => {
  try {
    setLoading(true);
    const response = await API.get(
      `/incidents?page=${page}&limit=5&search=${search}&severity=${filterSeverity}`
    );
    setIncidents(response.data.data);
    setTotalPages(response.data.pages);
  } catch (error) {
    console.log(error);
    setError("Failed to fetch incidents");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  setPage(1); // Reset to page 1 when filters change
  fetchIncidents();
}, [search, filterSeverity]);

useEffect(() => {
  fetchIncidents();
}, [page]);

  // Socket.io Setup
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("🟢 Socket Connected:", socket.id);
    });

    socket.on("newIncident", (incident) => {
      setIncidents((prev) => [incident, ...prev]);
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: `New Incident: ${incident.title}`,
          type: "new",
        },
        ...prev,
      ]);
    });

    socket.on("statusUpdated", (updatedIncident) => {
      setIncidents((prev) =>
        prev.map((incident) =>
          incident._id === updatedIncident._id ? updatedIncident : incident
        )
      );
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: `${updatedIncident.title} marked as ${updatedIncident.status}`,
          type: "update",
        },
        ...prev,
      ]);
    });

    socket.on("sosAlert", (incident) => {
      alert(`🚨 EMERGENCY ALERT!\n\n${incident.title}\n${incident.description}`);
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: `🚨 SOS ALERT: ${incident.title}`,
          type: "sos",
        },
        ...prev,
      ]);
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  }, []);

  const handleDeleteIncident = async (id) => {
    if (window.confirm("Are you sure you want to delete this incident?")) {
      try {
        await API.delete(`/incidents/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        alert("✅ Incident Deleted");
        fetchIncidents();
      } catch (error) {
        alert("Delete Failed");
      }
    }
  };

  const handleEditIncident = (incident) => {
    setTitle(incident.title);
    setDescription(incident.description);
    setLocation(incident.location);
    setSeverity(incident.severity);
    localStorage.setItem("editId", incident._id);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            🚨 CrowdGuard
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">
              Welcome, <span className="font-semibold text-white">{localStorage.getItem("userName")}</span>
            </span>
            <div className="relative cursor-pointer">
              <span className="text-2xl">🔔</span>
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
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
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <div className="mb-8 bg-slate-800/50 border border-slate-700 rounded-xl p-4 max-h-32 overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-3">📢 Recent Notifications</h3>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notification) => (
                <p
                  key={notification.id}
                  className={`text-sm p-2 rounded ${
                    notification.type === "sos"
                      ? "bg-red-500/20 text-red-300"
                      : notification.type === "update"
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-purple-500/20 text-purple-300"
                  }`}
                >
                  {notification.message}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Report Incident Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">📍 Report an Incident</h2>
          <p className="text-slate-400 mb-8">Help your community by reporting incidents in real-time</p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* SOS Button */}
          <button
            onClick={handleSOS}
            disabled={formLoading}
            className="w-full py-4 mb-6 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {formLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending SOS...
              </>
            ) : (
              <>
                <span>🚨</span>
                <span>EMERGENCY SOS ALERT</span>
              </>
            )}
          </button>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Incident Title *
                </label>
                <input
                  type="text"
                  placeholder="Brief title of the incident"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setError("");
                  }}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  placeholder="Where is the incident?"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setError("");
                  }}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Severity (Auto-detected by AI)
                </label>
                <select
                  value={severity}
                  disabled
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white opacity-60 cursor-not-allowed"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  💡 Severity is automatically determined by our AI analysis
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description *
                </label>
                <textarea
                  placeholder="Provide detailed information about the incident"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setError("");
                  }}
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Upload Photo
                </label>
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 focus:outline-none focus:border-purple-500 transition-all"
                />
                {image && (
                  <p className="text-sm text-green-400 mt-2">✅ {image.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={formLoading}
            className="w-full mt-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {formLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              "📤 Submit Incident Report"
            )}
          </button>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
            <h3 className="text-3xl font-bold text-white">{totalIncidents}</h3>
            <p className="text-slate-400 text-sm mt-2">Total Incidents</p>
          </div>
          <div className="bg-slate-800/50 border-2 border-red-500/30 rounded-xl p-6 text-center hover:border-red-500 transition-colors">
            <h3 className="text-3xl font-bold text-red-400">{highCount}</h3>
            <p className="text-slate-400 text-sm mt-2">High Severity</p>
          </div>
          <div className="bg-slate-800/50 border-2 border-yellow-500/30 rounded-xl p-6 text-center hover:border-yellow-500 transition-colors">
            <h3 className="text-3xl font-bold text-yellow-400">{mediumCount}</h3>
            <p className="text-slate-400 text-sm mt-2">Medium Severity</p>
          </div>
          <div className="bg-slate-800/50 border-2 border-green-500/30 rounded-xl p-6 text-center hover:border-green-500 transition-colors">
            <h3 className="text-3xl font-bold text-green-400">{lowCount}</h3>
            <p className="text-slate-400 text-sm mt-2">Low Severity</p>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">🔍 Search & Filter</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search incidents by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all"
            />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
            >
              <option value="">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">🗺️ Incident Map</h3>
          <MapView incidents={incidents} />
        </div>

        {/* Incidents List Section */}
        {/* Incidents List Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">📋 All Incidents</h2>
            {incidents.length > 0 && (
              <span className="text-slate-400 text-sm">
                Page <span className="text-white font-bold">{page}</span> of{" "}
                <span className="text-white font-bold">{totalPages}</span>
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : incidents.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
              <p className="text-slate-400 text-lg">No incidents reported yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 mb-8">
                {incidents.map((incident) => (
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
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{incident.title}</h3>
                      <p className="text-slate-400 text-sm">
                        Reported by <span className="font-semibold">{incident.user?.name}</span> on{" "}
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-lg font-bold text-sm ${
                        incident.severity === "High"
                          ? "bg-red-500/20 text-red-300"
                          : incident.severity === "Medium"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-green-500/20 text-green-300"
                      }`}
                    >
                      {incident.severity}
                    </span>
                  </div>

                  {incident.image && (
                    <img
                      src={`http://localhost:5000/uploads/${incident.image}`}
                      alt="Incident"
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}

                  <p className="text-slate-300 mb-4">{incident.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <p className="text-slate-400">Location</p>
                      <p className="text-white font-semibold">{incident.location}</p>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <p className="text-slate-400">Status</p>
                      <p
                        className={`font-semibold ${
                          incident.status === "Pending"
                            ? "text-orange-400"
                            : incident.status === "Verified"
                            ? "text-green-400"
                            : "text-blue-400"
                        }`}
                      >
                        {incident.status}
                      </p>
                    </div>
                  </div>

                  {incident.aiAnalysis && (
                    <div className="bg-slate-700/50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                      <h4 className="text-blue-300 font-bold mb-2">🤖 AI Analysis</h4>
                      <pre className="text-slate-300 text-sm whitespace-pre-wrap">
                        {incident.aiAnalysis}
                      </pre>
                    </div>
                  )}

                  <div className="flex gap-3 flex-wrap">
                    {incident.user?._id === localStorage.getItem("userId") && (
                      <>
                        <button
                          onClick={() => handleEditIncident(incident)}
                          className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteIncident(incident._id)}
                          className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    ← Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        page === p
                          ? "bg-purple-600 text-white"
                          : "bg-slate-700 hover:bg-slate-600 text-white"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;