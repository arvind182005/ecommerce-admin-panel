import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function OTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    
    const savedEmail = sessionStorage.getItem("resetEmail");
    if (!savedEmail) {
     
      navigate("/forgot-password");
    } else {
      setEmail(savedEmail);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (otp.trim().length !== 6) {
      setErrorMessage("Please Fill 6 digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://ecommerce-backend-api-2r29.onrender.com/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
      
        navigate("/reset-password");
      } else {
        setErrorMessage(data.message || "Invalid OTP!");
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      setErrorMessage("Backend server se connect nahi ho pa raha hai.");
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
            Verify
            <br />
            Your Account
          </h1>

          <p>
            Enter the OTP sent to your email to continue.
          </p>
        </div>

        <div></div>
      </div>

      <div className="auth-right">
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-icon">✓</div>

          <h2>Verify OTP</h2>

          <p className="form-description">
            Enter the 6-digit OTP sent to {email ? <b>{email}</b> : "your email"}
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
            type="text"
            maxLength="6"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            required
          />

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <p className="bottom-text">
            Didn't receive code?{" "}
            <Link to="/forgot-password">Resend OTP</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default OTP;