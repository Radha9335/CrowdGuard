import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const SEVERITY_COLOR_MAP = {
  High: "#ef4444",
  Medium: "#eab308",
  Low: "#22c55e",
};

function IncidentCharts({ incidents = [] }) {
  const highCount = incidents.filter((i) => i.severity === "High").length;
  const mediumCount = incidents.filter((i) => i.severity === "Medium").length;
  const lowCount = incidents.filter((i) => i.severity === "Low").length;

  const rawSeverityData = [
    { name: "High", value: highCount, color: "#ef4444" },
    { name: "Medium", value: mediumCount, color: "#eab308" },
    { name: "Low", value: lowCount, color: "#22c55e" },
  ];

  // Filter out 0 value items for clean pie chart rendering
  const activeSeverityData = rawSeverityData.filter((d) => d.value > 0);

  const statusData = [
    { name: "Pending", count: incidents.filter((i) => i.status === "Pending").length },
    { name: "Verified", count: incidents.filter((i) => i.status === "Verified").length },
    { name: "Resolved", count: incidents.filter((i) => i.status === "Resolved").length },
  ];

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const label = date.toLocaleDateString("en-US", { weekday: "short" });
    const count = incidents.filter((inc) => {
      const d = new Date(inc.createdAt);
      return d.toDateString() === date.toDateString();
    }).length;
    return { day: label, count };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Status Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">📊 By Status</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "#fff", borderRadius: "8px" }} />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Severity Pie Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col justify-between">
        <h3 className="text-white font-bold mb-2">🥧 By Severity</h3>
        {activeSeverityData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm py-12">
            No incident severity data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={activeSeverityData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={true}
              >
                {activeSeverityData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "#fff", borderRadius: "8px" }} />
            </PieChart>
          </ResponsiveContainer>
        )}
        <div className="flex justify-center gap-4 text-xs font-semibold mt-2">
          <span className="text-red-400">🔴 High: {highCount}</span>
          <span className="text-yellow-400">🟡 Medium: {mediumCount}</span>
          <span className="text-green-400">🟢 Low: {lowCount}</span>
        </div>
      </div>

      {/* Last 7 Days Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">📅 Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={last7Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "#fff", borderRadius: "8px" }} />
            <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default IncidentCharts;
