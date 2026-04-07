// ============================================================
// FICHIER  : src/pages/CalendarPage.jsx
// RÔLE     : Page calendrier mensuel interactif.
//            Affiche CycleCalendar + panneau latéral de détail du jour
// ============================================================

import React, { useState, useContext } from 'react';
import { format } from 'date-fns';
import { fr }     from 'date-fns/locale';

import { LanguageContext }  from '../context/LanguageContext';
import CycleCalendar        from '../components/calendar/CycleCalendar';
import { Card }             from '../components/ui/Card';
import Badge                from '../components/ui/Badge';

export default function CalendarPage() {
  const { lang }                  = useContext(LanguageContext);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedData, setSelectedData] = useState(null);

  const handleDayClick = (day, data) => {
    setSelectedDay(day);
    setSelectedData(data);
  };

  const phases = selectedData?.phases || [];
  const symptoms = selectedData?.symptoms || [];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'20px', alignItems:'start' }}>

      {/* ── CALENDRIER ── */}
      <Card>
        <CycleCalendar lang={lang} onDayClick={handleDayClick} />
      </Card>

      {/* ── PANNEAU DÉTAIL ── */}
      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

        {/* Détail du jour sélectionné */}
        <Card>
          {selectedDay ? (
            <>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'18px', color:'var(--clr-plum)', marginBottom:'14px' }}>
                {format(selectedDay, 'd MMMM yyyy', { locale: lang==='fr' ? fr : undefined })}
              </h3>

              {/* Phases */}
              {phases.length > 0 ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'12px' }}>
                  {phases.map(p => (
                    <Badge key={p} phase={p}>
                      {{ regles:'🌸 Règles', regles_predites:'🔮 Prédites', fertile:'🌿 Fertile', ovulation:'🌕 Ovulation' }[p] || p}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize:'13px', color:'var(--clr-text-muted)', marginBottom:'12px' }}>
                  {lang==='fr' ? 'Aucune phase particulière' : 'No special phase'}
                </p>
              )}

              {/* Symptômes */}
              {symptoms.length > 0 && (
                <>
                  <p style={{ fontSize:'11px', fontWeight:700, color:'var(--clr-text-muted)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:'6px' }}>
                    Symptômes
                  </p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                    {symptoms.map((s,i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:'12.5px', padding:'5px 8px', background:'var(--clr-surface-2)', borderRadius:'var(--r-sm)' }}>
                        <span>{s.type}</span>
                        {s.intensity && <span style={{ color:'var(--clr-rose)', fontWeight:600 }}>{s.intensity}/5</span>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'20px 10px' }}>
              <p style={{ fontSize:'28px', marginBottom:'8px' }}>📅</p>
              <p style={{ fontSize:'13px', color:'var(--clr-text-muted)' }}>
                {lang==='fr' ? 'Cliquez sur un jour pour voir les détails.' : 'Click a day to see details.'}
              </p>
            </div>
          )}
        </Card>

        {/* Légende */}
        <Card>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'16px', color:'var(--clr-plum)', marginBottom:'12px' }}>
            {lang==='fr' ? 'Légende' : 'Legend'}
          </h3>
          {[
            { color:'var(--clr-period)',     label: lang==='fr' ? 'Règles' : 'Period' },
            { color:'#F06292',               label: lang==='fr' ? 'Règles prédites' : 'Predicted period', dashed:true },
            { color:'var(--clr-fertile)',    label: lang==='fr' ? 'Fenêtre fertile' : 'Fertile window' },
            { color:'var(--clr-ovulation)',  label: lang==='fr' ? 'Ovulation' : 'Ovulation' },
            { color:'var(--clr-plum)',       label: lang==='fr' ? 'Aujourd\'hui' : 'Today' },
          ].map(({ color, label, dashed }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px', fontSize:'13px', color:'var(--clr-text-muted)' }}>
              <div style={{ width:'12px', height:'12px', borderRadius:'50%', background:color, flexShrink:0, opacity: dashed ? .7 : 1 }} />
              {label}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}