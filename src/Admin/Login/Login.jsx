import { useState } from "react";
import axios from "axios";
import styles from "./Login.module.css";
import { ClipLoader } from "react-spinners";

const Login = ({ setLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `https://coliving-gurgaon-backend.onrender.com/api/admin/login`,
        { username, password }
      );

      if (res.data.success) {
        localStorage.setItem("adminToken", res.data.token);
        setLoggedIn(true);
      } else {
        alert("Login failed");
      }
    } catch (err) {
      alert("Login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <h2 className={styles.heading}>Admin Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={styles.input}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.input}
      />
      <br />
      <button onClick={handleLogin} disabled={loading}>
        Login
      </button>

      {loading && (
        <div className={styles.loaderOverlay}>
          <ClipLoader color="#222" size={50} />
        </div>
      )}
    </div>
  );
};

export default Login;
