"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "../components/header"
import FormInput from "../components/ui/form-input"
import Button from "../components/ui/button"
import styles from "./login.module.css"

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
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

        // For demo purposes, we'll just redirect to face verification
        // In a real app, you would verify credentials first
        router.push("/face-capture?mode=login")
      }, 1000)
    }
  }

  return (
    <>
      <Header />
      <main className="page-content">
        <div className="container">
          <div className={styles.formContainer}>
            <div className={styles.formCard}>
              <h1 className={styles.formTitle}>Welcome Back</h1>
              <p className={styles.formSubtitle}>Log in to your account with your credentials</p>

              <form className={styles.form} onSubmit={handleSubmit}>
                <FormInput
                  label="Email or Username"
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="your.email@example.com"
                  required
                />

                <FormInput
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Enter your password"
                  required
                />

                <div className={styles.forgotPassword}>
                  <a href="#">Forgot password?</a>
                </div>

                <Button type="submit" fullWidth disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </form>

              <p className={styles.formFooter}>
                Don't have an account? <a href="/register">Sign up</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
