"use client"

import { useState, useRef, useEffect } from "react"
import styles from "./camera.module.css"
import Button from "./ui/button"

export default function Camera({ onCapture, mode }) {
  const videoRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureComplete, setCaptureComplete] = useState(false)

  useEffect(() => {
    let stream = null

    async function setupCamera() {
      try {
        setIsLoading(true)
        setError(null)

        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        })

        // Set video source
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error accessing camera:", err)
        setError("Could not access camera. Please ensure you have granted camera permissions.")
        setIsLoading(false)
      }
    }

    setupCamera()

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const handleCapture = () => {
    setIsCapturing(true)

    // Simulate face detection process
    setTimeout(() => {
      setIsCapturing(false)
      setCaptureComplete(true)

      // Notify parent component
      setTimeout(() => {
        onCapture()
      }, 1000)
    }, 3000)
  }

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Initializing camera...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>⚠️</span>
          <p>{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div
            className={`${styles.videoContainer} ${isCapturing ? styles.capturing : ""} ${captureComplete ? styles.complete : ""}`}
          >
            <video ref={videoRef} className={styles.video} autoPlay playsInline muted />

            {isCapturing && (
              <div className={styles.scanOverlay}>
                <div className={styles.scanLine}></div>
              </div>
            )}

            {captureComplete && (
              <div className={styles.successOverlay}>
                <span className={styles.successIcon}>✓</span>
              </div>
            )}

            <div className={styles.faceGuide}></div>
          </div>

          <div className={styles.instructions}>
            {!isCapturing && !captureComplete && (
              <>
                <p>
                  {mode === "register"
                    ? "Position your face in the center for registration"
                    : "Look directly at the camera for verification"}
                </p>
                <Button variant="primary" onClick={handleCapture} disabled={isCapturing}>
                  {mode === "register" ? "Capture Face" : "Verify Face"}
                </Button>
              </>
            )}

            {isCapturing && <p>Please hold still... Analyzing your face</p>}

            {captureComplete && (
              <p className={styles.successText}>
                {mode === "register" ? "Face registered successfully!" : "Face verified successfully!"}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
