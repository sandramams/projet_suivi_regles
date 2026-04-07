// ============================================================
// FICHIER  : src/pages/DashboardPage.jsx
// RÔLE     : Page principale — tableau de bord.
//            Données chargées depuis GET /api/v1/cycles/dashboard
//            Affiche :
//            - Carte hero avec phase actuelle et jours restants
//            - 3 cartes KPI (prochaines règles, fenêtre fertile, ovulation)
//            - Frise des 14 prochains jours colorés
//            - Symptômes du jour
//            - Conseils selon la phase
// ============================================================

import React, { useContext } from 'react';
import { useNavigate }       from 'react-router-dom';
import { format, addDays, parseISO, differenceInDays } from 'date-fns';
import { fr }                from 'date-fns/locale';

import { useAuth }           from '../hooks/useAuth';
import { useDashboard }      from '../hooks/useCycles';
import { LanguageContext }   from '../context/LanguageContext';
import { Card, CardHeader }  from '../components/ui/Card';
import Badge                 from '../components/ui/Badge';
import Button                from '../components/ui/Button';
import { PageSpinner }       from '../components/ui/Spinner';

// Emojis et labels par phase
const PHASE_INFO = {
  regles:              { emoji: '🌸', label_fr: 'Règles en cours',   label_en: 'Period',        color: 'var(--clr-period)'    },
  folliculaire:        { emoji: '🌱', label_fr: 'Phase folliculaire', label_en: 'Follicular',   color: 'var(--clr-plum)'      },
  folliculaire_fertile:{ emoji: '🌿', label_fr: 'Phase fertile',      label_en: 'Fertile phase', color: 'var(--clr-fertile)'  },
  ovulation:           { emoji: '🌕', label_fr: 'Ovulation',          label_en: 'Ovulation',    color: 'var(--clr-ovulation)' },
  luteale:             { emoji: '🍂', label_fr: 'Phase lutéale',      label_en: 'Luteal phase', color: 'var(--clr-luteal)'    },
  inconnue:            { emoji: '✨', label_fr: 'Phase inconnue',     label_en: 'Unknown phase',color: 'var(--clr-text-muted)'},
};

// Conseils quotidiens selon la phase
const TIPS = {
  regles: {
    fr: '🌸 Soyez douce avec vous-même. Le repos, la chaleur et les infusions sont vos alliées.',
    en: '🌸 Be gentle with yourself. Rest, warmth, and herbal teas are your allies.',
  },
  folliculaire: {
    fr: '🌱 Votre énergie monte ! Idéal pour démarrer de nouveaux projets et faire du sport.',
    en: '🌱 Your energy is rising! Great time to start new projects and exercise.',
  },
  folliculaire_fertile: {
    fr: '🌿 Vous êtes dans votre fenêtre fertile. Période propice à la conception si vous le souhaitez.',
    en: '🌿 You are in your fertile window. Great time for conception if desired.',
  },
  ovulation: {
    fr: '🌕 Journée d\'ovulation ! Vous êtes au pic de votre énergie et de votre vitalité.',
    en: '🌕 Ovulation day! You are at the peak of your energy and vitality.',
  },
  luteale: {
    fr: '🍂 Phase pré-menstruelle. Privilégiez le magnésium, réduisez le café et pratiquez le yoga.',
    en: '🍂 Pre-menstrual phase. Prioritize magnesium, reduce coffee, and practice yoga.',
  },
};

// Labels des jours de la semaine
const DAY_SHORT_FR = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const DAY_SHORT_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function DashboardPage() {
  const { user }              = useAuth();
  const { lang, t }           = useContext(LanguageContext);
  const { dashboard, loading, error, refetch } = useDashboard();
  const navigate              = useNavigate();
  const today                 = new Date();

  if (loading) return <PageSpinner />;

  if (error || !dashboard) {
    return (
      <div style={{ textAlign:'center', padding:'60px 20px' }}>
        <p style={{ fontSize:'40px', marginBottom:'12px' }}>🌸</p>
        <h2 style={{ fontFamily:'var(--font-display)', color:'var(--clr-plum)', marginBottom:'8px' }}>
          {lang === 'fr' ? 'Bienvenue, ' : 'Welcome, '}{user?.first_name} !
        </h2>
        <p style={{ color:'var(--clr-text-muted)', marginBottom:'24px', fontSize:'14px' }}>
          {t('add_first_cycle')}
        </p>
        <Button onClick={() => navigate('/log')} size="lg">
          🌸 {lang === 'fr' ? 'Enregistrer mon premier cycle' : 'Log my first cycle'}
        </Button>
      </div>
    );
  }

  const {
    current_phase,
    days_until_next_period,
    is_fertile_today,
    last_cycle,
    next_prediction,
    today_symptoms,
    user_settings,
  } = dashboard;

  const phaseInfo = PHASE_INFO[current_phase] || PHASE_INFO.inconnue;
  const tip       = TIPS[current_phase] || TIPS.folliculaire;

  // Calcule le jour dans le cycle
  const cycleDay = last_cycle?.start_date
    ? differenceInDays(today, parseISO(last_cycle.start_date)) + 1
    : null;

  return (
    <div style={s.page} className="animate-fadeIn">

      {/* ══════════════════════════════════════
           CARTE HERO — Phase + jours restants
      ══════════════════════════════════════ */}
      <div style={s.hero}>
        {/* Décorations */}
        <div style={s.heroDeco1} />
        <div style={s.heroDeco2} />

        <div style={{ position:'relative', zIndex:1 }}>
          <p style={s.heroGreeting}>
            {lang === 'fr' ? `Bonjour, ${user?.first_name} 👋` : `Hello, ${user?.first_name} 👋`}
          </p>

          <h2 style={s.heroTitle}>
            {lang === 'fr' ? `Vous êtes en phase ` : `You're in your `}
            <em style={{ color:'#FFD54F', fontStyle:'italic' }}>
              {lang === 'fr' ? phaseInfo.label_fr : phaseInfo.label_en}
            </em>
          </h2>

          {/* Badge phase animé */}
          <div style={s.heroBadge}>
            <span style={s.pulseDot} />
            {phaseInfo.emoji} {lang === 'fr' ? phaseInfo.label_fr : phaseInfo.label_en}
            {cycleDay && ` — ${lang==='fr'?'Jour':'Day'} ${cycleDay}`}
          </div>

          <p style={s.heroSub}>
            {days_until_next_period !== null && days_until_next_period >= 0
              ? <>
                  {lang === 'fr' ? 'Prochaines règles dans ' : 'Next period in '}
                  <strong style={{ color:'#FFD54F' }}>{days_until_next_period} {t('days_unit')}</strong>
                  {next_prediction && (
                    <> — {lang==='fr'?'Prévu le':'Expected'} {format(parseISO(next_prediction.predicted_start),'d MMMM',{locale: lang==='fr'?fr:undefined})}</>
                  )}
                  {` · ${t('confidence')} : ${Math.round(next_prediction?.confidence_level||90)}%`}
                </>
              : (lang === 'fr' ? 'Enregistrez plus de cycles pour améliorer les prédictions.' : 'Log more cycles to improve predictions.')
            }
          </p>

          {/* Stats rapides */}
          <div style={s.heroStats}>
            {[
              { num: user_settings?.average_cycle_length||28, label: lang==='fr'?'Durée moy. cycle':'Avg cycle' },
              { num: user_settings?.average_period_length||5,  label: lang==='fr'?'Durée moy. règles':'Avg period' },
              { num: cycleDay||'—', label: lang==='fr'?'Jour du cycle':'Cycle day' },
              { num: next_prediction ? `${Math.round(next_prediction.confidence_level)}%` : '—',
                label: lang==='fr'?'Confiance':'Confidence' },
            ].map((stat,i) => (
              <div key={i} style={s.heroStat} className={`animate-fadeInUp delay-${i+1}`}>
                <div style={s.heroStatNum}>{stat.num}</div>
                <div style={s.heroStatLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
           3 CARTES KPI
      ══════════════════════════════════════ */}
      <div style={s.kpiGrid}>
        {/* Prochaines règles */}
        <Card style={{ ...s.kpiCard }} className="animate-fadeInUp delay-1">
          <CardHeader icon="🌸" title={t('next_period')} iconBg="var(--clr-period-bg)" />
          <div style={s.kpiNum}>
            {days_until_next_period ?? '—'}
            <span style={s.kpiUnit}> {t('days_unit')}</span>
          </div>
          {next_prediction && (
            <p style={s.kpiSub}>
              {format(parseISO(next_prediction.predicted_start),'d MMMM yyyy',{locale:lang==='fr'?fr:undefined})}
            </p>
          )}
          <Badge phase="regles" style={{ marginTop:'10px' }}>J-{days_until_next_period??'—'}</Badge>
        </Card>

        {/* Fenêtre fertile */}
        <Card style={s.kpiCard} className="animate-fadeInUp delay-2">
          <CardHeader icon="🌿" title={t('fertile_window')} iconBg="var(--clr-fertile-bg)" />
          <div style={{ ...s.kpiNum, color:'var(--clr-fertile)' }}>
            {is_fertile_today
              ? (lang==='fr' ? "Aujourd'hui" : "Today")
              : next_prediction?.fertility_window_start
                ? `${differenceInDays(parseISO(next_prediction.fertility_window_start), today)} ${t('days_unit')}`
                : '—'}
          </div>
          {next_prediction?.fertility_window_start && (
            <p style={s.kpiSub}>
              {format(parseISO(next_prediction.fertility_window_start),'d',{locale:lang==='fr'?fr:undefined})}
              {' → '}
              {format(parseISO(next_prediction.fertility_window_end),'d MMMM',{locale:lang==='fr'?fr:undefined})}
            </p>
          )}
          <Badge phase={is_fertile_today ? 'fertile' : 'luteale'} style={{ marginTop:'10px' }}>
            {is_fertile_today ? '✓ Fertile' : lang==='fr'?'Non fertile':'Not fertile'}
          </Badge>
        </Card>

        {/* Ovulation */}
        <Card style={s.kpiCard} className="animate-fadeInUp delay-3">
          <CardHeader icon="🌕" title={t('ovulation')} iconBg="var(--clr-ovulation-bg)" />
          <div style={{ ...s.kpiNum, color:'var(--clr-ovulation)' }}>
            {next_prediction?.ovulation_date
              ? format(parseISO(next_prediction.ovulation_date),'d MMM',{locale:lang==='fr'?fr:undefined})
              : '—'}
          </div>
          {next_prediction?.ovulation_date && (
            <p style={s.kpiSub}>
              {lang==='fr'?'Dans ':'In '}
              {differenceInDays(parseISO(next_prediction.ovulation_date), today)} {t('days_unit')}
            </p>
          )}
          <Badge phase="ovulation" style={{ marginTop:'10px' }}>
            {lang==='fr'?'Cycle suivant':'Next cycle'}
          </Badge>
        </Card>
      </div>

      {/* ══════════════════════════════════════
           FRISE DES 14 PROCHAINS JOURS
      ══════════════════════════════════════ */}
      <Card style={{ marginBottom:'20px' }} className="animate-fadeInUp delay-4">
        <CardHeader
          title={lang==='fr' ? '📅 Les 14 prochains jours' : '📅 Next 14 days'}
        />
        <div style={s.daysRow}>
          {Array.from({ length: 14 }).map((_, i) => {
            const day  = addDays(today, i);
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayNum  = format(day, 'd');
            const dayName = (lang==='fr' ? DAY_SHORT_FR : DAY_SHORT_EN)[day.getDay()];

            // Détermine la phase du jour
            let phase = 'normal';
            let icon  = '';
            if (next_prediction) {
              const start = next_prediction.predicted_start;
              const end   = next_prediction.predicted_end;
              const fStart= next_prediction.fertility_window_start;
              const fEnd  = next_prediction.fertility_window_end;
              const ovu   = next_prediction.ovulation_date;
              if (dateStr >= start && dateStr <= end)   { phase = 'period';    icon = '🌸'; }
              else if (dateStr === ovu)                  { phase = 'ovulation'; icon = '🌕'; }
              else if (fStart && dateStr >= fStart && dateStr <= fEnd) { phase = 'fertile'; icon = '🌿'; }
            }
            const isCurrentDay = i === 0;

            const bgMap = { period:'var(--clr-period-bg)', fertile:'var(--clr-fertile-bg)', ovulation:'var(--clr-ovulation-bg)', normal:'var(--clr-surface-2)' };
            const colorMap = { period:'var(--clr-period)', fertile:'var(--clr-fertile)', ovulation:'var(--clr-ovulation)', normal:'var(--clr-text)' };

            return (
              <div
                key={i}
                style={{
                  ...s.dayPill,
                  background: bgMap[phase],
                  borderColor: isCurrentDay ? 'var(--clr-plum)' : (phase !== 'normal' ? colorMap[phase] : 'var(--clr-border)'),
                  borderWidth: isCurrentDay ? '2px' : '1.5px',
                }}
              >
                <div style={{ fontSize:'9px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.4px', color:'var(--clr-text-muted)' }}>{dayName}</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:600, color: isCurrentDay ? 'var(--clr-plum)' : colorMap[phase] }}>{dayNum}</div>
                <div style={{ fontSize:'13px', height:'16px' }}>{icon}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ══════════════════════════════════════
           BAS : Symptômes + Conseil
      ══════════════════════════════════════ */}
      <div style={s.bottomGrid}>
        {/* Symptômes du jour */}
        <Card className="animate-fadeInUp delay-5">
          <CardHeader
            title={lang==='fr' ? '📓 Symptômes du jour' : '📓 Today\'s symptoms'}
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/log')}>
                + {lang==='fr'?'Ajouter':'Add'}
              </Button>
            }
          />
          {today_symptoms?.length === 0 ? (
            <p style={{ color:'var(--clr-text-muted)', fontSize:'13px', textAlign:'center', padding:'12px 0' }}>
              {lang==='fr' ? 'Aucun symptôme enregistré aujourd\'hui.' : 'No symptoms logged today.'}
            </p>
          ) : (
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
              {today_symptoms.map(sym => (
                <span key={sym.id} style={s.symTag}>
                  <span style={s.symDot} />
                  {sym.type} {sym.intensity ? `(${sym.intensity}/5)` : ''}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Conseil du jour */}
        <Card variant="tip">
          <div style={{ fontSize:'18px', marginBottom:'10px' }}>{phaseInfo.emoji}</div>
          <p style={{ fontFamily:'var(--font-display)', fontSize:'18px', fontWeight:600, color:'var(--clr-rose-deep)', marginBottom:'8px' }}>
            {lang==='fr' ? 'Conseil du jour' : 'Daily tip'}
          </p>
          <p style={{ fontSize:'13.5px', color:'var(--clr-rose-deep)', lineHeight:1.6 }}>
            {lang==='fr' ? tip.fr : tip.en}
          </p>
        </Card>
      </div>

    </div>
  );
}

// ── STYLES ──────────────────────────────────────────────────
const s = {
  page: { display:'flex', flexDirection:'column', gap:'20px' },

  // Hero
  hero: {
    background:'linear-gradient(135deg,var(--clr-plum) 0%,var(--clr-rose-deep) 65%,#C2185B 100%)',
    borderRadius:'var(--r-2xl)', padding:'32px 36px',
    position:'relative', overflow:'hidden',
    color:'#fff',
  },
  heroDeco1: { position:'absolute', right:'-50px', top:'-50px', width:'220px', height:'220px', background:'rgba(255,255,255,.05)', borderRadius:'50%' },
  heroDeco2: { position:'absolute', right:'40px', top:'80px', width:'120px', height:'120px', background:'rgba(255,255,255,.04)', borderRadius:'50%' },
  heroGreeting: { fontSize:'13px', color:'rgba(255,255,255,.65)', marginBottom:'4px' },
  heroTitle: { fontFamily:'var(--font-display)', fontSize:'clamp(24px,3vw,32px)', fontWeight:600, color:'#fff', lineHeight:1.2, marginBottom:'10px' },
  heroBadge: { display:'inline-flex', alignItems:'center', gap:'7px', background:'rgba(255,255,255,.14)', borderRadius:'99px', padding:'6px 16px', fontSize:'13px', marginBottom:'12px' },
  pulseDot: { width:'7px', height:'7px', borderRadius:'50%', background:'#FFD54F', animation:'pulse 2s infinite', display:'inline-block' },
  heroSub: { fontSize:'13.5px', color:'rgba(255,255,255,.75)', marginBottom:'24px', lineHeight:1.5 },
  heroStats: { display:'flex', gap:'14px', flexWrap:'wrap' },
  heroStat: { background:'rgba(255,255,255,.1)', borderRadius:'var(--r-md)', padding:'12px 18px', backdropFilter:'blur(8px)', minWidth:'100px', flex:'1' },
  heroStatNum: { fontFamily:'var(--font-display)', fontSize:'26px', fontWeight:600, color:'#fff', lineHeight:1 },
  heroStatLabel: { fontSize:'11px', color:'rgba(255,255,255,.6)', marginTop:'3px' },

  // KPIs
  kpiGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'16px' },
  kpiCard: { cursor:'default' },
  kpiNum: { fontFamily:'var(--font-display)', fontSize:'36px', fontWeight:600, color:'var(--clr-plum)', lineHeight:1, marginTop:'4px' },
  kpiUnit: { fontSize:'18px', color:'var(--clr-rose)' },
  kpiSub: { fontSize:'12.5px', color:'var(--clr-text-muted)', marginTop:'4px' },

  // Frise 14 jours
  daysRow: { display:'flex', gap:'7px', overflowX:'auto', paddingBottom:'6px' },
  dayPill: { flexShrink:0, width:'60px', borderRadius:'var(--r-md)', padding:'10px 6px', textAlign:'center', border:'1.5px solid', cursor:'default' },

  // Bas
  bottomGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' },
  symTag: { display:'flex', alignItems:'center', gap:'6px', background:'var(--clr-rose-pale)', borderRadius:'99px', padding:'6px 14px', fontSize:'12px', fontWeight:500, color:'var(--clr-rose-deep)' },
  symDot: { width:'6px', height:'6px', borderRadius:'50%', background:'var(--clr-rose)', flexShrink:0 },
};