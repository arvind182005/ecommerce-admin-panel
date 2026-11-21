import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
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
      // Backend ke route par data send ho raha hai
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/login");
      } else {
        setErrorMessage(data.message || "Signup failed!");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Server connection failed");
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
            Build Your
            <br />
            Better Tomorrow
          </h1>

          <p>
            Create your account and take the next step towards your goals.
          </p>
        </div>

        <div></div>
      </div>

      <div className="auth-right">
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-icon">A</div>

          <h2>Create Account</h2>

          <p className="form-description">
            Create your account to get started
          </p>

          {/* Form error text */}
          {errorMessage && (
            <div
              style={{
                backgroundColor: "#ffebee",
                color: "#c62828",
                padding: "8px 12px",
                borderRadius: "5px",
                fontSize: "14px",
                marginBottom: "12px",
                border: "1px solid #ef9a9a",
                textAlign: "left",
              }}
            >
              {errorMessage}
            </div>
          )}

          <input
            className="input"
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
          />

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

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          <p className="bottom-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;