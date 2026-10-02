import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const empty = { identifier: '', username: '', email: '', password: '' };

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const isLogin = mode === 'login';

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (isLogin) {
      if (!form.identifier.trim()) e.identifier = 'Enter your email or username';
    } else {
      if (form.username.trim().length < 3) e.username = 'Username must be at least 3 characters';
      if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    }
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      if (isLogin) await login(form.identifier, form.password);
      else await register({ username: form.username, email: form.email, password: form.password });
      navigate('/'); // redirect to the task page
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const handleGoogleLogin = () => {
    window.location.href = "https://task-frontend-gyqw.onrender.com/api/auth/google";
  };
  const field = (name, label, type = 'text', auto) => (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} value={form[name]} onChange={set} autoComplete={auto} aria-invalid={!!errors[name]} />
      {errors[name] && <small className="error-text">{errors[name]}</small>}
    </label>
  );

  return (
    <main className="auth">
      <section className="auth-card">
        <h1>TaskDesk</h1>
        <p className="muted">{isLogin ? 'Sign in to see your tasks.' : 'Create an account to start planning.'}</p>
        {serverError && <div className="notice error" role="alert">{serverError}</div>}
        <form onSubmit={submit} noValidate>
          {isLogin ? field('identifier', 'Email or username', 'text', 'username') : (
            <>
              {field('username', 'Username', 'text', 'username')}
              {field('email', 'Email', 'email', 'email')}
            </>
          )}
          {field('password', 'Password', 'password', isLogin ? 'current-password' : 'new-password')}
          <button className="btn primary block" disabled={busy}>
            {busy ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <button className="link" onClick={() => { setMode(isLogin ? 'register' : 'login'); setErrors({}); setServerError(''); }}>
          {isLogin ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </button>
        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleLogin}
        >
          <span>G</span>
          Sign in with Google
        </button>
      </section>
    </main>
  );
}
