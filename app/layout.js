import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/Header"; // 👈 ton header global

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Select Immo CI",
  description: "Annonces immobilières en Côte d'Ivoire",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <div className="min-h-dvh flex flex-col">
          {/* Header global */}
          <Header />

          {/* Contenu */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t bg-gray-100">
            <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-600">
              © {new Date().getFullYear()} Select Immo CI — Tous droits réservés.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
