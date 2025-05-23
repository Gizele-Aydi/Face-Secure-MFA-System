"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./header.module.css"
import ThemeToggle from "./theme-toggle"

export default function SharedHeader() {
  const pathname = usePathname()
  const isDashboard = pathname === "/dashboard"

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <path d="M8 12h8" />
              <path d="M12 8v8" />
            </svg>
          </span>
          <span className={styles.logoText}>FaceSecure</span>
        </Link>
        <div className={styles.headerRight}>
          <ThemeToggle />
          <nav className={styles.nav}>
            {isDashboard ? (
              <>
                <span className={styles.disabledLink}>Login</span>
                <span className={styles.disabledLink}>Sign Up</span>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.navLink}>
                  Login
                </Link>
                <Link href="/register" className={styles.navLink}>
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
