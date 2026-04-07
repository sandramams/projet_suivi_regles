// ============================================================
// FICHIER  : src/pages/SymptomsPage.jsx
// RÔLE     : Carnet de bord des symptômes — liste + suppression.
//            Données depuis GET /api/v1/symptoms
// ============================================================

import React, { useState, useContext, useEffect } from 'react';
import toast             from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { fr }            from 'date-fns/locale';
import { LanguageContext } from '../context/LanguageContext';
import { getSymptomsByRange, deleteSymptom } from '../services/symptomService';
import { Card, CardHeader } from '../components/ui/Card';
import Button            from '../components/ui/Button';
import Modal             from '../components/ui/Modal';
import { PageSpinner }   from '../components/ui/Spinner';

// Emojis par type
const SYM_EMOJI = { douleur:'😣', humeur:'😔', fringale:'🍫', libido:'💕', energie:'⚡', sommeil:'😴', temperature:'🌡️', glaire:'🫧', peau:'✨', sein:'🩷', digestion:'🫄', autre:'➕' };

export default function SymptomsPage() {
  const { lang }             = useContext(LanguageContext);
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getSymptomsByRange()
      .then(d => setSymptoms(d.symptoms || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteSymptom(deleteId);
      setSymptoms(p => p.filter(s => s.id !== deleteId));
      toast.success(lang==='fr' ? 'Symptôme supprimé.' : 'Symptom deleted.');
      setDeleteId(null);
    } catch (err) {
      toast.error(err.userMessage || 'Erreur');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageSpinner />;

  // Groupe par date
  const grouped = symptoms.reduce((acc, s) => {
    const d = s.logged_date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(s);
    return acc;
  }, {});

  return (
    <div className="animate-fadeIn">
      <Card>
        <CardHeader icon="📓" title={lang==='fr' ? 'Carnet de bord — 30 derniers jours' : 'Journal — Last 30 days'} />

        {Object.keys(grouped).length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:'var(--clr-text-muted)', fontSize:'14px' }}>
            <p style={{ fontSize:'32px', marginBottom:'10px' }}>📓</p>
            {lang==='fr' ? 'Aucun symptôme enregistré.' : 'No symptoms logged yet.'}
          </div>
        ) : (
          Object.entries(grouped)
            .sort(([a],[b]) => b.localeCompare(a))
            .map(([date, syms]) => (
            <div key={date} style={{ marginBottom:'20px' }}>
              <p style={{ fontSize:'12px', fontWeight:700, color:'var(--clr-text-muted)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:'8px' }}>
                {format(parseISO(date), lang==='fr'?'EEEE d MMMM':'EEEE, MMMM d', { locale:lang==='fr'?fr:undefined })}
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {syms.map(sym => (
                  <div key={sym.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 14px', background:'var(--clr-surface-2)', borderRadius:'var(--r-md)', border:'1px solid var(--clr-border)' }}>
                    <span style={{ fontSize:'20px' }}>{SYM_EMOJI[sym.type]||'•'}</span>
                    <div style={{ flex:1 }}>
                      <span style={{ fontSize:'13.5px', fontWeight:600, color:'var(--clr-plum)' }}>{sym.type}</span>
                      {sym.value && sym.value !== sym.type && <span style={{ fontSize:'13px', color:'var(--clr-text-muted)', marginLeft:'8px' }}>— {sym.value}</span>}
                    </div>
                    {sym.intensity && (
                      <div style={{ display:'flex', gap:'2px' }}>
                        {[1,2,3,4,5].map(n => (
                          <div key={n} style={{ width:'7px', height:'7px', borderRadius:'50%', background: n<=sym.intensity?'var(--clr-rose)':'var(--clr-rose-pale)' }} />
                        ))}
                      </div>
                    )}
                    <button onClick={() => setDeleteId(sym.id)} style={{ color:'var(--clr-text-hint)', fontSize:'16px', background:'none', border:'none', cursor:'pointer', padding:'4px' }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </Card>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title={lang==='fr'?'Supprimer ce symptôme ?':'Delete this symptom?'} onConfirm={handleDelete} confirmLabel={lang==='fr'?'Supprimer':'Delete'} confirmVariant="danger" loading={deleting}>
        <p style={{ fontSize:'14px', color:'var(--clr-text-muted)' }}>
          {lang==='fr' ? 'Cette action est irréversible.' : 'This action cannot be undone.'}
        </p>
      </Modal>
    </div>
  );
}