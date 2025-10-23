import { useState } from 'react';
import { User, LogIn, LogOut } from 'lucide-react';

export default function AuthPanel({ user, onLogin, onLogout }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!email) return;
    onLogin({ email, role: email.includes('admin') ? 'admin' : 'user' });
    setPassword('');
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-md px-3 py-2">
          <User size={16} />
          <span className="text-sm">{user.email}</span>
          <span className="text-xs text-neutral-400">({user.role})</span>
        </div>
        <button onClick={onLogout} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 transition">
          <LogOut size={16} /> Logout
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-md p-3">
      <div className="flex gap-2 mb-2">
        <button onClick={() => setTab('login')} className={`px-2 py-1 rounded ${tab==='login' ? 'bg-white/15' : 'hover:bg-white/10'}`}>Login</button>
        <button onClick={() => setTab('signup')} className={`px-2 py-1 rounded ${tab==='signup' ? 'bg-white/15' : 'hover:bg-white/10'}`}>Signup</button>
      </div>
      <form onSubmit={submit} className="flex items-center gap-2">
        <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required placeholder="email" className="bg-transparent border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-white/20" />
        <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required placeholder={tab==='login'? 'password' : 'create password'} className="bg-transparent border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-white/20" />
        <button type="submit" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 transition">
          <LogIn size={16} /> {tab==='login'? 'Login' : 'Create'}
        </button>
      </form>
    </div>
  );
}
