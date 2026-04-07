// ============================================================
// FICHIER  : src/pages/auth/RegisterPage.jsx
// RÔLE     : Page d'inscription.
//            Validation Formik/Yup + appel POST /auth/register
// ============================================================

import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth }         from '../../hooks/useAuth';
import { LanguageContext } from '../../context/LanguageContext';
import Input               from '../../components/ui/Input';
import Button              from '../../components/ui/Button';

const RegisterSchema = Yup.object({
  first_name: Yup.string().min(2,'Min. 2 caractères').max(100).required('Prénom requis'),
  email:      Yup.string().email('Email invalide').required('Email requis'),
  password:   Yup.string()
    .min(8,'Min. 8 caractères')
    .matches(/[A-Z]/,'Au moins une majuscule')
    .matches(/[0-9]/,'Au moins un chiffre')
    .required('Mot de passe requis'),
  language:   Yup.string().oneOf(['fr','en']).required(),
});

export default function RegisterPage() {
  const { register }                  = useAuth();
  const { t, lang, changeLang }       = useContext(LanguageContext);
  const navigate                      = useNavigate();
  const [showPwd, setShowPwd]         = useState(false);

  const formik = useFormik({
    initialValues: { first_name:'', email:'', password:'', language: lang },
    validationSchema: RegisterSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await register(values);
        toast.success(lang === 'fr' ? 'Compte créé ! Bienvenue 🌸' : 'Account created! Welcome 🌸');
        navigate('/dashboard');
      } catch (err) {
        toast.error(err.userMessage || 'Erreur lors de l\'inscription');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Indicateur de force du mot de passe
  const pwdStrength = (() => {
    const p = formik.values.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8)        score++;
    if (/[A-Z]/.test(p))      score++;
    if (/[0-9]/.test(p))      score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();
  const strengthLabel = ['', 'Faible', 'Moyen', 'Bien', 'Fort'][pwdStrength];
  const strengthColor = ['','#E53935','#F57F17','#FDD835','#2E7D32'][pwdStrength];

  return (
    <div style={s.page}>
      <div style={{ ...s.deco, width:'380px', height:'380px', top:'-100px', right:'-80px' }} />
      <div style={{ ...s.deco, width:'220px', height:'220px', bottom:'-50px', left:'-50px' }} />

      <div style={s.card}>
        <div style={s.logoArea}>
          <div style={s.logoPetal}>🌸</div>
          <h1 style={s.appName}>CycleTracker</h1>
          <p style={s.appSub}>{lang === 'fr' ? 'Créez votre compte' : 'Create your account'}</p>
        </div>

        {/* Onglets */}
        <div style={s.tabs}>
          <Link to="/login"    style={s.tab}>{lang === 'fr' ? 'Connexion' : 'Login'}</Link>
          <Link to="/register" style={{ ...s.tab, ...s.tabActive }}>{lang === 'fr' ? 'Inscription' : 'Register'}</Link>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div style={s.row}>
            <Input label={t('first_name')} icon="👤"
              placeholder="Miora"
              {...formik.getFieldProps('first_name')}
              error={formik.touched.first_name && formik.errors.first_name}
            />
          </div>

          <div style={s.row}>
            <Input label={t('email')} type="email" icon="📧"
              placeholder="miora@exemple.mg"
              {...formik.getFieldProps('email')}
              error={formik.touched.email && formik.errors.email}
            />
          </div>

          <div style={s.row}>
            <Input label={t('password')} type={showPwd ? 'text' : 'password'}
              icon="🔒"
              iconRight={<span onClick={() => setShowPwd(p=>!p)} style={{cursor:'pointer'}}>{showPwd?'🙈':'👁️'}</span>}
              placeholder="••••••••"
              {...formik.getFieldProps('password')}
              error={formik.touched.password && formik.errors.password}
            />
            {/* Jauge de force */}
            {formik.values.password && (
              <div style={{ marginTop:'6px', display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ flex:1, height:'4px', background:'var(--clr-border)', borderRadius:'99px', overflow:'hidden' }}>
                  <div style={{ width:`${pwdStrength * 25}%`, height:'100%', background: strengthColor, borderRadius:'99px', transition:'all .3s' }} />
                </div>
                <span style={{ fontSize:'11px', fontWeight:700, color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
          </div>

          <div style={s.row}>
            <label style={s.label}>Langue / Language</label>
            <div style={s.langPicker}>
              {[{val:'fr',label:'🇫🇷 Français'},{val:'en',label:'🇬🇧 English'}].map(({val,label}) => (
                <label key={val} style={{ ...s.langOption, ...(formik.values.language===val ? s.langOptionActive:{}) }}>
                  <input type="radio" value={val} name="language" onChange={() => { formik.setFieldValue('language',val); changeLang(val); }} style={{display:'none'}} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" loading={formik.isSubmitting} style={{marginTop:'6px'}}>
            {t('register_btn')}
          </Button>
        </form>

        <div style={s.footer}>
          <p style={s.footerText}>
            {t('have_account')}{' '}
            <Link to="/login" style={s.footerLink}>{t('login_btn')}</Link>
          </p>
          <p style={{ fontSize:'11px', color:'var(--clr-text-muted)', marginTop:'10px', textAlign:'center' }}>
            🔒 {lang==='fr' ? 'Vos données ne seront jamais vendues.' : 'Your data will never be sold.'}
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', background:'linear-gradient(135deg,var(--clr-plum) 0%,var(--clr-rose-deep) 60%,#C2185B 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', position:'relative', overflow:'hidden' },
  deco: { position:'absolute', borderRadius:'50%', background:'rgba(255,255,255,.05)', pointerEvents:'none' },
  card: { background:'var(--clr-surface)', borderRadius:'var(--r-2xl)', padding:'36px', width:'100%', maxWidth:'420px', boxShadow:'var(--shadow-lg)', position:'relative', zIndex:1, animation:'fadeInUp .4s var(--ease)' },
  logoArea: { textAlign:'center', marginBottom:'24px' },
  logoPetal: { fontSize:'40px', lineHeight:1, display:'block', marginBottom:'10px' },
  appName: { fontFamily:'var(--font-display)', fontSize:'26px', fontWeight:600, color:'var(--clr-plum)' },
  appSub: { fontSize:'13px', color:'var(--clr-text-muted)', marginTop:'4px' },
  tabs: { display:'flex', background:'var(--clr-surface-2)', borderRadius:'var(--r-sm)', padding:'4px', marginBottom:'22px', gap:'4px' },
  tab: { flex:1, padding:'8px', textAlign:'center', borderRadius:'8px', fontSize:'13px', fontWeight:600, color:'var(--clr-text-muted)', textDecoration:'none' },
  tabActive: { background:'var(--clr-surface)', color:'var(--clr-plum)', boxShadow:'var(--shadow-sm)' },
  row: { marginBottom:'14px' },
  label: { display:'block', fontSize:'11.5px', fontWeight:700, color:'var(--clr-text-muted)', textTransform:'uppercase', letterSpacing:'.7px', marginBottom:'6px' },
  langPicker: { display:'flex', gap:'8px' },
  langOption: { flex:1, padding:'10px', textAlign:'center', borderRadius:'var(--r-sm)', border:'1.5px solid var(--clr-border)', background:'var(--clr-surface-2)', fontSize:'13px', fontWeight:500, color:'var(--clr-text-muted)', cursor:'pointer', transition:'all .15s' },
  langOptionActive: { borderColor:'var(--clr-rose)', background:'var(--clr-rose-pale)', color:'var(--clr-rose-deep)' },
  footer: { marginTop:'22px' },
  footerText: { fontSize:'13px', color:'var(--clr-text-muted)', textAlign:'center' },
  footerLink: { color:'var(--clr-rose)', fontWeight:700, textDecoration:'none' },
};