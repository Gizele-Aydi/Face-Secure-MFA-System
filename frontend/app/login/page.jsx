"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Header from "../../components/header"
import Button from "../../components/ui/button"
import FormInput from "../../components/ui/form-input"
import CaptchaForm from "../components/CaptchaForm"
import styles from "./login.module.css"

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false);

  useEffect(() => {
    if (registered === "true") {
      setRegistrationSuccess(true)
    }
  }, [registered])

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

    // Captcha Validation
    if (!captchaVerified) {
      newErrors.recaptcha = "Please verify you are human";
      } 

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      // Store login credentials in memory (global variable)
      if (typeof window !== "undefined") {
        window.loginData = {
          email: formData.email,
          password: formData.password,
        }
      }

      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false)

        // Redirect to face verification
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

              {registrationSuccess && (
                <div className={styles.successMessage}>
                  <span className={styles.successIcon}>✓</span>
                  <p>Registration successful! Please log in with your credentials.</p>
                </div>
              )}

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
                  aria-required="true"
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
                  aria-required="true"
                />
              
                <CaptchaForm onSuccess={() => setCaptchaVerified(true)} />
                {errors.recaptcha && <p style={{ color: "red" }}>{errors.recaptcha}</p>}

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