"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "../../components/header"
import Camera from "../../components/camera"
import Button from "../../components/ui/button"
import styles from "../../styles/modules/face-capture.module.css"

export default function FaceCapture() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") || "register"
  const [captureComplete, setCaptureComplete] = useState(false)

  const handleCapture = () => {
    setCaptureComplete(true)

    // Simulate processing
    setTimeout(() => {
      if (mode === "register") {
        // After registration, redirect to login page
        router.push("/login?registered=true")
      } else {
        // After login verification, redirect to dashboard
        router.push("/dashboard")
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
      <Header />
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
