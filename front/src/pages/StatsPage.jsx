// ============================================================
// FICHIER  : src/pages/StatsPage.jsx
// RÔLE     : Page de statistiques.
//            Données chargées depuis GET /api/v1/stats/overview
//            et GET /api/v1/stats/cycles-history
// ============================================================

import React, { useContext }    from 'react';
import { LanguageContext }       from '../context/LanguageContext';
import { useStatsOverview, useCyclesHistory } from '../hooks/useStats';
import { Card, CardHeader }      from '../components/ui/Card';
import { PageSpinner }           from '../components/ui/Spinner';
import CycleHistoryChart         from '../components/charts/CycleHistoryChart';

// Barre horizontale de symptôme réutilisable
function SymptomBar({ label, count, total, color = 'var(--clr-rose)' }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'10px' }}>
      <span style={{ fontSize:'12px', width:'75px', flexShrink:0, color:'var(--clr-text-muted)' }}>{label}</span>
      <div style={{ flex:1, height:'8px', background:'var(--clr-rose-pale)', borderRadius:'99px', overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:'99px', transition:'width .6s ease' }} />
      </div>
      <span style={{ fontSize:'11px', fontWeight:700, color, minWidth:'32px', textAlign:'right' }}>{pct}%</span>
    </div>
  );
}

export default function StatsPage() {
  const { lang, t }           = useContext(LanguageContext);
  const { stats, loading }    = useStatsOverview();
  const { history, loading: histLoading } = useCyclesHistory(12);

  if (loading) return <PageSpinner />;

  if (!stats || stats.cycles_count === 0) {
    return (
      <div style={{ textAlign:'center', padding:'60px 20px' }}>
        <p style={{ fontSize:'36px', marginBottom:'12px' }}>📊</p>
        <h2 style={{ fontFamily:'var(--font-display)', color:'var(--clr-plum)', marginBottom:'8px' }}>
          {lang==='fr' ? 'Pas encore de statistiques' : 'No statistics yet'}
        </h2>
        <p style={{ color:'var(--clr-text-muted)', fontSize:'14px' }}>{t('add_first_cycle')}</p>
      </div>
    );
  }

  const { cycle_length, period_length, cycles_count, flow_distribution, top_symptoms } = stats;

  // Couleurs des symptômes
  const SYM_COLORS = ['var(--clr-rose)','#E91E8C','var(--clr-plum)','var(--clr-ovulation)','#1565C0'];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }} className="animate-fadeIn">

      {/* ══════════════════════════════════════
           3 MÉTRIQUES PRINCIPALES
      ══════════════════════════════════════ */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>

        <Card variant="stat" className="animate-fadeInUp delay-1">
          <div style={s.metricNum}>
            {cycle_length?.average ?? '—'}
            <span style={s.metricUnit}> {t('days_unit')}</span>
          </div>
          <div style={s.metricLabel}>{t('avg_cycle')}</div>
          {cycle_length?.min && (
            <div style={s.metricRange}>
              {lang==='fr'?'Min':'Min'} {cycle_length.min} — {lang==='fr'?'Max':'Max'} {cycle_length.max}
            </div>
          )}
        </Card>

        <Card variant="stat" className="animate-fadeInUp delay-2">
          <div style={{ ...s.metricNum, color:'var(--clr-rose)' }}>
            {period_length?.average ?? '—'}
            <span style={s.metricUnit}> {t('days_unit')}</span>
          </div>
          <div style={s.metricLabel}>{t('avg_period')}</div>
          {period_length?.min && (
            <div style={s.metricRange}>
              Min {period_length.min} — Max {period_length.max}
            </div>
          )}
        </Card>

        <Card variant="stat" className="animate-fadeInUp delay-3">
          <div style={{ ...s.metricNum, color:'var(--clr-plum-light)' }}>
            {cycles_count}
            <span style={s.metricUnit}> ×</span>
          </div>
          <div style={s.metricLabel}>{t('total_cycles')}</div>
          {stats.date_range?.first_cycle && (
            <div style={s.metricRange}>{lang==='fr'?'Depuis':'Since'} {stats.date_range.first_cycle}</div>
          )}
        </Card>
      </div>

      {/* ══════════════════════════════════════
           GRAPHIQUE ÉVOLUTION CYCLES
      ══════════════════════════════════════ */}
      <Card className="animate-fadeInUp delay-4">
        <CardHeader
          title={lang==='fr' ? 'Évolution de la durée des cycles' : 'Cycle length over time'}
          icon="📈"
        />
        {histLoading
          ? <PageSpinner />
          : <CycleHistoryChart history={history} avgCycleLength={cycle_length?.average || 28} />
        }
      </Card>

      {/* ══════════════════════════════════════
           FLUX + TOP SYMPTÔMES
      ══════════════════════════════════════ */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

        {/* Répartition du flux */}
        <Card className="animate-fadeInUp delay-5">
          <CardHeader title={lang==='fr' ? 'Répartition du flux' : 'Flow distribution'} icon="💧" />
          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginTop:'4px' }}>
            {[
              { key:'moyen',    label: lang==='fr'?'Moyen':'Medium',   color:'var(--clr-rose)' },
              { key:'abondant', label: lang==='fr'?'Abondant':'Heavy', color:'var(--clr-rose-deep)' },
              { key:'faible',   label: lang==='fr'?'Faible':'Light',   color:'#F48FB1' },
            ].map(({ key, label, color }) => {
              const count = flow_distribution?.[key] || 0;
              const total = Object.values(flow_distribution || {}).reduce((a,b) => a+b, 0);
              const pct   = total > 0 ? Math.round((count/total)*100) : 0;
              return (
                <div key={key}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'var(--clr-text-muted)', marginBottom:'4px' }}>
                    <span>{label}</span>
                    <span style={{ fontWeight:700, color }}>{pct}%</span>
                  </div>
                  <div style={{ height:'8px', background:'var(--clr-rose-pale)', borderRadius:'99px', overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:'99px', transition:'width .6s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top symptômes */}
        <Card className="animate-fadeInUp delay-5">
          <CardHeader title={lang==='fr' ? 'Top symptômes' : 'Top symptoms'} icon="📋" />
          {top_symptoms?.length > 0 ? (
            top_symptoms.map((sym, i) => (
              <SymptomBar
                key={sym.type}
                label={sym.type}
                count={parseInt(sym.count)}
                total={cycles_count * 30} // approximation
                color={SYM_COLORS[i] || 'var(--clr-rose)'}
              />
            ))
          ) : (
            <p style={{ color:'var(--clr-text-muted)', fontSize:'13px' }}>{t('no_data')}</p>
          )}
        </Card>

      </div>
    </div>
  );
}

const s = {
  metricNum: { fontFamily:'var(--font-display)', fontSize:'40px', fontWeight:600, color:'var(--clr-plum)', lineHeight:1 },
  metricUnit: { fontSize:'16px' },
  metricLabel: { fontSize:'12px', color:'var(--clr-text-muted)', marginTop:'4px' },
  metricRange: { fontSize:'11px', color:'var(--clr-text-hint)', marginTop:'6px', background:'var(--clr-surface)', borderRadius:'99px', padding:'2px 10px', display:'inline-block' },
};