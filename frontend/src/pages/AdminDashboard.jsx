import { useEffect, useState } from "react";
import API from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
  fetchStats();
  fetchIncidents();
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

 const fetchIncidents = async () => {
  try {
    const response = await API.get("/incidents");

    console.log(response.data);

    setIncidents(response.data.data);
  } catch (error) {
    console.log(error);
  }
};


const updateStatus = async (
  id,
  status
) => {
  try {
    await API.put(
      `/incidents/${id}/status`,
      {
        status,
      }
    );

    fetchIncidents();
  } catch (error) {
    console.log(error);
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

      <h2 style={{ marginTop: "40px" }}>
        All Incidents
      </h2>

      {Array.isArray(incidents) &&
  incidents.map((incident) => (
        <div
          key={incident._id}
          style={{
            border: "1px solid white",
            padding: "15px",
            margin: "15px auto",
            width: "70%",
            textAlign: "left",
          }}
        >
          <h3>{incident.title}</h3>

          <p>
            <strong>Location:</strong>{" "}
            {incident.location}
          </p>

          <p>
            <strong>Severity:</strong>{" "}
            {incident.severity}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {incident.status}
          </p>


          <button
  onClick={() =>
    updateStatus(
      incident._id,
      "Verified"
    )
  }
  style={{
    marginRight: "10px",
    backgroundColor: "green",
    color: "white",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer",
  }}
>
  Verify
</button>

<button
  onClick={() =>
    updateStatus(
      incident._id,
      "Resolved"
    )
  }
  style={{
    backgroundColor: "blue",
    color: "white",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer",
  }}
>
  Resolve
</button>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;