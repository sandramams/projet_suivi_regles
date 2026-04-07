// ============================================================
// FICHIER  : src/pages/auth/LoginPage.jsx
// RÔLE     : Page de connexion.
//            - Formulaire email + mot de passe avec validation Formik/Yup
//            - Appel à l'API backend POST /auth/login
//            - Redirection vers /dashboard après connexion
//            - Lien vers /register et /forgot-password
// ============================================================

import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

import { useAuth }          from '../../hooks/useAuth';
import { LanguageContext }  from '../../context/LanguageContext';
import Input                from '../../components/ui/Input';
import Button               from '../../components/ui/Button';

// Schéma de validation Yup
const LoginSchema = Yup.object({
  email: Yup.string()
    .email('Format d\'email invalide')
    .required('L\'email est requis'),
  password: Yup.string()
    .min(8, 'Minimum 8 caractères')
    .required('Le mot de passe est requis'),
});

export default function LoginPage() {
  const { login }          = useAuth();
  const { t, lang, changeLang } = useContext(LanguageContext);
  const navigate           = useNavigate();
  const location           = useLocation();
  const [showPwd, setShowPwd] = useState(false);

  // URL de redirection après login (si l'utilisateur a été redirigé depuis une route protégée)
  const from = location.state?.from?.pathname || '/dashboard';

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await login(values);
        toast.success(lang === 'fr' ? 'Connexion réussie ! 🌸' : 'Login successful! 🌸');
        navigate(from, { replace: true });
      } catch (err) {
        toast.error(err.userMessage || 'Email ou mot de passe incorrect.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div style={s.page}>
      {/* Décorations de fond */}
      <div style={{ ...s.deco, width: '400px', height: '400px', top: '-120px', right: '-100px' }} />
      <div style={{ ...s.deco, width: '260px', height: '260px', bottom: '-60px', left: '-60px' }} />

      <div style={s.card}>
        {/* ── LOGO ── */}
        <div style={s.logoArea}>
          <div style={s.logoPetal}>🌸</div>
          <h1 style={s.appName}>CycleTracker</h1>
          <p style={s.appSub}>
            {lang === 'fr'
              ? 'Votre compagnon de cycle menstruel'
              : 'Your menstrual cycle companion'}
          </p>
        </div>

        {/* ── ONGLETS Login / Register ── */}
        <div style={s.tabs}>
          <Link to="/login" style={{ ...s.tab, ...s.tabActive }}>
            {lang === 'fr' ? 'Connexion' : 'Login'}
          </Link>
          <Link to="/register" style={s.tab}>
            {lang === 'fr' ? 'Inscription' : 'Register'}
          </Link>
        </div>

        {/* ── FORMULAIRE ── */}
        <form onSubmit={formik.handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <Input
              label={t('email')}
              type="email"
              icon="📧"
              placeholder="miora@exemple.mg"
              {...formik.getFieldProps('email')}
              error={formik.touched.email && formik.errors.email}
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <Input
              label={t('password')}
              type={showPwd ? 'text' : 'password'}
              icon="🔒"
              iconRight={
                <span
                  onClick={() => setShowPwd(p => !p)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  {showPwd ? '🙈' : '👁️'}
                </span>
              }
              placeholder="••••••••"
              {...formik.getFieldProps('password')}
              error={formik.touched.password && formik.errors.password}
            />
          </div>

          {/* Mot de passe oublié */}
          <div style={{ textAlign: 'right', marginBottom: '22px' }}>
            <Link to="/forgot-password" style={s.forgotLink}>
              {t('forgot_pwd')}
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={formik.isSubmitting}
          >
            {t('login_btn')}
          </Button>
        </form>

        {/* ── PIED DE CARTE ── */}
        <div style={s.footer}>
          <p style={s.footerText}>
            {t('no_account')}{' '}
            <Link to="/register" style={s.footerLink}>{t('register_btn')}</Link>
          </p>

          {/* Toggle langue */}
          <div style={s.langRow}>
            {['fr', 'en'].map(l => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                style={{
                  ...s.langBtn,
                  ...(lang === l ? s.langBtnActive : {}),
                }}
              >
                {l === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STYLES ──────────────────────────────────────────────────
const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg,var(--clr-plum) 0%,var(--clr-rose-deep) 60%,#C2185B 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
    position: 'relative', overflow: 'hidden',
  },
  deco: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255,255,255,.05)',
    pointerEvents: 'none',
  },
  card: {
    background: 'var(--clr-surface)',
    borderRadius: 'var(--r-2xl)',
    padding: '40px 36px',
    width: '100%', maxWidth: '420px',
    boxShadow: 'var(--shadow-lg)',
    position: 'relative', zIndex: 1,
    animation: 'fadeInUp .4s var(--ease)',
  },

  // Logo
  logoArea: { textAlign: 'center', marginBottom: '28px' },
  logoPetal: {
    fontSize: '48px', lineHeight: 1,
    display: 'block', marginBottom: '12px',
    animation: 'pulse 3s ease-in-out infinite',
  },
  appName: {
    fontFamily: 'var(--font-display)',
    fontSize: '28px', fontWeight: 600, color: 'var(--clr-plum)',
  },
  appSub: {
    fontSize: '13px', color: 'var(--clr-text-muted)', marginTop: '4px',
  },

  // Onglets
  tabs: {
    display: 'flex',
    background: 'var(--clr-surface-2)',
    borderRadius: 'var(--r-sm)',
    padding: '4px', marginBottom: '24px', gap: '4px',
  },
  tab: {
    flex: 1, padding: '9px', textAlign: 'center',
    borderRadius: '8px', fontSize: '13.5px', fontWeight: 600,
    color: 'var(--clr-text-muted)',
    transition: 'all .15s',
    textDecoration: 'none',
  },
  tabActive: {
    background: 'var(--clr-surface)',
    color: 'var(--clr-plum)',
    boxShadow: 'var(--shadow-sm)',
  },

  forgotLink: {
    fontSize: '12.5px', color: 'var(--clr-rose)',
    fontWeight: 600, textDecoration: 'none',
  },

  // Footer
  footer: { marginTop: '24px', textAlign: 'center' },
  footerText: { fontSize: '13px', color: 'var(--clr-text-muted)' },
  footerLink: {
    color: 'var(--clr-rose)', fontWeight: 700, textDecoration: 'none',
  },
  langRow: {
    display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px',
  },
  langBtn: {
    padding: '6px 14px', borderRadius: 'var(--r-sm)',
    border: '1px solid var(--clr-border)',
    background: 'none', fontSize: '12px', fontWeight: 600,
    color: 'var(--clr-text-muted)', cursor: 'pointer',
    transition: 'all .15s',
  },
  langBtnActive: {
    background: 'var(--clr-rose-pale)',
    color: 'var(--clr-rose-deep)',
    borderColor: 'var(--clr-rose)',
  },
};