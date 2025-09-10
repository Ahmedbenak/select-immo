'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // Si déjà connecté → redirige vers /publier et rafraîchit l'UI (Header)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        router.replace('/publier');
        router.refresh();
      }
    });
  }, [router]);

  async function onLogin(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);

    // IMPORTANT : force la mise à jour visuelle (Header) après login
    router.replace('/publier');
    router.refresh();
  }

  async function onRegister(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);

    // Selon ta config, un email de confirmation peut être requis.
    // On redirige quand même et on force un refresh : si la session n'existe pas encore,
    // la page /publier te renverra vers /login (guard), sinon tu es connecté.
    router.replace('/publier');
    router.refresh();
  }

  return (
    <section className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-bold mb-2">Se connecter</h1>
        <p className="text-sm text-slate-600 mb-4">Accède à la publication d’annonces.</p>

        {err && <p className="text-red-600 mb-3">{err}</p>}

        <form className="grid gap-3" onSubmit={onLogin}>
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            disabled={loading}
            className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:opacity-90 disabled:opacity-60"
            type="submit"
          >
            {loading ? '...' : 'Connexion'}
          </button>
        </form>

        {/* Nouveau bouton "Créer un compte" */}
        <div className="mt-4">
          <button
            onClick={onRegister}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-60"
            type="button"
          >
            Créer un compte
          </button>
        </div>
      </div>
    </section>
  );
}
