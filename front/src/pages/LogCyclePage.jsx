// ============================================================
// FICHIER  : src/pages/LogCyclePage.jsx
// RÔLE     : Page pour enregistrer un cycle ou un symptôme.
//            - Formulaire Formik pour cycle (date début/fin, flux, notes)
//            - Sélecteur visuel de type de symptôme
//            - Les deux formulaires appellent le backend Express
// ============================================================

import React, { useContext, useState } from 'react';
import { useFormik }         from 'formik';
import * as Yup              from 'yup';
import { format }            from 'date-fns';
import toast                 from 'react-hot-toast';

import { LanguageContext }   from '../context/LanguageContext';
import { useCycles }         from '../hooks/useCycles';
import { createSymptom }     from '../services/symptomService';
import { Card, CardHeader }  from '../components/ui/Card';
import Input                 from '../components/ui/Input';
import Button                from '../components/ui/Button';

const TODAY = format(new Date(), 'yyyy-MM-dd');

// Types de symptômes avec emojis
const SYMPTOM_TYPES = [
  { key:'douleur',    emoji:'😣', label_fr:'Douleur',      label_en:'Pain'        },
  { key:'humeur',     emoji:'😔', label_fr:'Humeur',       label_en:'Mood'        },
  { key:'fringale',   emoji:'🍫', label_fr:'Fringale',     label_en:'Cravings'    },
  { key:'libido',     emoji:'💕', label_fr:'Libido',       label_en:'Libido'      },
  { key:'energie',    emoji:'⚡', label_fr:'Énergie',      label_en:'Energy'      },
  { key:'sommeil',    emoji:'😴', label_fr:'Sommeil',      label_en:'Sleep'       },
  { key:'temperature',emoji:'🌡️', label_fr:'Température',  label_en:'Temperature' },
  { key:'glaire',     emoji:'🫧', label_fr:'Glaire',       label_en:'Discharge'   },
  { key:'peau',       emoji:'✨', label_fr:'Peau',         label_en:'Skin'        },
  { key:'sein',       emoji:'🩷', label_fr:'Sein',         label_en:'Breast'      },
  { key:'digestion',  emoji:'🫄', label_fr:'Digestion',    label_en:'Digestion'   },
  { key:'autre',      emoji:'➕', label_fr:'Autre',        label_en:'Other'       },
];

// Schéma de validation du cycle
const CycleSchema = Yup.object({
  start_date: Yup.date().max(new Date(),'La date ne peut pas être dans le futur').required('Requis'),
  end_date:   Yup.date().nullable()
    .when('start_date', (start_date, schema) =>
      start_date ? schema.min(start_date,'La fin doit être après le début') : schema
    ),
  flow_level: Yup.string().oneOf(['faible','moyen','abondant']).required(),
  notes:      Yup.string().max(1000),
});

export default function LogCyclePage() {
  const { lang, t }        = useContext(LanguageContext);
  const { createCycle, loading: cycleLoading } = useCycles(false);

  const [activeForm, setActiveForm]     = useState('cycle'); // 'cycle' | 'symptom'
  const [selectedSymType, setSelectedSymType] = useState('douleur');
  const [symIntensity, setSymIntensity] = useState(3);
  const [symLoading, setSymLoading]     = useState(false);

  // ── FORMIK — CYCLE ──────────────────────────────────────────
  const cycleFormik = useFormik({
    initialValues: {
      start_date: TODAY,
      end_date:   '',
      flow_level: 'moyen',
      notes:      '',
    },
    validationSchema: CycleSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await createCycle({
          ...values,
          end_date: values.end_date || null,
        });
        resetForm();
      } catch {
        // L'erreur est déjà gérée par useCycles (toast.error)
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ── SOUMISSION SYMPTÔME ─────────────────────────────────────
  const symFormik = useFormik({
    initialValues: {
      logged_date: TODAY,
      value:       '',
      notes:       '',
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSymLoading(true);
      try {
        await createSymptom({
          logged_date: values.logged_date,
          type:        selectedSymType,
          value:       values.value || selectedSymType,
          intensity:   symIntensity,
          notes:       values.notes || null,
        });
        toast.success(lang === 'fr' ? '📓 Symptôme enregistré !' : '📓 Symptom logged!');
        resetForm();
        setSymIntensity(3);
      } catch (err) {
        toast.error(err.userMessage || 'Erreur');
      } finally {
        setSymLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <div style={s.page}>

      {/* ── ONGLETS ── */}
      <div style={s.formTabs}>
        <button
          onClick={() => setActiveForm('cycle')}
          style={{ ...s.formTab, ...(activeForm==='cycle' ? s.formTabActive : {}) }}
        >
          🌸 {lang==='fr' ? 'Enregistrer un cycle' : 'Log a cycle'}
        </button>
        <button
          onClick={() => setActiveForm('symptom')}
          style={{ ...s.formTab, ...(activeForm==='symptom' ? s.formTabActive : {}) }}
        >
          📓 {lang==='fr' ? 'Ajouter un symptôme' : 'Add symptom'}
        </button>
      </div>

      <div style={s.grid}>

        {/* ══════════ FORMULAIRE CYCLE ══════════ */}
        {activeForm === 'cycle' && (
          <Card className="animate-fadeIn">
            <CardHeader icon="🌸" title={lang==='fr' ? 'Enregistrer mes règles' : 'Log my period'} />

            <form onSubmit={cycleFormik.handleSubmit}>
              <div style={s.row}>
                <Input
                  label={t('form_start_date')}
                  type="date"
                  max={TODAY}
                  {...cycleFormik.getFieldProps('start_date')}
                  error={cycleFormik.touched.start_date && cycleFormik.errors.start_date}
                />
              </div>

              <div style={s.row}>
                <Input
                  label={`${t('form_end_date')} ${t('form_end_optional')}`}
                  type="date"
                  max={TODAY}
                  min={cycleFormik.values.start_date}
                  {...cycleFormik.getFieldProps('end_date')}
                  error={cycleFormik.touched.end_date && cycleFormik.errors.end_date}
                />
              </div>

              {/* Sélecteur flux */}
              <div style={s.row}>
                <label style={s.label}>{t('form_flow')}</label>
                <div style={s.flowRow}>
                  {[
                    { val:'faible',   label: t('flow_faible'),   emoji:'🔹' },
                    { val:'moyen',    label: t('flow_moyen'),    emoji:'🔶' },
                    { val:'abondant', label: t('flow_abondant'), emoji:'🔴' },
                  ].map(({ val, label, emoji }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => cycleFormik.setFieldValue('flow_level', val)}
                      style={{
                        ...s.flowBtn,
                        ...(cycleFormik.values.flow_level === val ? s.flowBtnActive : {}),
                      }}
                    >
                      {emoji} {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={s.row}>
                <Input
                  as="textarea"
                  label={t('form_notes')}
                  placeholder={t('form_notes_ph')}
                  rows={3}
                  {...cycleFormik.getFieldProps('notes')}
                />
              </div>

              <Button
                type="submit"
                fullWidth size="lg"
                loading={cycleFormik.isSubmitting || cycleLoading}
              >
                {t('btn_save_cycle')}
              </Button>
            </form>
          </Card>
        )}

        {/* ══════════ FORMULAIRE SYMPTÔME ══════════ */}
        {activeForm === 'symptom' && (
          <Card className="animate-fadeIn">
            <CardHeader icon="📓" title={lang==='fr' ? 'Enregistrer un symptôme' : 'Log a symptom'} />

            <form onSubmit={symFormik.handleSubmit}>
              <div style={s.row}>
                <Input
                  label={lang==='fr' ? 'Date' : 'Date'}
                  type="date"
                  max={TODAY}
                  {...symFormik.getFieldProps('logged_date')}
                />
              </div>

              {/* Sélecteur type de symptôme */}
              <div style={s.row}>
                <label style={s.label}>{lang==='fr' ? 'Type de symptôme' : 'Symptom type'}</label>
                <div style={s.symGrid}>
                  {SYMPTOM_TYPES.map(({ key, emoji, label_fr, label_en }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedSymType(key)}
                      style={{
                        ...s.symBtn,
                        ...(selectedSymType === key ? s.symBtnActive : {}),
                      }}
                    >
                      <span>{emoji}</span>
                      <span>{lang==='fr' ? label_fr : label_en}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensité */}
              <div style={s.row}>
                <label style={s.label}>{t('sym_intensity')}</label>
                <div style={s.intensityRow}>
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSymIntensity(n)}
                      style={{
                        ...s.intensityBtn,
                        background: n <= symIntensity ? 'var(--clr-rose)' : 'var(--clr-surface-2)',
                        color:      n <= symIntensity ? '#fff' : 'var(--clr-text-muted)',
                        borderColor: n <= symIntensity ? 'var(--clr-rose)' : 'var(--clr-border)',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                  <span style={{ fontSize:'12px', color:'var(--clr-text-muted)' }}>
                    {['','Très légère','Légère','Modérée','Forte','Très forte'][symIntensity]}
                  </span>
                </div>
              </div>

              <div style={s.row}>
                <Input
                  label={lang==='fr' ? 'Description' : 'Description'}
                  placeholder={lang==='fr' ? 'Ex: crampes légères, irritable...' : 'E.g.: light cramps, irritable...'}
                  {...symFormik.getFieldProps('value')}
                />
              </div>

              <div style={s.row}>
                <Input
                  as="textarea"
                  label={lang==='fr' ? 'Notes (optionnel)' : 'Notes (optional)'}
                  rows={2}
                  {...symFormik.getFieldProps('notes')}
                />
              </div>

              <Button type="submit" fullWidth size="lg" loading={symLoading || symFormik.isSubmitting}>
                {t('btn_save_symptom')}
              </Button>
            </form>
          </Card>
        )}

        {/* ── INFO SIDEBAR ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <Card variant="tip">
            <p style={{ fontFamily:'var(--font-display)', fontSize:'18px', fontWeight:600, color:'var(--clr-rose-deep)', marginBottom:'10px' }}>
              💡 {lang==='fr' ? 'Conseils' : 'Tips'}
            </p>
            <ul style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {(lang==='fr' ? [
                'Enregistrez vos règles dès le premier jour pour des prédictions plus précises.',
                'Notez vos symptômes quotidiennement pour mieux comprendre vos cycles.',
                'Plus vous avez de données, plus les prédictions s\'améliorent.',
              ] : [
                'Log your period from the first day for more accurate predictions.',
                'Track symptoms daily to better understand your cycles.',
                'More data means better predictions over time.',
              ]).map((tip,i) => (
                <li key={i} style={{ fontSize:'13px', color:'var(--clr-rose-deep)', lineHeight:1.5, display:'flex', gap:'8px' }}>
                  <span style={{ flexShrink:0 }}>✓</span>{tip}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <p style={{ fontFamily:'var(--font-display)', fontSize:'16px', fontWeight:600, color:'var(--clr-plum)', marginBottom:'10px' }}>
              🔒 {lang==='fr' ? 'Confidentialité' : 'Privacy'}
            </p>
            <p style={{ fontSize:'13px', color:'var(--clr-text-muted)', lineHeight:1.5 }}>
              {lang==='fr'
                ? 'Vos données de santé sont chiffrées et ne sont jamais vendues ni partagées sans votre accord.'
                : 'Your health data is encrypted and never sold or shared without your consent.'}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── STYLES ──────────────────────────────────────────────────
const s = {
  page: { display:'flex', flexDirection:'column', gap:'20px' },
  formTabs: { display:'flex', background:'var(--clr-surface)', borderRadius:'var(--r-lg)', padding:'5px', gap:'5px', border:'1px solid var(--clr-border)', boxShadow:'var(--shadow-xs)' },
  formTab: { flex:1, padding:'11px 16px', borderRadius:'var(--r-md)', fontSize:'13.5px', fontWeight:600, color:'var(--clr-text-muted)', cursor:'pointer', transition:'all .15s', border:'none', background:'none' },
  formTabActive: { background:'linear-gradient(135deg,var(--clr-rose),var(--clr-rose-deep))', color:'#fff', boxShadow:'var(--shadow-rose)' },
  grid: { display:'grid', gridTemplateColumns:'1fr 300px', gap:'20px', alignItems:'start' },
  row: { marginBottom:'16px' },
  label: { display:'block', fontSize:'11.5px', fontWeight:700, color:'var(--clr-text-muted)', textTransform:'uppercase', letterSpacing:'.7px', marginBottom:'8px' },
  flowRow: { display:'flex', gap:'8px' },
  flowBtn: { flex:1, padding:'10px 8px', borderRadius:'var(--r-sm)', border:'1.5px solid var(--clr-border)', background:'var(--clr-surface-2)', fontSize:'13px', fontWeight:500, color:'var(--clr-text-muted)', cursor:'pointer', transition:'all .15s' },
  flowBtnActive: { borderColor:'var(--clr-rose)', background:'var(--clr-rose-pale)', color:'var(--clr-rose-deep)', fontWeight:700 },
  symGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'7px' },
  symBtn: { display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', padding:'10px 6px', borderRadius:'var(--r-sm)', border:'1.5px solid var(--clr-border)', background:'var(--clr-surface-2)', fontSize:'11px', fontWeight:500, color:'var(--clr-text-muted)', cursor:'pointer', transition:'all .15s' },
  symBtnActive: { borderColor:'var(--clr-rose)', background:'var(--clr-rose-pale)', color:'var(--clr-rose-deep)' },
  intensityRow: { display:'flex', alignItems:'center', gap:'8px' },
  intensityBtn: { width:'38px', height:'38px', borderRadius:'50%', border:'1.5px solid', fontSize:'13px', fontWeight:700, cursor:'pointer', transition:'all .15s' },
};