import { io } from "socket.io-client";
import MapView from "../components/MapView";
import ChatBot from "../components/ChatBot";
import IncidentCharts from "../components/IncidentCharts";
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
  const [activeTab, setActiveTab] = useState("all");
  const [myIncidents, setMyIncidents] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [showComments, setShowComments] = useState({});

  const currentUserId = localStorage.getItem("userId");

  const totalIncidents = incidents.length;
  const highCount = incidents.filter((i) => i.severity === "High").length;
  const mediumCount = incidents.filter((i) => i.severity === "Medium").length;
  const lowCount = incidents.filter((i) => i.severity === "Low").length;

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

  const fetchMyIncidents = async () => {
    try {
      setLoading(true);
      const response = await API.get("/incidents/my");
      setMyIncidents(response.data.data);
    } catch (error) {
      console.log(error);
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

  useEffect(() => {
    if (activeTab === "my") fetchMyIncidents();
  }, [activeTab]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setLocation(data.display_name || `${latitude}, ${longitude}`);
        } catch {
          setLocation(`${latitude}, ${longitude}`);
        }
      },
      () => alert("Unable to retrieve your location")
    );
  };

  const handleSOS = async () => {
    try {
      setFormLoading(true);
      await API.post("/incidents", {
        title: "🚨 SOS Emergency",
        description: "Emergency reported by user - IMMEDIATE RESPONSE NEEDED",
        location: "Current User Location",
        severity: "High",
      });
      alert("🚨 Emergency Alert Sent!");
      fetchIncidents();
    } catch (error) {
      alert(error.response?.data?.message || "SOS Failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !location.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    if (title.length < 5) { setError("Title must be at least 5 characters"); return; }
    if (description.length < 10) { setError("Description must be at least 10 characters"); return; }

    try {
      setFormLoading(true);
      setError("");
      const editId = localStorage.getItem("editId");

      if (editId) {
        await API.put(`/incidents/${editId}`, { title, description, location, severity });
        alert("✅ Incident Updated!");
        localStorage.removeItem("editId");
      } else {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("location", location);
        formData.append("severity", severity);
        if (image) formData.append("image", image);
        await API.post("/incidents", formData);
        alert("✅ Incident Reported!");
      }

      fetchIncidents();
      setTitle(""); setDescription(""); setLocation(""); setSeverity("Low"); setImage(null);
    } catch (error) {
      setError(error.response?.data?.message || "Operation Failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpvote = async (incidentId) => {
    try {
      const response = await API.put(`/incidents/${incidentId}/upvote`, {});
      const updateList = (list) =>
        list.map((inc) =>
          inc._id === incidentId
            ? {
                ...inc,
                upvotes: response.data.upvoted
                  ? [...(inc.upvotes || []), currentUserId]
                  : (inc.upvotes || []).filter((id) => id !== currentUserId),
              }
            : inc
        );
      setIncidents((prev) => updateList(prev));
      setMyIncidents((prev) => updateList(prev));
    } catch (error) {
      console.log("Upvote error:", error.response?.data);
      alert("Failed to upvote: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAddComment = async (incidentId) => {
    const text = commentText[incidentId];
    if (!text || text.trim().length < 1) return;

    try {
      setCommentLoading((prev) => ({ ...prev, [incidentId]: true }));
      const response = await API.post(`/incidents/${incidentId}/comments`, { text: text.trim() });
      const updateList = (list) =>
        list.map((inc) =>
          inc._id === incidentId ? { ...inc, comments: response.data.comments } : inc
        );
      setIncidents((prev) => updateList(prev));
      setMyIncidents((prev) => updateList(prev));
      setCommentText((prev) => ({ ...prev, [incidentId]: "" }));
    } catch (error) {
      console.log("Comment error:", error.response?.data);
      alert("Failed to add comment: " + (error.response?.data?.message || error.message));
    } finally {
      setCommentLoading((prev) => ({ ...prev, [incidentId]: false }));
    }
  };

  const handleDeleteComment = async (incidentId, commentId) => {
    try {
      await API.delete(`/incidents/${incidentId}/comments/${commentId}`);
      const updateList = (list) =>
        list.map((inc) =>
          inc._id === incidentId
            ? { ...inc, comments: inc.comments.filter((c) => c._id !== commentId) }
            : inc
        );
      setIncidents((prev) => updateList(prev));
      setMyIncidents((prev) => updateList(prev));
    } catch (error) {
      alert("Failed to delete comment");
    }
  };

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.on("connect", () => console.log("🟢 Socket Connected:", socket.id));
    socket.on("newIncident", (incident) => {
      setIncidents((prev) => [incident, ...prev]);
      setNotifications((prev) => [{ id: Date.now(), message: `New Incident: ${incident.title}`, type: "new" }, ...prev]);
    });
    socket.on("statusUpdated", (updatedIncident) => {
      setIncidents((prev) => prev.map((inc) => inc._id === updatedIncident._id ? updatedIncident : inc));
      setNotifications((prev) => [{ id: Date.now(), message: `${updatedIncident.title} marked as ${updatedIncident.status}`, type: "update" }, ...prev]);
    });
    socket.on("sosAlert", (incident) => {
      alert(`🚨 EMERGENCY ALERT!\n\n${incident.title}\n${incident.description}`);
      setNotifications((prev) => [{ id: Date.now(), message: `🚨 SOS ALERT: ${incident.title}`, type: "sos" }, ...prev]);
    });
    socketRef.current = socket;
    return () => socket.disconnect();
  }, []);

  const handleDeleteIncident = async (id) => {
    if (window.confirm("Are you sure you want to delete this incident?")) {
      try {
        await API.delete(`/incidents/${id}`);
        alert("✅ Incident Deleted");
        fetchIncidents();
        fetchMyIncidents();
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

  const renderIncidentCard = (incident) => (
    <div
      key={incident._id}
      className={`bg-slate-800/50 border-2 rounded-xl p-6 hover:shadow-lg transition-all ${
        incident.severity === "High" ? "border-red-500/50"
        : incident.severity === "Medium" ? "border-yellow-500/50"
        : "border-green-500/50"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white">{incident.title}</h3>
          <p className="text-slate-400 text-sm">
            Reported by <span className="font-semibold text-slate-300">{incident.user?.name}</span> on{" "}
            {new Date(incident.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`px-4 py-2 rounded-lg font-bold text-sm ${
            incident.severity === "High" ? "bg-red-500/20 text-red-300"
            : incident.severity === "Medium" ? "bg-yellow-500/20 text-yellow-300"
            : "bg-green-500/20 text-green-300"
          }`}>{incident.severity}</span>
          <span className={`px-4 py-2 rounded-lg font-bold text-sm ${
            incident.status === "Pending" ? "bg-orange-500/20 text-orange-300"
            : incident.status === "Verified" ? "bg-green-500/20 text-green-300"
            : "bg-blue-500/20 text-blue-300"
          }`}>{incident.status}</span>
        </div>
      </div>

      {incident.image && (
        <img src={`http://localhost:5000/uploads/${incident.image}`} alt="Incident" className="w-full h-48 object-cover rounded-lg mb-4" />
      )}

      <p className="text-slate-300 mb-4">{incident.description}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
        <div className="bg-slate-700/50 p-3 rounded-lg">
          <p className="text-slate-400">Location</p>
          <p className="text-white font-semibold">{incident.location}</p>
        </div>
        <div className="bg-slate-700/50 p-3 rounded-lg">
          <p className="text-slate-400">Status</p>
          <p className={`font-semibold ${
            incident.status === "Pending" ? "text-orange-400"
            : incident.status === "Verified" ? "text-green-400"
            : "text-blue-400"
          }`}>{incident.status}</p>
        </div>
        <div className="bg-slate-700/50 p-3 rounded-lg">
          <p className="text-slate-400">Upvotes</p>
          <p className="text-white font-semibold">👍 {incident.upvotes?.length || 0}</p>
        </div>
        <div className="bg-slate-700/50 p-3 rounded-lg">
          <p className="text-slate-400">Comments</p>
          <p className="text-white font-semibold">💬 {incident.comments?.length || 0}</p>
        </div>
      </div>

      {incident.aiAnalysis && (
        <div className="bg-slate-700/50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
          <h4 className="text-blue-300 font-bold mb-2">🤖 AI Analysis</h4>
          <pre className="text-slate-300 text-sm whitespace-pre-wrap">{incident.aiAnalysis}</pre>
        </div>
      )}

      <div className="flex gap-3 flex-wrap mb-4">
        <button
          onClick={() => handleUpvote(incident._id)}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 ${
            incident.upvotes?.map(String).includes(String(currentUserId))
              ? "bg-purple-600 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-purple-600/30"
          }`}
        >
          👍 Upvote ({incident.upvotes?.length || 0})
        </button>

        <button
          onClick={() => setShowComments((prev) => ({ ...prev, [incident._id]: !prev[incident._id] }))}
          className="px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg font-semibold text-sm transition-colors"
        >
          💬 Comments ({incident.comments?.length || 0})
        </button>

        {incident.user?._id === currentUserId && (
          <>
            <button
              onClick={() => handleEditIncident(incident)}
              className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors font-semibold text-sm"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => handleDeleteIncident(incident._id)}
              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors font-semibold text-sm"
            >
              🗑️ Delete
            </button>
          </>
        )}
      </div>

      {showComments[incident._id] && (
        <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
          <h4 className="text-white font-bold mb-3">💬 Comments</h4>
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
            {(!incident.comments || incident.comments.length === 0) && (
              <p className="text-slate-400 text-sm">No comments yet. Be the first!</p>
            )}
            {incident.comments?.map((comment) => (
              <div key={comment._id} className="flex justify-between items-start bg-slate-700/50 p-3 rounded-lg">
                <div>
                  <p className="text-purple-300 text-xs font-semibold mb-1">{comment.user?.name}</p>
                  <p className="text-slate-200 text-sm">{comment.text}</p>
                  <p className="text-slate-500 text-xs mt-1">{new Date(comment.createdAt).toLocaleString()}</p>
                </div>
                {String(comment.user?._id) === String(currentUserId) && (
                  <button
                    onClick={() => handleDeleteComment(incident._id, comment._id)}
                    className="text-red-400 hover:text-red-300 text-xs ml-3 mt-1"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText[incident._id] || ""}
              onChange={(e) => setCommentText((prev) => ({ ...prev, [incident._id]: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment(incident._id)}
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={() => handleAddComment(incident._id)}
              disabled={commentLoading[incident._id]}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {commentLoading[incident._id] ? "..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
              onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
              className="px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {notifications.length > 0 && (
          <div className="mb-8 bg-slate-800/50 border border-slate-700 rounded-xl p-4 max-h-32 overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-3">📢 Recent Notifications</h3>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notification) => (
                <p key={notification.id} className={`text-sm p-2 rounded ${
                  notification.type === "sos" ? "bg-red-500/20 text-red-300"
                  : notification.type === "update" ? "bg-blue-500/20 text-blue-300"
                  : "bg-purple-500/20 text-purple-300"
                }`}>{notification.message}</p>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">📍 Report an Incident</h2>
          <p className="text-slate-400 mb-8">Help your community by reporting incidents in real-time</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <button
            onClick={handleSOS}
            disabled={formLoading}
            className="w-full py-4 mb-6 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {formLoading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Sending SOS...</>
            ) : <><span>🚨</span><span>EMERGENCY SOS ALERT</span></>}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Incident Title *</label>
                <input
                  type="text"
                  placeholder="Brief title of the incident"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setError(""); }}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Location *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Where is the incident?"
                    value={location}
                    onChange={(e) => { setLocation(e.target.value); setError(""); }}
                    className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                  <button type="button" onClick={getLocation} className="px-4 py-3 bg-blue-500/20 text-blue-300 border border-blue-500/50 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-semibold whitespace-nowrap">
                    📍 Auto
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Severity (Auto-detected by AI)</label>
                <select value={severity} disabled className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white opacity-60 cursor-not-allowed">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">💡 Severity is automatically determined by our AI analysis</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                <textarea
                  placeholder="Provide detailed information about the incident"
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setError(""); }}
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Upload Photo</label>
                <input type="file" onChange={(e) => setImage(e.target.files[0])} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 focus:outline-none focus:border-purple-500 transition-all" />
                {image && <p className="text-sm text-green-400 mt-2">✅ {image.name}</p>}
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={formLoading}
            className="w-full mt-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {formLoading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Submitting...</>
            ) : "📤 Submit Incident Report"}
          </button>
        </div>

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

        <IncidentCharts incidents={incidents} />

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

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">🗺️ Incident Map</h3>
          <MapView incidents={incidents} />
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              activeTab === "all" ? "bg-purple-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            📋 All Incidents
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              activeTab === "my" ? "bg-purple-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            👤 My Incidents ({myIncidents.length})
          </button>
        </div>

        {activeTab === "all" && (
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
                  {incidents.map((incident) => renderIncidentCard(incident))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors">← Previous</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => setPage(p)} className={`px-4 py-2 rounded-lg transition-colors ${page === p ? "bg-purple-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-white"}`}>{p}</button>
                    ))}
                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors">Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "my" && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">👤 My Incident History</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : myIncidents.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                <p className="text-slate-400 text-lg">You haven't reported any incidents yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {myIncidents.map((incident) => renderIncidentCard(incident))}
              </div>
            )}
          </div>
        )}
      </div>

      <ChatBot />
    </div>
  );
}

export default Dashboard;
