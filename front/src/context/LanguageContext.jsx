// ============================================================
// FICHIER  : src/context/LanguageContext.jsx
// RÔLE     : Gestion de la langue de l'interface (FR / EN).
//            Stocke la langue en localStorage pour la persister
//            entre les sessions.
//            Fournit aussi les traductions de l'interface.
// ============================================================

import React, { createContext, useState, useCallback } from 'react';

export const LanguageContext = createContext(null);

// ── TRADUCTIONS ─────────────────────────────────────────────
// Toutes les chaînes de caractères de l'interface en FR et EN
const TRANSLATIONS = {
  fr: {
    // Navigation
    nav_dashboard:   'Tableau de bord',
    nav_calendar:    'Calendrier',
    nav_log:         'Enregistrer',
    nav_stats:       'Statistiques',
    nav_symptoms:    'Symptômes',
    nav_partner:     'Partenaire',
    nav_settings:    'Paramètres',

    // Dashboard
    hello:           'Bonjour',
    phase_label:     'Phase actuelle',
    days_until:      'jours avant vos règles',
    next_period:     'Prochaines règles',
    fertile_window:  'Fenêtre fertile',
    ovulation:       'Ovulation',
    confidence:      'Niveau de confiance',
    cycle_day:       'Jour du cycle',

    // Phases
    phase_regles:     'Règles',
    phase_follicular: 'Folliculaire',
    phase_fertile:    'Fertile',
    phase_ovulation:  'Ovulation',
    phase_luteal:     'Lutéale',
    phase_predicted:  'Prédites',
    phase_unknown:    'Inconnu',

    // Formulaire cycle
    form_start_date:   'Date de début',
    form_end_date:     'Date de fin',
    form_end_optional: '(optionnel)',
    form_flow:         'Intensité du flux',
    flow_faible:       'Faible',
    flow_moyen:        'Moyen',
    flow_abondant:     'Abondant',
    form_notes:        'Notes libres',
    form_notes_ph:     'Ex: crampes légères, flux abondant...',
    btn_save_cycle:    'Enregistrer ce cycle',
    btn_save_symptom:  'Enregistrer le symptôme',
    btn_cancel:        'Annuler',

    // Symptômes
    sym_douleur:    'Douleur',
    sym_humeur:     'Humeur',
    sym_fringale:   'Fringale',
    sym_libido:     'Libido',
    sym_energie:    'Énergie',
    sym_sommeil:    'Sommeil',
    sym_temperature:'Température',
    sym_col_uterin: 'Col utérin',
    sym_glaire:     'Glaire',
    sym_peau:       'Peau',
    sym_sein:       'Sein',
    sym_digestion:  'Digestion',
    sym_autre:      'Autre',
    sym_intensity:  'Intensité',

    // Stats
    avg_cycle:      'Durée moy. du cycle',
    avg_period:     'Durée moy. des règles',
    total_cycles:   'Cycles enregistrés',
    days_unit:      'jours',

    // Auth
    email:          'Adresse email',
    password:       'Mot de passe',
    first_name:     'Prénom',
    login_btn:      'Se connecter',
    register_btn:   'Créer mon compte',
    no_account:     'Pas encore de compte ?',
    have_account:   'Déjà un compte ?',
    forgot_pwd:     'Mot de passe oublié ?',

    // Messages
    loading:        'Chargement...',
    save_success:   'Enregistré avec succès !',
    delete_confirm: 'Êtes-vous sûr(e) de vouloir supprimer ?',
    error_generic:  'Une erreur est survenue. Veuillez réessayer.',
    no_data:        'Aucune donnée disponible.',
    no_cycles:      'Vous n\'avez pas encore enregistré de cycles.',
    add_first_cycle:'Enregistrez votre premier cycle pour commencer.',
  },

  en: {
    nav_dashboard:   'Dashboard',
    nav_calendar:    'Calendar',
    nav_log:         'Log',
    nav_stats:       'Statistics',
    nav_symptoms:    'Symptoms',
    nav_partner:     'Partner',
    nav_settings:    'Settings',
    hello:           'Hello',
    phase_label:     'Current phase',
    days_until:      'days until your period',
    next_period:     'Next period',
    fertile_window:  'Fertile window',
    ovulation:       'Ovulation',
    confidence:      'Confidence level',
    cycle_day:       'Cycle day',
    phase_regles:    'Period',
    phase_follicular:'Follicular',
    phase_fertile:   'Fertile',
    phase_ovulation: 'Ovulation',
    phase_luteal:    'Luteal',
    phase_predicted: 'Predicted',
    phase_unknown:   'Unknown',
    form_start_date: 'Start date',
    form_end_date:   'End date',
    form_end_optional:'(optional)',
    form_flow:       'Flow level',
    flow_faible:     'Light',
    flow_moyen:      'Medium',
    flow_abondant:   'Heavy',
    form_notes:      'Notes',
    form_notes_ph:   'E.g.: light cramps, heavy flow...',
    btn_save_cycle:  'Save cycle',
    btn_save_symptom:'Save symptom',
    btn_cancel:      'Cancel',
    sym_douleur:     'Pain',
    sym_humeur:      'Mood',
    sym_fringale:    'Cravings',
    sym_libido:      'Libido',
    sym_energie:     'Energy',
    sym_sommeil:     'Sleep',
    sym_temperature: 'Temperature',
    sym_col_uterin:  'Cervix',
    sym_glaire:      'Discharge',
    sym_peau:        'Skin',
    sym_sein:        'Breast',
    sym_digestion:   'Digestion',
    sym_autre:       'Other',
    sym_intensity:   'Intensity',
    avg_cycle:       'Avg. cycle length',
    avg_period:      'Avg. period length',
    total_cycles:    'Logged cycles',
    days_unit:       'days',
    email:           'Email address',
    password:        'Password',
    first_name:      'First name',
    login_btn:       'Log in',
    register_btn:    'Create account',
    no_account:      'No account yet?',
    have_account:    'Already have an account?',
    forgot_pwd:      'Forgot password?',
    loading:         'Loading...',
    save_success:    'Saved successfully!',
    delete_confirm:  'Are you sure you want to delete?',
    error_generic:   'An error occurred. Please try again.',
    no_data:         'No data available.',
    no_cycles:       'You have not logged any cycles yet.',
    add_first_cycle: 'Log your first cycle to get started.',
  },
};

export function LanguageProvider({ children }) {
  // Charge la langue depuis localStorage (ou 'fr' par défaut)
  const [lang, setLang] = useState(
    () => localStorage.getItem('cycletracker_lang') || 'fr'
  );

  // Change la langue et persiste en localStorage
  const changeLang = useCallback((newLang) => {
    localStorage.setItem('cycletracker_lang', newLang);
    setLang(newLang);
  }, []);

  // Fonction de traduction : t('nav_dashboard') → 'Tableau de bord'
  const t = useCallback((key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.fr[key] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}