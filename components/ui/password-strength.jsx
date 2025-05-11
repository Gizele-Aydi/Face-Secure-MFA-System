"use client"

import { useState, useEffect } from "react"
import styles from "./password-strength.module.css"

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

export default function PasswordStrength({ password }) {
  const [strength, setStrength] = useState(0)
  const [label, setLabel] = useState("")
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    noCommon: true,
    noWhitespace: true,
  })

  useEffect(() => {
    if (!password) {
      setStrength(0)
      setLabel("")
      setRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        noCommon: true,
        noWhitespace: true,
      })
      return
    }

    // Check requirements
    const hasLength = password.length >= 12 // Updated to 12 characters
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    const hasNoWhitespace = !/\s/.test(password)
    const isNotCommon = !COMMON_PASSWORDS.includes(password.toLowerCase())

    // Update requirements state
    setRequirements({
      length: hasLength,
      uppercase: hasUppercase,
      lowercase: hasLowercase,
      number: hasNumber,
      special: hasSpecial,
      noCommon: isNotCommon,
      noWhitespace: hasNoWhitespace,
    })

    // Count criteria met (excluding common password check)
    let criteriaMet = 0
    if (hasLength) criteriaMet++
    if (hasUppercase) criteriaMet++
    if (hasLowercase) criteriaMet++
    if (hasNumber) criteriaMet++
    if (hasSpecial) criteriaMet++

    // Set strength level based on criteria met
    let strengthLevel = 0
    if (criteriaMet >= 5) {
      strengthLevel = 3 // Strong: All 5 criteria met
    } else if (criteriaMet >= 3) {
      strengthLevel = 2 // Medium: 3-4 criteria met
    } else if (criteriaMet >= 1) {
      strengthLevel = 1 // Weak: 1-2 criteria met
    } else {
      strengthLevel = 0 // Very Weak: No criteria met
    }

    // Downgrade strength if it's a common password or has whitespace
    if (!isNotCommon || !hasNoWhitespace) {
      strengthLevel = Math.max(0, strengthLevel - 1)
    }

    setStrength(strengthLevel)

    // Set label
    const labels = ["Very Weak", "Weak", "Medium", "Strong"]
    setLabel(labels[strengthLevel])
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

      <div className={styles.requirements}>
        <div className={`${styles.requirement} ${requirements.length ? styles.met : styles.unmet}`}>
          <span className={styles.icon}>{requirements.length ? "✓" : "✗"}</span>
          <span>At least 12 characters</span>
        </div>
        <div className={`${styles.requirement} ${requirements.uppercase ? styles.met : styles.unmet}`}>
          <span className={styles.icon}>{requirements.uppercase ? "✓" : "✗"}</span>
          <span>At least one uppercase letter</span>
        </div>
        <div className={`${styles.requirement} ${requirements.lowercase ? styles.met : styles.unmet}`}>
          <span className={styles.icon}>{requirements.lowercase ? "✓" : "✗"}</span>
          <span>At least one lowercase letter</span>
        </div>
        <div className={`${styles.requirement} ${requirements.number ? styles.met : styles.unmet}`}>
          <span className={styles.icon}>{requirements.number ? "✓" : "✗"}</span>
          <span>At least one number</span>
        </div>
        <div className={`${styles.requirement} ${requirements.special ? styles.met : styles.unmet}`}>
          <span className={styles.icon}>{requirements.special ? "✓" : "✗"}</span>
          <span>At least one special character</span>
        </div>
        <div className={`${styles.requirement} ${requirements.noCommon ? styles.met : styles.unmet}`}>
          <span className={styles.icon}>{requirements.noCommon ? "✓" : "✗"}</span>
          <span>Not a common password</span>
        </div>
        <div className={`${styles.requirement} ${requirements.noWhitespace ? styles.met : styles.unmet}`}>
          <span className={styles.icon}>{requirements.noWhitespace ? "✓" : "✗"}</span>
          <span>No whitespace</span>
        </div>
      </div>
    </div>
  )
}
