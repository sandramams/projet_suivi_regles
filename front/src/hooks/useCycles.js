// ============================================================
// FICHIER  : src/hooks/useCycles.js
// RÔLE     : Hooks pour la gestion des cycles (CRUD + dashboard).
//            Encapsule les appels API avec gestion d'état locale.
// → Chemin dans le projet : src/hooks/useCycles.js
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as cycleService from '../services/cycleService';

// ── useCycles : liste + CRUD ─────────────────────────────────
export function useCycles(autoFetch = true) {
  const [cycles, setCycles]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchCycles = useCallback(async (page = 1, limit = 12) => {
    setLoading(true); setError(null);
    try {
      const r = await cycleService.getCycles(page, limit);
      setCycles(r.cycles);
      setPagination(r.pagination);
    } catch (e) { setError(e.userMessage || 'Erreur de chargement'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (autoFetch) fetchCycles(); }, [autoFetch, fetchCycles]);

  const createCycle = useCallback(async (data) => {
    setLoading(true);
    try {
      const c = await cycleService.createCycle(data);
      setCycles(p => [c, ...p]);
      toast.success('Cycle enregistré ! Prédictions mises à jour. 🌸');
      return c;
    } catch (e) { toast.error(e.userMessage || 'Erreur'); throw e; }
    finally { setLoading(false); }
  }, []);

  const updateCycle = useCallback(async (id, updates) => {
    try {
      const u = await cycleService.updateCycle(id, updates);
      setCycles(p => p.map(c => c.id === id ? u : c));
      toast.success('Cycle mis à jour.');
      return u;
    } catch (e) { toast.error(e.userMessage || 'Erreur'); throw e; }
  }, []);

  const deleteCycle = useCallback(async (id) => {
    try {
      await cycleService.deleteCycle(id);
      setCycles(p => p.filter(c => c.id !== id));
      toast.success('Cycle supprimé.');
    } catch (e) { toast.error(e.userMessage || 'Erreur'); throw e; }
  }, []);

  return { cycles, loading, error, pagination, createCycle, updateCycle, deleteCycle, refetch: fetchCycles };
}

// ── useDashboard : données du tableau de bord ────────────────
export function useDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try { setDashboard(await cycleService.getDashboard()); }
    catch (e) { setError(e.userMessage); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  return { dashboard, loading, error, refetch: fetchDashboard };
}

// ── usePredictions : prédictions des prochains cycles ────────
export function usePredictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    cycleService.getPredictions()
      .then(d => setPredictions(d.predictions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { predictions, loading };
}