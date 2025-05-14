"use client";
import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export default function CaptchaForm({ onSuccess }) {
  const recaptchaRef = useRef();
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);

  const handleCaptchaChange = (token) => {
    setVerified(!!token);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = recaptchaRef.current.getValue();
    if (!token) return setError("Please complete the CAPTCHA");

    const res = await fetch("http://localhost:5000/verify-captcha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    if (data.success) {
      onSuccess(); // tell the parent component it’s good
    } else {
      setError("CAPTCHA verification failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded space-y-4">
      <ReCAPTCHA
        sitekey="6LdnajcrAAAAAN8VHIpP9tqJU9a6b5JLVx4sjUx7"
        ref={recaptchaRef}
        onChange={handleCaptchaChange}
      />
      {error && <p className="text-red-500">{error}</p>}
      
      
    </form>
  );
}
