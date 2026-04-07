// ============================================================
// FICHIER  : src/pages/auth/ForgotPasswordPage.jsx
// RÔLE     : Page "Mot de passe oublié".
//            Envoie un email de réinitialisation via POST /auth/forgot-password
// ============================================================

import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPassword } from '../../services/authService';
import { LanguageContext } from '../../context/LanguageContext';
import Input  from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function ForgotPasswordPage() {
  const { lang } = useContext(LanguageContext);
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.userMessage || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>🔑</div>
          <h1 style={s.title}>
            {lang === 'fr' ? 'Mot de passe oublié' : 'Forgot password'}
          </h1>
          <p style={s.sub}>
            {lang === 'fr'
              ? 'Entrez votre email pour recevoir un lien de réinitialisation.'
              : 'Enter your email to receive a reset link.'}
          </p>
        </div>

        {sent ? (
          <div style={s.successBox}>
            <p style={{ fontSize:'14px', color:'var(--clr-success)', textAlign:'center', lineHeight:1.6 }}>
              ✅ {lang === 'fr'
                ? 'Si un compte existe avec cet email, vous recevrez un lien sous peu.'
                : 'If an account exists with this email, you will receive a link shortly.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:'18px' }}>
              <Input
                label="Email"
                type="email"
                icon="📧"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="miora@exemple.mg"
                required
              />
            </div>
            <Button type="submit" fullWidth size="lg" loading={loading}>
              {lang === 'fr' ? 'Envoyer le lien' : 'Send reset link'}
            </Button>
          </form>
        )}

        <div style={{ textAlign:'center', marginTop:'20px' }}>
          <Link to="/login" style={{ color:'var(--clr-rose)', fontSize:'13px', fontWeight:600 }}>
            ← {lang === 'fr' ? 'Retour à la connexion' : 'Back to login'}
          </Link>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', background:'linear-gradient(135deg,var(--clr-plum),var(--clr-rose-deep))', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' },
  card: { background:'var(--clr-surface)', borderRadius:'var(--r-2xl)', padding:'40px 36px', width:'100%', maxWidth:'400px', boxShadow:'var(--shadow-lg)' },
  title: { fontFamily:'var(--font-display)', fontSize:'24px', fontWeight:600, color:'var(--clr-plum)' },
  sub: { fontSize:'13px', color:'var(--clr-text-muted)', marginTop:'6px', lineHeight:1.5 },
  successBox: { background:'var(--clr-success-bg)', borderRadius:'var(--r-md)', padding:'20px' },
};