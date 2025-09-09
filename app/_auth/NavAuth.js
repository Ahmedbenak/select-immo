'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function NavAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setUser(sess?.user || null);
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  async function logout(){
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  if (!user) {
    return <a href="/login" className="px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:opacity-90">Se connecter</a>;
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-600">Bonjour</span>
      <button onClick={logout} className="px-3 py-1.5 rounded-lg border hover:bg-slate-50">Se déconnecter</button>
    </div>
  );
}
