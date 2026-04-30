import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "VTube — Watch, Upload, Connect",
  description: "VTube is a video sharing platform. Upload videos, subscribe to channels, like and comment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="app-shell">
            <Navbar />
            <div className="main-content">
              <Sidebar />
              <main className="page-content">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
