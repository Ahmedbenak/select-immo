'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [err,setErr] = useState('');
  const [loading,setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push('/publier'); // déjà connecté
    });
  }, [router]);

  async function onLogin(e){
    e.preventDefault();
    setErr(''); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    router.push('/publier');
  }

  async function onRegister(e){
    e.preventDefault();
    setErr(''); setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    alert('Compte créé. Vérifie tes emails si la confirmation est activée, puis connecte-toi.');
  }

  return (
    <section className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-bold mb-2">Se connecter</h1>
        <p className="text-sm text-slate-600 mb-4">Accède à la publication d’annonces.</p>

        {err && <p className="text-red-600 mb-3">{err}</p>}

        <form className="grid gap-3" onSubmit={onLogin}>
          <input className="border rounded-lg px-3 py-2" placeholder="Email"
                 type="email" onChange={e=>setEmail(e.target.value)} />
          <input className="border rounded-lg px-3 py-2" placeholder="Mot de passe"
                 type="password" onChange={e=>setPassword(e.target.value)} />
          <button disabled={loading} className="px-3 py-2 rounded-lg bg-slate-900 text-white">
            {loading ? '...' : 'Connexion'}
          </button>
        </form>

        <div className="mt-4 text-sm">
          <button onClick={onRegister} className="underline">Créer un compte</button>
        </div>
      </div>
    </section>
  );
}
