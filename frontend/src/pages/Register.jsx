import { useState } from "react";
import { registerUser } from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
  try {
    const res = await registerUser({
      name,
      email,
      password,
    });

    alert("Registration Successful!");
    console.log(res.data);
  } catch (error) {
    console.error(error);
    alert("Registration Failed");
  }
};

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Register</h1>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

     <button onClick={handleRegister}>
  Register
</button>
    </div>
  );
}

export default Register;