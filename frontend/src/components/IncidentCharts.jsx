import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#ef4444", "#eab308", "#22c55e"];

function IncidentCharts({ incidents }) {
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
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">📊 By Status</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "#fff" }} />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">🥧 By Severity</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={severityData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={false}
            >
              {severityData.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "#fff" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">📅 Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={last7Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "#fff" }} />
            <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default IncidentCharts;
