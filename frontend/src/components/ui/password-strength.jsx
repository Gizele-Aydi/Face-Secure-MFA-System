"use client"

import { useState, useEffect } from "react"
import styles from "../../styles/modules/password-strength.module.css"

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
    const hasLength = password.length >= 12
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

    // Calculate strength score (0-7)
    let score = 0
    if (hasLength) score++
    if (hasUppercase) score++
    if (hasLowercase) score++
    if (hasNumber) score++
    if (hasSpecial) score++
    if (isNotCommon) score++
    if (hasNoWhitespace) score++

    // Set strength level (0-3)
    let strengthLevel = 0
    if (score >= 7)
      strengthLevel = 3 // All requirements met
    else if (score >= 5)
      strengthLevel = 2 // Most requirements met
    else if (score >= 3)
      strengthLevel = 1 // Some requirements met
    else strengthLevel = 0 // Few requirements met

    setStrength(strengthLevel)

    // Set label
    const labels = ["Weak", "Medium", "Strong", "Very Strong"]
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
