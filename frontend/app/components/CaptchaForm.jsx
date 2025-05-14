"use client";
import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export default function CaptchaForm({ onSuccess }) {
  const recaptchaRef = useRef();
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);

  const handleCaptchaChange = (token) => {
    console.log("CAPTCHA token received:", token);
    const isValid = !!token;
    setVerified(isValid);
    if (isValid) onSuccess();
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = recaptchaRef.current.getValue();
    console.log("Submitting CAPTCHA token to backend:", token);

    if (!token) {
      console.warn("No CAPTCHA token — user didn't complete the CAPTCHA");
      return setError("Please complete the CAPTCHA");
    }

    try {
      const res = await fetch("http://localhost:8000/verify-captcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (data.success) {
        console.log("CAPTCHA verified successfully!");
        onSuccess(); // notify parent
      } else {
        console.warn("CAPTCHA verification failed");
        setError("CAPTCHA verification failed");
      }
    } catch (err) {
      console.error("Error during CAPTCHA verification:", err);
      setError("An error occurred while verifying CAPTCHA");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded space-y-4">
      <ReCAPTCHA
        sitekey="6LdnajcrAAAAAN8VHIpP9tqJU9a6b5JLVx4sjUx7"
        ref={recaptchaRef}
        onChange={handleCaptchaChange}
      />
      {!verified && error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </form>
  );
}