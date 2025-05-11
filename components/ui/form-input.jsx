import { forwardRef } from "react"
import styles from "./form-input.module.css"

const FormInput = forwardRef(({ label, error, id, className = "", ...props }, ref) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-")

  // Check if error contains multiple messages (comma-separated)
  const errorMessages = error ? error.split(", ") : []
  const hasMultipleErrors = errorMessages.length > 1

  return (
    <div className={styles.formGroup}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`${styles.input} ${error ? styles.inputError : ""} ${className}`}
        {...props}
      />
      {error && !hasMultipleErrors && <p className={styles.errorMessage}>{error}</p>}
      {hasMultipleErrors && (
        <div className={styles.errorList}>
          <p className={styles.errorMessage}>Password requirements:</p>
          <ul className={styles.errorItems}>
            {errorMessages.map((msg, index) => (
              <li key={index} className={styles.errorItem}>
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
})

FormInput.displayName = "FormInput"

export default FormInput
