"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import SharedHeader from "../../components/shared-header"
import Camera from "../../components/camera"
import Button from "../../components/ui/button"
import styles from "./face-capture.module.css"

// In-memory storage for face images
const faceImageStore = {
  register: null,
  login: null,
}

export default function FaceCapture() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") || "register"
  const [captureComplete, setCaptureComplete] = useState(false)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    // Check if we have user data for the appropriate mode
    if (typeof window !== "undefined") {
      if (mode === "register" && !window.userData) {
        // If no registration data, redirect back to register
        router.push("/register")
      } else if (mode === "login" && !window.loginData) {
        // If no login data, redirect back to login
        router.push("/login")
      }

      // Set user data from window object
      if (mode === "register") {
        setUserData(window.userData)
      } else {
        setUserData(window.loginData)
      }
    }
  }, [mode, router])

  // Update the handleCapture function to accept a success parameter
  const handleCapture = (imageData, isSuccess) => {
    // Store the image in our in-memory object
    if (imageData) {
      faceImageStore[mode] = imageData
    }

    setCaptureComplete(true)

    // Simulate processing
    setTimeout(() => {
      if (mode === "register") {
        // After registration, redirect to login page
        router.push("/login?registered=true")
      } else {
        // For login mode, check if verification was successful
        if (isSuccess) {
          // Set authentication flag and redirect to dashboard
          if (typeof window !== "undefined") {
            window.isAuthenticated = true
            window.authenticatedUser = window.userData || {
              username: window.loginData?.email?.split("@")[0] || "User",
              email: window.loginData?.email || "user@example.com",
            }
          }
          router.push("/dashboard")
        } else {
          // If verification failed, redirect back to login
          router.push("/login?verification=failed")
        }
      }
    }, 1000)
  }

  const pageTitle = mode === "register" ? "Register Your Face" : "Verify Your Identity"

  const pageDescription =
    mode === "register"
      ? "We'll use your facial features to secure your account"
      : "Look at the camera to verify your identity"

  return (
    <>
      <SharedHeader />
      <main className="page-content">
        <div className="container">
          <div className={styles.captureContainer}>
            <div className={styles.captureCard}>
              <h1 className={styles.captureTitle}>{pageTitle}</h1>
              <p className={styles.captureSubtitle}>{pageDescription}</p>

              <Camera onCapture={handleCapture} mode={mode} />

              <div className={styles.captureActions}>
                <Button
                  variant="outline"
                  href={mode === "register" ? "/register" : "/login"}
                  disabled={captureComplete}
                >
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
