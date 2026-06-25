import { useEffect, useState } from "react";
import API from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#ef4444", "#eab308", "#22c55e"];

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await API.get("/admin/stats");
      setStats(response.data);
    } catch (error) {
      console.log(error);
      setError("Admin Access Failed");
    }
  };

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await API.get("/incidents?limit=1000");
      setIncidents(response.data.data);
    } catch (error) {
      console.log(error);
      setError("Failed to fetch incidents");
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchStats();
    fetchIncidents();
  }, []);

  // ── Date filter ──────────────────────────────────────────────
  const filteredIncidents = incidents.filter((incident) => {
    const matchesStatus = !filterStatus || incident.status === filterStatus;
    const matchesSearch = !search || incident.title.toLowerCase().includes(search.toLowerCase());
    const incDate = new Date(incident.createdAt);
    const matchesStart = !startDate || incDate >= new Date(startDate);
    const matchesEnd = !endDate || incDate <= new Date(endDate + "T23:59:59");
    return matchesStatus && matchesSearch && matchesStart && matchesEnd;
  });

  // ── Chart Data ───────────────────────────────────────────────
  const severityData = [
    { name: "High", value: incidents.filter((i) => i.severity === "High").length },
    { name: "Medium", value: incidents.filter((i) => i.severity === "Medium").length },
    { name: "Low", value: incidents.filter((i) => i.severity === "Low").length },
  ];

  const statusData = [
    { name: "Pending", count: incidents.filter((i) => i.status === "Pending").length },
    { name: "Verified", count: incidents.filter((i) => i.status === "Verified").length },
    { name: "Resolved", count: incidents.filter((i) => i.status === "Resolved").length },
  ];

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const count = incidents.filter((inc) => {
      const d = new Date(inc.createdAt);
      return d.toDateString() === date.toDateString();
    }).length;
    return { day: label, count };
  });

  // Top reporters
  const reporterMap = {};
  incidents.forEach((inc) => {
    const name = inc.user?.name || "Unknown";
    reporterMap[name] = (reporterMap[name] || 0) + 1;
  });
  const topReporters = Object.entries(reporterMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Top locations
  const locationMap = {};
  incidents.forEach((inc) => {
    const loc = inc.location?.split(",")[0] || "Unknown";
    locationMap[loc] = (locationMap[loc] || 0) + 1;
  });
  const topLocations = Object.entries(locationMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([location, count]) => ({ location, count }));

  // ── Export CSV ───────────────────────────────────────────────
  const exportCSV = () => {
    setExportLoading(true);
    try {
      const headers = ["Title", "Description", "Location", "Severity", "Status", "Reporter", "Date"];
      const rows = filteredIncidents.map((inc) => [
        `"${inc.title}"`,
        `"${inc.description?.replace(/"/g, "'")}"`,
        `"${inc.location}"`,
        inc.severity,
        inc.status,
        `"${inc.user?.name || "Unknown"}"`,
        new Date(inc.createdAt).toLocaleDateString(),
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CrowdGuard_Incidents_${new Date().toLocaleDateString()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("CSV Export Failed");
    } finally {
      setExportLoading(false);
    }
  };

  // ── Export PDF ───────────────────────────────────────────────
  const exportPDF = () => {
    setExportLoading(true);
    try {
      const printWindow = window.open("", "_blank");
      const tableRows = filteredIncidents
        .map(
          (inc) => `
          <tr>
            <td>${inc.title}</td>
            <td>${inc.location}</td>
            <td style="color:${inc.severity === "High" ? "#ef4444" : inc.severity === "Medium" ? "#eab308" : "#22c55e"};font-weight:bold">${inc.severity}</td>
            <td>${inc.status}</td>
            <td>${inc.user?.name || "Unknown"}</td>
            <td>${new Date(inc.createdAt).toLocaleDateString()}</td>
          </tr>`
        )
        .join("");

      printWindow.document.write(`
        <html>
          <head>
            <title>CrowdGuard - Incident Report</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; }
              h1 { color: #7c3aed; border-bottom: 3px solid #7c3aed; padding-bottom: 10px; }
              .stats { display: flex; gap: 20px; margin: 20px 0; }
              .stat-box { background: #f1f5f9; padding: 15px 25px; border-radius: 8px; text-align: center; }
              .stat-box h2 { margin: 0; font-size: 28px; color: #7c3aed; }
              .stat-box p { margin: 5px 0 0; color: #64748b; font-size: 13px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
              th { background: #7c3aed; color: white; padding: 10px; text-align: left; }
              td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
              tr:nth-child(even) { background: #f8fafc; }
              .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; }
              .badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>🚨 CrowdGuard — Incident Report</h1>
            <p style="color:#64748b">Generated on: ${new Date().toLocaleString()}</p>

            <div class="stats">
              <div class="stat-box"><h2>${incidents.length}</h2><p>Total Incidents</p></div>
              <div class="stat-box"><h2 style="color:#ef4444">${stats?.highSeverity || 0}</h2><p>High Severity</p></div>
              <div class="stat-box"><h2 style="color:#eab308">${stats?.mediumSeverity || 0}</h2><p>Medium Severity</p></div>
              <div class="stat-box"><h2 style="color:#22c55e">${stats?.lowSeverity || 0}</h2><p>Low Severity</p></div>
              <div class="stat-box"><h2>${stats?.totalUsers || 0}</h2><p>Total Users</p></div>
            </div>

            <h2>Incident Details (${filteredIncidents.length} records)</h2>
            <table>
              <thead>
                <tr>
                  <th>Title</th><th>Location</th><th>Severity</th><th>Status</th><th>Reporter</th><th>Date</th>
                </tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>

            <div class="footer">
              CrowdGuard — AI-Powered Real-Time Incident Reporting Platform &nbsp;|&nbsp; Confidential Report
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } catch (err) {
      alert("PDF Export Failed");
    } finally {
      setExportLoading(false);
    }
  };

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
      {/* Nav */}
      <nav className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            🛡️ Admin Dashboard
          </div>
          <button
            onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
            className="px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">📊 Dashboard Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
              <h3 className="text-3xl font-bold text-purple-400">{stats.totalUsers}</h3>
              <p className="text-slate-400 text-sm mt-2">Total Users</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
              <h3 className="text-3xl font-bold text-purple-400">{stats.totalIncidents}</h3>
              <p className="text-slate-400 text-sm mt-2">Total Incidents</p>
            </div>
            <div className="bg-slate-800/50 border-2 border-red-500/30 rounded-xl p-6 text-center hover:border-red-500 transition-colors">
              <h3 className="text-3xl font-bold text-red-400">{stats.highSeverity}</h3>
              <p className="text-slate-400 text-sm mt-2">🔴 High</p>
            </div>
            <div className="bg-slate-800/50 border-2 border-yellow-500/30 rounded-xl p-6 text-center hover:border-yellow-500 transition-colors">
              <h3 className="text-3xl font-bold text-yellow-400">{stats.mediumSeverity}</h3>
              <p className="text-slate-400 text-sm mt-2">🟡 Medium</p>
            </div>
            <div className="bg-slate-800/50 border-2 border-green-500/30 rounded-xl p-6 text-center hover:border-green-500 transition-colors">
              <h3 className="text-3xl font-bold text-green-400">{stats.lowSeverity}</h3>
              <p className="text-slate-400 text-sm mt-2">🟢 Low</p>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">📈 Status Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-orange-900/30 to-orange-900/10 border border-orange-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-orange-300">Pending Review</h3>
                  <p className="text-slate-400 text-sm mt-1">Awaiting verification</p>
                </div>
                <div className="text-5xl font-bold text-orange-400">{pendingCount}</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-900/30 to-green-900/10 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-green-300">Verified</h3>
                  <p className="text-slate-400 text-sm mt-1">Confirmed incidents</p>
                </div>
                <div className="text-5xl font-bold text-green-400">{verifiedCount}</div>
              </div>
            </div>
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Line Chart - 14 Days */}
          <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">📅 Incidents — Last 14 Days</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={last14Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "#fff" }} />
                <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2} dot={{ fill: "#a855f7", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Severity */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">🥧 By Severity</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={severityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {severityData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Reporters + Top Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">🏆 Top Reporters</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topReporters} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "#fff" }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">📍 Top Locations</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topLocations} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis type="category" dataKey="location" tick={{ fill: "#94a3b8", fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "#fff" }} />
                <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search, Filter, Date Range + Export */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">🔍 Search, Filter & Export</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={exportCSV}
              disabled={exportLoading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              📥 Export CSV ({filteredIncidents.length} records)
            </button>
            <button
              onClick={exportPDF}
              disabled={exportLoading}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              📄 Export PDF Report
            </button>
            {(startDate || endDate || search || filterStatus) && (
              <button
                onClick={() => { setStartDate(""); setEndDate(""); setSearch(""); setFilterStatus(""); }}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-bold transition-colors"
              >
                ✖ Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* All Incidents Table */}
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
                    incident.severity === "High" ? "border-red-500/50"
                    : incident.severity === "Medium" ? "border-yellow-500/50"
                    : "border-green-500/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white">{incident.title}</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        Reported by <span className="font-semibold text-slate-300">{incident.user?.name}</span> on{" "}
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${
                        incident.severity === "High" ? "bg-red-500/20 text-red-300"
                        : incident.severity === "Medium" ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-green-500/20 text-green-300"
                      }`}>{incident.severity}</span>
                      <span className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${
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
                      <p className="text-slate-400">Reporter</p>
                      <p className="text-white font-semibold">{incident.user?.name}</p>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <p className="text-slate-400">Email</p>
                      <p className="text-white font-semibold text-xs">{incident.user?.email}</p>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <p className="text-slate-400">Reported Date</p>
                      <p className="text-white font-semibold text-xs">{new Date(incident.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {incident.aiAnalysis && (
                    <div className="bg-slate-700/50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                      <h4 className="text-blue-300 font-bold mb-2">🤖 AI Analysis</h4>
                      <pre className="text-slate-300 text-sm whitespace-pre-wrap">{incident.aiAnalysis}</pre>
                    </div>
                  )}

                  {/* Status Update */}
                  <div className="bg-slate-700/50 p-4 rounded-lg mb-4">
                    <p className="text-slate-300 text-sm font-semibold mb-3">📌 Update Status:</p>
                    <div className="flex gap-3 flex-wrap">
                      {["Pending", "Verified", "Resolved"].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(incident._id, status)}
                          disabled={statusLoading[incident._id]}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            incident.status === status ? "bg-purple-600 text-white"
                            : status === "Pending" ? "bg-orange-500/20 text-orange-300 hover:bg-orange-500/30"
                            : status === "Verified" ? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                            : "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {statusLoading[incident._id] ? "Updating..." : status}
                        </button>
                      ))}
                    </div>
                  </div>

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
