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
  const [sosAlert, setSosAlert] = useState(null);
  const handleSOS = async () => {
  try {
    await API.post(
      "/incidents",
      {
        title: "SOS Emergency",
        description: "Emergency reported by user",
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
  console.log(error);
  console.log(error.response?.data);

  alert(
    error.response?.data?.message ||
    "SOS Failed"
  );
}
};

  const [incidents, setIncidents] = useState([]);

  
  console.log(incidents);
  const totalIncidents = incidents.length;

const highCount = incidents.filter(
  (incident) => incident.severity === "High"
).length;

const mediumCount = incidents.filter(
  (incident) => incident.severity === "Medium"
).length;

const lowCount = incidents.filter(
  (incident) => incident.severity === "Low"
).length;

  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");

  const fetchIncidents = async () => {
    try {
      const response = await API.get(
        `/incidents?search=${search}&severity=${filterSeverity}`
      );

      setIncidents(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [search, filterSeverity]);



useEffect(() => {
  const socket = io("http://localhost:5000");

  socket.on("connect", () => {
    console.log("Socket Connected:", socket.id);
  });

  socket.on("newIncident", (incident) => {
    console.log("New Incident Received:", incident);

    setIncidents((prev) => [incident, ...prev]);
  });



  socket.on("statusUpdated", (updatedIncident) => {
  console.log("Status Updated:", updatedIncident);

  setIncidents((prev) =>
    prev.map((incident) =>
      incident._id === updatedIncident._id
        ? updatedIncident
        : incident
    )
  );
});

  socket.on("sosAlert", (incident) => {
    alert(
      `🚨 EMERGENCY ALERT!\n\n${incident.title}\n${incident.description}`
    );
  });

  return () => {
    socket.disconnect();
  };
}, []);


 const handleSubmit = async () => {
  try {
    const editId = localStorage.getItem("editId");

    if (editId) {
      await API.put(
        `/incidents/${editId}`,
        {
          title,
          description,
          location,
          severity,
        }
      );

      alert("Incident Updated!");

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

await API.post(
  "/incidents",
  formData,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  }
);

      alert("Incident Reported!");
    }

    fetchIncidents();

    setTitle("");
    setDescription("");
    setLocation("");
    setSeverity("Low");
    setImage(null);
  } catch (error) {
    console.log(error);
    alert("Operation Failed");
  }
};

  return (
  <>
    {sosAlert && (
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          backgroundColor: "red",
          color: "white",
          padding: "20px",
          borderRadius: "10px",
          zIndex: 9999,
          width: "300px",
        }}
      >
        <h2>🚨 SOS ALERT</h2>

        <p>{sosAlert.title}</p>

        <button onClick={() => setSosAlert(null)}>
          Close
        </button>
      </div>
    )}

    <div
  style={{
    textAlign: "center",
    marginTop: "50px",
    maxWidth: "800px",
    margin: "50px auto",
  }}
>


      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    background: "#111827",
    borderBottom: "1px solid #374151",
    marginBottom: "30px",
  }}
>
  <h2>🚨 CrowdGuard</h2>

  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "15px",
  }}
>
  <span>
    Welcome, {localStorage.getItem("userName")}
  </span>

  <button
    onClick={() => {
      localStorage.clear();
      window.location.href = "/login";
    }}
    style={{
      background: "#ef4444",
      color: "white",
      border: "none",
      padding: "8px 12px",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    Logout
  </button>
</div>
</div>



      <h1>Report Incident</h1>
      <button
  onClick={handleSOS}
  style={{
    backgroundColor: "red",
    color: "white",
    padding: "12px 25px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    marginBottom: "20px",
  }}
>
  🚨 SOS EMERGENCY
</button>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
         width: "100%",
         padding: "12px",
         borderRadius: "8px",
         marginBottom: "10px",
}}        
      />

      <br />
      <br />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "10px",
}}
      />

      <br />
      <br />

      <input
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={{
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "10px",
}}


      />


          <br />
          <br />

<input
  type="file"
  onChange={(e) => setImage(e.target.files[0])}
  style={{
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "10px",
}}
/>

      <br />
      <br />

      <select
        value={severity}
        onChange={(e) => setSeverity(e.target.value)}
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      <br />
      <br />

      <button onClick={handleSubmit}>
        Submit Incident
      </button>

      <hr style={{ margin: "30px 0" }} />


    <h2>Dashboard Statistics</h2>

<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "20px",
  }}
>
  <div style={{ border: "1px solid white", padding: "15px" }}>
    <h3>Total</h3>
    <p>{totalIncidents}</p>
  </div>

  <div style={{ border: "2px solid red", padding: "15px" }}>
  <h3>High</h3>
    <p>{highCount}</p>
  </div>

  <div style={{ border: "1px solid white", padding: "15px" }}>
    <h3>Medium</h3>
    <p>{mediumCount}</p>
  </div>

  <div style={{ border: "1px solid white", padding: "15px" }}>
    <h3>Low</h3>
    <p>{lowCount}</p>
  </div>
</div>





      <input
        type="text"
        placeholder="Search Incident"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "10px",
}}
      />

      <br />
      <br />

      <select
        value={filterSeverity}
        onChange={(e) => setFilterSeverity(e.target.value)}
      >
        <option value="">All Severities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      <br />
      <br />

    <h2>Incident Map</h2>
<MapView incidents={incidents} />

      <h2>Reported Incidents</h2>

      {incidents.map((incident) => (
        <div
          key={incident._id}
        style={{
  border:
    incident.severity === "High"
      ? "2px solid #ef4444"
      : incident.severity === "Medium"
      ? "2px solid #facc15"
      : "2px solid #22c55e",

  background: "#111827",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  margin: "20px auto",
  padding: "20px",
  width: "70%",
  textAlign: "left",
}}
        >
          <h3>{incident.title}</h3>


            {incident.image && (
  <img
    src={`http://localhost:5000/uploads/${incident.image}`}
    alt="Incident"
    style={{
      width: "250px",
      marginBottom: "10px",
      borderRadius: "8px",
    }}
  />
)}


          <p>{incident.description}</p>

          <p>
            <strong>Location:</strong> {incident.location}
          </p>

          <p>
            <strong>Severity:</strong> {incident.severity}
          </p>


          <p>
  <strong>Status:</strong>{" "}
  <span
    style={{
      color:
        incident.status === "Pending"
          ? "orange"
          : incident.status === "Verified"
          ? "lime"
          : "cyan",
      fontWeight: "bold",
    }}
  >
    {incident.status}
  </span>
</p>

<select
  value={incident.status || "Pending"}
  onChange={async (e) => {
    try {
      await API.put(
        `/incidents/${incident._id}/status`,
        {
          status: e.target.value,
        }
      );

      fetchIncidents();
    } catch (error) {
      console.log(error);
      alert("Status Update Failed");
    }
  }}
>
  <option value="Pending">Pending</option>
  <option value="Verified">Verified</option>
  <option value="Resolved">Resolved</option>
</select>

          <p>
            <strong>Reported By:</strong>{" "}
            {incident.user?.name || "Unknown"}
          </p>

          <p>
            <strong>Reported On:</strong>{" "}
            {new Date(incident.createdAt).toLocaleString()}
</p>

          <button
  onClick={() => {
    setTitle(incident.title);
    setDescription(incident.description);
    setLocation(incident.location);
    setSeverity(incident.severity);

    localStorage.setItem("editId", incident._id);
  }}
>
  Edit
</button>




          <button
  onClick={async () => {
    try {
      await API.delete(`/incidents/${incident._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Incident Deleted");
      fetchIncidents();
    } catch (error) {
      console.log(error);
      alert("Delete Failed");
    }
  }}
>
  Delete
</button>

                </div>
      ))}
    </div>
  </>
  );
}

export default Dashboard;