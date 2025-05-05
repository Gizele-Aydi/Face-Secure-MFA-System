import { forwardRef } from "react"
import styles from "./form-input.module.css"

const FormInput = forwardRef(({ label, error, id, className = "", ...props }, ref) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-")

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
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  )
})

FormInput.displayName = "FormInput"

export default FormInput
