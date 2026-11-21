import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    if (errorMessage) setErrorMessage(""); 
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch("https://ecommerce-backend-api-2r29.onrender.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setErrorMessage(data.message || "Login failed! Please check your credentials.");
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setErrorMessage("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="logo">BY AJ</div>

        <div className="hero-text">
          <h1>
            Welcome
            <br />
            Back
          </h1>

          <p>Login to continue your journey with us.</p>
        </div>

        <div></div>
      </div>

      <div className="auth-right">
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-icon">A</div>

          <h2>Welcome Back</h2>

          <p className="form-description">Login to your account</p>

          {/* Error Message Box */}
          {errorMessage && (
            <div
              style={{
                backgroundColor: "#ffebee",
                color: "#d32f2f",
                padding: "10px 14px",
                borderRadius: "6px",
                fontSize: "14px",
                marginBottom: "12px",
                border: "1px solid #ffcdd2",
                textAlign: "left",
              }}
            >
              {errorMessage}
            </div>
          )}

          <input
            className="input"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Link className="link" to="/forgot-password">
            Forgot Password?
          </Link>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="bottom-text">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;