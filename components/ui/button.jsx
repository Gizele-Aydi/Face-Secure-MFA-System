"use client"

import Link from "next/link"
import styles from "./button.module.css"

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  href,
  className = "",
  ...props
}) {
  const buttonClasses = `${styles.button} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.fullWidth : ""} ${className}`

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {children}
      </Link>
    )
  }

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  )
}
