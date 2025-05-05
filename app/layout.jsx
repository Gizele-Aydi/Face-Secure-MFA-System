import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

export const metadata = {
  title: "FaceSecure - Facial Recognition Authentication",
  description: "Secure your account with facial recognition technology",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <div className="page">{children}</div>
      </body>
    </html>
  )
}
