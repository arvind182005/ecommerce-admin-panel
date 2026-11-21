import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    
    const savedEmail = sessionStorage.getItem("resetEmail");
    if (!savedEmail) {
      navigate("/forgot-password");
    } else {
      setEmail(savedEmail);
    }
  }, [navigate]);

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

    // Validation check -
    if (formData.password.length < 6) {
      setErrorMessage("Password requires  minimum 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords not matched!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://ecommerce-backend-api-2r29.onrender.com/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
    
        sessionStorage.removeItem("resetEmail");
        alert("Password successfully reset ho gaya! Ab naye password se login karein.");
        navigate("/login");
      } else {
        setErrorMessage(data.message || "Password reset fail ho gaya.");
      }
    } catch (err) {
      console.error("Reset password error:", err);
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
            Create A
            <br />
            New Password
          </h1>

          <p>
            Choose a strong password to keep your account secure.
          </p>
        </div>

        <div></div>
      </div>

      <div className="auth-right">
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-icon">🔒</div>

          <h2>Reset Password</h2>

          <p className="form-description">Create your new password</p>

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
            type="password"
            name="password"
            placeholder="New password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;