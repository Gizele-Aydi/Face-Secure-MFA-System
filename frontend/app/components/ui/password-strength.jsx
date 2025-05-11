"use client"

import { useState, useEffect } from "react"
import styles from "./password-strength.module.css"

export default function PasswordStrength({ password }) {
  const [strength, setStrength] = useState(0)
  const [label, setLabel] = useState("")

  useEffect(() => {
    if (!password) {
      setStrength(0)
      setLabel("")
      return
    }

    // Calculate password strength
    let score = 0

    // Length check
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1

    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    // Set strength level (0-4)
    const normalizedScore = Math.min(4, Math.floor(score / 1.5))
    setStrength(normalizedScore)

    // Set label
    const labels = ["Weak", "Fair", "Good", "Strong", "Very Strong"]
    setLabel(labels[normalizedScore])
  }, [password])

  if (!password) return null

  return (
    <div className={styles.container}>
      <div className={styles.bars}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`${styles.bar} ${i < strength ? styles[`strength${strength}`] : ""}`} />
        ))}
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  )
}
