import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Select Immo CI",
  description: "Annonces immobilières en Côte d'Ivoire",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="h-full">
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 text-slate-900 antialiased`}
      >
        {/* --- Fond dégradé (Option A activée) --- */}
        <div className="fixed inset-0 -z-10 pointer-events-none" />

        {/* --- Option B (facultative) : image de fond légère ---
            1) Place ton image dans /public/bg-abstract.png
            2) Décommente ce bloc
        */}
        {/*
        <div className="fixed inset-0 -z-10 bg-[url('/bg-abstract.png')] bg-fixed bg-cover bg-no-repeat opacity-90 pointer-events-none" />
        */}

        <div className="min-h-dvh flex flex-col">
          {/* Header global */}
          <Header />

          {/* Contenu */}
          <main className="flex-1">
            <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
          </main>

          {/* Footer clair et lisible */}
          <footer className="border-t bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-600">
              © {new Date().getFullYear()} Select Immo CI — Tous droits réservés.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
