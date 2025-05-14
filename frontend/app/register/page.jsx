"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Header from "../../components/header"
import Button from "../../components/ui/button"
import FormInput from "../../components/ui/form-input"
import PasswordStrength from "../../components/ui/password-strength"
import styles from "./register.module.css"
import CaptchaForm from "../../components/CaptchaForm";


export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = "Username is required"
    }

    // Password validation - OWASP compliant
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else {
      // Check password requirements
      if (formData.password.length < 12) {
        newErrors.password = "Password must be at least 12 characters"
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = "Password must include at least one uppercase letter"
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = "Password must include at least one lowercase letter"
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = "Password must include at least one number"
      } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password)) {
        newErrors.password = "Password must include at least one special character"
      } else if (/\s/.test(formData.password)) {
        newErrors.password = "Password must not contain whitespace"
      }

      // Check for common passwords (abbreviated list)
      const commonPasswords = ["password", "123456", "qwerty", "admin", "welcome"]
      if (commonPasswords.includes(formData.password.toLowerCase())) {
        newErrors.password = "Password is too common and easily guessed"
      }
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    // Captcha Validation
    if (!captchaVerified) {
      newErrors.recaptcha = "Please verify that you are human";
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

    const handleSubmit = (e) => {
    e.preventDefault();

    if (!captchaVerified) {
      alert("Please verify that you are human");
      return;
    }

    if (validateForm()) {
      setIsSubmitting(true);

      // Store registration data globally for face capture step
      if (typeof window !== "undefined") {
        window.registerData = {
          email: formData.email,
          username: formData.username,
          password: formData.password,
        };
      }

      setIsSubmitting(false);
      router.push("/face-capture?mode=register");
    }
  };


  return (
    <>
      <Header />
      <main className="page-content">
        <div className="container">
          <div className={styles.formContainer}>
            <div className={styles.formCard}>
              <h1 className={styles.formTitle}>Create an Account</h1>
              <p className={styles.formSubtitle}>Join FaceSecure for enhanced login security with facial recognition</p>

               <form className={styles.form} onSubmit={handleSubmit}>
                <FormInput
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="your.email@example.com"
                  required
                  aria-required="true"
                />

                <FormInput
                  label="Username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  placeholder="Choose a username"
                  required
                  aria-required="true"
                />

                <FormInput
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Create a secure password"
                  required
                  aria-required="true"
                  aria-describedby="password-requirements"
                />

                <PasswordStrength password={formData.password} />

                <FormInput
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="Confirm your password"
                  required
                  aria-required="true"
                />
                
                 <CaptchaForm onSuccess={() => setCaptchaVerified(true)} />

                <Button type="submit" fullWidth disabled={isSubmitting}>
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
              <p className={styles.formFooter}>
                Already have an account? <a href="/login">Login</a>
              </p>
            </div>          </div>
        </div>
      </main>
    </>
  )
}