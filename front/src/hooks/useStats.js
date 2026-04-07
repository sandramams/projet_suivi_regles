// ============================================================
// FICHIER  : src/hooks/useStats.js
// RÔLE     : Hook pour les statistiques et le calendrier mensuel.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import * as statsService from '../services/statsService';

export function useStatsOverview() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    statsService.getStatsOverview()
      .then(setStats)
      .catch(err => setError(err.userMessage))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}

// Hook calendrier — se recharge quand année/mois changent
export function useMonthlyCalendar(year, month) {
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading]           = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await statsService.getMonthlyCalendar(year, month);
      setCalendarData(data);
    } catch {
      setCalendarData(null);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { fetch(); }, [fetch]);

  return { calendarData, loading, refetch: fetch };
}

export function useCyclesHistory(limit = 12) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsService.getCyclesHistory(limit)
      .then(d => setHistory(d.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [limit]);

  return { history, loading };
}