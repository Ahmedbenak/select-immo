import "./globals.css";
import { Inter } from "next/font/google";
import NavAuth from "./_auth/NavAuth"; // ⬅️ import du composant client

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Select Immo CI",
  description: "Annonces immobilières en Côte d'Ivoire",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gradient-to-br from-slate-50 via-white to-sky-50 text-slate-900`}>
        <div className="min-h-dvh flex flex-col">
          <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <a href="/" className="font-bold text-lg">Select Immo CI</a>

              <nav className="flex items-center gap-3 text-sm">
                <a href="/" className="hover:underline">Accueil</a>
                <a href="/publier" className="px-3 py-1.5 rounded-lg border hover:bg-slate-50">Publier</a>

                {/* Au lieu du lien "Se connecter", on affiche NavAuth */}
                <NavAuth />
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t bg-white">
            <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-600">
              © {new Date().getFullYear()} Select Immo CI — Tous droits réservés.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
