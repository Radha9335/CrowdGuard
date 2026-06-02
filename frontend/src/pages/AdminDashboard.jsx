import { useEffect, useState } from "react";
import API from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

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
      alert("Admin Access Failed");
    }
  };

  if (!stats) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🛡 Admin Dashboard</h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ border: "1px solid white", padding: "20px" }}>
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>

        <div style={{ border: "1px solid white", padding: "20px" }}>
          <h3>Total Incidents</h3>
          <p>{stats.totalIncidents}</p>
        </div>

        <div style={{ border: "2px solid red", padding: "20px" }}>
          <h3>High</h3>
          <p>{stats.highSeverity}</p>
        </div>

        <div style={{ border: "2px solid orange", padding: "20px" }}>
          <h3>Medium</h3>
          <p>{stats.mediumSeverity}</p>
        </div>

        <div style={{ border: "2px solid green", padding: "20px" }}>
          <h3>Low</h3>
          <p>{stats.lowSeverity}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;