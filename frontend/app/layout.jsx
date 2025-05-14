import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata = {
  title: "FaceSecure - Facial Recognition Authentication",
  description: "Secure your account with facial recognition technology",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <div className="page">{children}</div>
      </body>
    </html>
  )
}
