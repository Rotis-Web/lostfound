import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";
import { AuthProvider } from "@/context/AuthContext";
import { PostsProvider } from "@/context/PostsContext";
import { SearchProvider } from "@/context/SearchContext";
import Header from "./components/Layout/Header/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./toast.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional",
  fallback: ["sans-serif", "system-ui", "ui-sans-serif"],
  weight: ["400", "500", "600", "700", "800", "900"],
  preload: true,
  adjustFontFallback: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "optional",
  fallback: ["sans-serif", "system-ui", "ui-sans-serif"],
  weight: ["400", "500", "600", "700", "800", "900"],
  preload: true,
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Lost & Found",
  description:
    "Singura platforma din Romania dedicata animalelor si obiectelor pierdute sau gasite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <PostsProvider>
            <SearchProvider>
              <Header />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                style={{ marginTop: "70px" }}
              />
              {children}
            </SearchProvider>
          </PostsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
