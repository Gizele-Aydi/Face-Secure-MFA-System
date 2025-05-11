"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SharedHeader from "../../components/shared-header"
import FormInput from "../../components/ui/form-input"
import Button from "../../components/ui/button"
import PasswordStrength from "../../components/ui/password-strength"
import styles from "./register.module.css"

// Common passwords list (abbreviated for example)
const COMMON_PASSWORDS = [
  "password",
  "123456",
  "qwerty",
  "admin",
  "welcome",
  "letmein",
  "monkey",
  "abc123",
  "111111",
  "password123",
  "12345678",
  "sunshine",
  "princess",
  "football",
  "123123",
  "baseball",
  "dragon",
  "master",
  "superman",
  "trustno1",
]

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
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    }

    // Password validation - OWASP compliant
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else {
      // Collect all password errors
      const passwordErrors = []

      if (formData.password.length < 12) {
        passwordErrors.push("Must be at least 12 characters")
      }

      if (!/[A-Z]/.test(formData.password)) {
        passwordErrors.push("Must include at least one uppercase letter")
      }

      if (!/[a-z]/.test(formData.password)) {
        passwordErrors.push("Must include at least one lowercase letter")
      }

      if (!/[0-9]/.test(formData.password)) {
        passwordErrors.push("Must include at least one number")
      }

      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password)) {
        passwordErrors.push("Must include at least one special character")
      }

      if (/\s/.test(formData.password)) {
        passwordErrors.push("Must not contain whitespace")
      }

      // Check for common passwords
      if (COMMON_PASSWORDS.includes(formData.password.toLowerCase())) {
        passwordErrors.push("Password is too common and easily guessed")
      }

      // If there are any password errors, join them with line breaks
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors.join(", ")
      }
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false)

        // Store user data in memory (global variable)
        if (typeof window !== "undefined") {
          window.userData = {
            email: formData.email,
            username: formData.username,
          }
        }

        // Redirect to face capture after successful registration
        router.push("/face-capture?mode=register")
      }, 1000)
    }
  }

  return (
    <>
      <SharedHeader />
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
                  placeholder="Min. 12 chars with letters, numbers & symbols"
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

                <Button type="submit" fullWidth disabled={isSubmitting}>
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <p className={styles.formFooter}>
                Already have an account? <a href="/login">Login</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
