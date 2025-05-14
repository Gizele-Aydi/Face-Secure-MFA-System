"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./camera.module.css"
import Button from "./ui/button"

export default function Camera({ onCapture, mode, disabled, verificationStatus }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureComplete, setCaptureComplete] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [internalCaptureComplete, setInternalCaptureComplete] = useState(false)

  // Function to initialize the camera
  const initializeCamera = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // First, check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser")
      }

      // List available devices for debugging
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      console.log("Available video devices:", videoDevices)

      // Try to get the rear camera first
      let cameraStream = null

      try {
        // Try rear camera first
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        console.log("Rear camera accessed successfully")
      } catch (err) {
        console.log("Could not access rear camera, trying front camera:", err)

        try {
          // Fall back to front camera
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          })
          console.log("Front camera accessed successfully")
        } catch (frontErr) {
          throw frontErr // Re-throw if front camera also fails
        }
      }

      // If we got a stream, set it
      if (cameraStream) {
        setStream(cameraStream)

        // Wait for the next render cycle before setting the video source
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = cameraStream
            console.log("Stream attached to video element")
          } else {
            console.error("Video element not available when setting stream")
            throw new Error("Video element not available")
          }
        }, 0)
      } else {
        throw new Error("Could not initialize camera stream")
      }

      setIsLoading(false)
    } catch (err) {
      console.error("Camera initialization error:", err)
      setError(`Camera error: ${err.message || "Unknown error"}`)
      setIsLoading(false)
    }
  }

  // Handle video element events
  const handleVideoCanPlay = () => {
    console.log("Video can play now")
    setCameraReady(true)
    setIsLoading(false)
  }

  const handleVideoError = (e) => {
    console.error("Video element error:", e)
    setError("Error displaying video feed. Please refresh and try again.")
    setIsLoading(false)
  }

  // Capture image from video
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas ref not available for capture")
      return null
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to data URL
    return canvas.toDataURL("image/png")
  }

  // Handle capture button click
  const handleCapture = () => {
    if (!cameraReady) {
      setError("Camera is not ready yet. Please wait.")
      return
    }

    setIsCapturing(true)
    setCountdown(3) // Start 3-second countdown

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(countdownInterval)

          // Capture the image
          const imageData = captureImage()

          // Complete the capture process
          setIsCapturing(false)
          setInternalCaptureComplete(true) // Use internal state for UI
          setCaptureComplete(true) // This is for the parent component

          // Notify parent component after a short delay
          setTimeout(() => {
            onCapture(imageData)
          }, 500)

          return null
        }
        return prevCount - 1
      })
    }, 1000)
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return (
    <div className={styles.container}>
      <div className={styles.cameraContainer}>
        {/* Always render the video element */}
        <div
          className={`${styles.videoContainer} ${isCapturing ? styles.capturing : ""} ${internalCaptureComplete ? styles.complete : ""}`}
        >
          <video
            ref={videoRef}
            className={styles.video}
            autoPlay
            playsInline
            muted
            onCanPlay={handleVideoCanPlay}
            onError={handleVideoError}
          />

          {/* Hidden canvas for capturing images */}
          <canvas ref={canvasRef} className={styles.hiddenCanvas} />

          {isCapturing && (
            <div className={styles.countdownOverlay}>
              <div className={styles.countdown}>{countdown}</div>
            </div>
          )}

          {/* Verification status overlays - only show after capture is complete */}
          {internalCaptureComplete && (
            <>
              {/* Processing overlay */}
              {verificationStatus === "processing" && (
                <div className={styles.processingOverlay}>
                  <div className={styles.processingSpinner}></div>
                  <span className={styles.processingText}>Verifying...</span>
                </div>
              )}

              {/* Success overlay - only show when verification is successful */}
              {verificationStatus === "success" && (
                <div className={styles.successOverlay}>
                  <span className={styles.successIcon}>✓</span>
                </div>
              )}

              {/* Error overlay - show when verification fails */}
              {verificationStatus === "error" && (
                <div className={styles.errorOverlay}>
                  <span className={styles.errorIcon}>✕</span>
                </div>
              )}
            </>
          )}

          {/* Oval face guide - only show when camera is ready and not after capture */}
          {cameraReady && !internalCaptureComplete && <div className={styles.faceGuideOval}></div>}
        </div>

        {/* Status indicators and controls */}
        <div className={styles.controls}>
          {isLoading && (
            <div className={styles.statusIndicator}>
              <div className={styles.spinner}></div>
              <p>Initializing camera...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorIndicator}>
              <span className={styles.errorIcon}>⚠️</span>
              <p>{error}</p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          )}

          {!stream && !isLoading && !error && (
            <div className={styles.startPrompt}>
              <p>Camera access is required for facial recognition</p>
              <Button variant="primary" onClick={initializeCamera}>
                Start Camera
              </Button>
            </div>
          )}

          {cameraReady && !isCapturing && !internalCaptureComplete && (
            <div className={styles.captureControls}>
              <ul className={styles.instructionsList}>
                <li>Position your face inside the oval</li>
                <li>Keep still during the capture</li>
                <li>Ensure good lighting on your face</li>
              </ul>
              <Button variant="primary" onClick={handleCapture} disabled={disabled}>
                {mode === "register" ? "Capture Face" : "Verify Face"}
              </Button>
            </div>
          )}

          {isCapturing && <p className={styles.captureStatus}>Please hold still... Capturing in {countdown} seconds</p>}

          {internalCaptureComplete && verificationStatus === "processing" && (
            <p className={styles.processingText}>Verifying your identity...</p>
          )}

          {internalCaptureComplete && verificationStatus === "success" && (
            <p className={styles.successText}>
              {mode === "register" ? "Face registered successfully!" : "Face verified successfully!"}
            </p>
          )}

          {internalCaptureComplete && verificationStatus === "error" && (
            <p className={styles.errorText}>Face verification failed. Please try again.</p>
          )}
        </div>
      </div>
    </div>
  )
}
