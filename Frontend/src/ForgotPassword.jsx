import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch("https://ecommerce-backend-api-2r29.onrender.com/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        
        sessionStorage.setItem("resetEmail", email);
        navigate("/otp");
      } else {
        setErrorMessage(data.message || "OTP send failed");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
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
            Forgot
            <br />
            Password?
          </h1>

          <p>
            Don't worry. We'll help you recover your account.
          </p>
        </div>

        <div></div>
      </div>

      <div className="auth-right">
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-icon">?</div>

          <h2>Forgot Password</h2>

          <p className="form-description">
            Enter your email to receive an OTP
          </p>

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
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            required
          />

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          <Link className="link" to="/login">
            Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;