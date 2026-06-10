import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>🚨 CrowdGuard</h1>

      <h2>Real-Time Incident Reporting Platform</h2>

      <p>
        Report incidents, verify alerts and improve community safety.
      </p>

      <button onClick={() => navigate("/dashboard")}>
        Report Incident
      </button>




      <button
        style={{ marginLeft: "10px" }}
        onClick={() => navigate("/dashboard")}
      >
        SOS
      </button>




      <br /><br />

<button
  onClick={() => navigate("/login")}
>
  Login
</button>

<button
  onClick={() => navigate("/register")}
  style={{ marginLeft: "10px" }}
>
  Register
</button>



    </div>
  );
}

export default Home;