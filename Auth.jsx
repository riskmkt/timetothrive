import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLogin();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Se a confirmação de email estiver ativada, a sessão virá nula
        if (data?.user && !data?.session) {
          setErrorMsg('🎉 ¡Cuenta creada con éxito! Revisa tu bandeja de entrada para confirmar el correo electrónico.');
          return;
        }
        onLogin();
      }
    } catch (error) {
      setErrorMsg(error.message || 'Ocurrió un error en la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      setErrorMsg(error.message || 'Error al conectar con el proveedor. Verifica la configuración de OAuth en Supabase.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background elements */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(15, 22, 42, 0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '2.5rem',
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', color: 'white', marginBottom: '1rem' }}>
            <span style={{ fontSize: '24px' }}>👑</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>
            {isLogin ? 'Bienvenido de nuevo' : 'Comienza tu viaje'}
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
            {isLogin ? 'Inicia sesión para acceder a tus entrenamientos.' : 'Crea tu cuenta para acceder a la plataforma.'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '0.5rem' }}>Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text3)' }}>
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  padding: '0.85rem 1rem 0.85rem 2.75rem',
                  color: 'white',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: '0.2s'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '0.5rem' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text3)' }}>
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  padding: '0.85rem 1rem 0.85rem 2.75rem',
                  color: 'white',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: '0.2s'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn--primary"
            style={{ marginTop: '0.5rem', padding: '0.85rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
          >
            {loading ? 'Espera...' : (isLogin ? 'Entrar' : 'Crear Cuenta')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ padding: '0 1rem', fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>O continuar con</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.85rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text)',
              cursor: 'pointer',
              transition: '0.2s',
              fontWeight: 500,
              fontSize: '0.9rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text2)' }}>
          {isLogin ? '¿Aún no tienes cuenta? ' : '¿Ya tienes una cuenta? '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
          >
            {isLogin ? 'Regístrate' : 'Iniciar Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
