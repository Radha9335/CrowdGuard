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
    <div style={{ textAlign: "center", marginTop: "50px" }}>
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
      />

      <br />
      <br />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br />
      <br />

      <input
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />


          <br />
          <br />

<input
  type="file"
  onChange={(e) => setImage(e.target.files[0])}
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
      ? "2px solid red"
      : incident.severity === "Medium"
      ? "2px solid yellow"
      : "2px solid limegreen",

  margin: "10px auto",
  padding: "10px",
  width: "60%",
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
  );
}

export default Dashboard;