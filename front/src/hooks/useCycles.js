// ============================================================
// FICHIER  : src/hooks/useCycles.js
// RÔLE     : Hook React personnalisé pour gérer les cycles.
//            Encapsule le chargement, la création, la modification
//            et la suppression des cycles avec gestion d'état locale.
//
// UTILISATION :
//   const { cycles, loading, createCycle, refetch } = useCycles();
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as cycleService from '../services/cycleService';

export function useCycles(autoFetch = true) {
  const [cycles, setCycles]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [pagination, setPagination] = useState(null);

  // ── CHARGER LES CYCLES ──────────────────────────────────────
  const fetchCycles = useCallback(async (page = 1, limit = 12) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cycleService.getCycles(page, limit);
      setCycles(result.cycles);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.userMessage || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  // Charge automatiquement au montage si autoFetch = true
  useEffect(() => {
    if (autoFetch) fetchCycles();
  }, [autoFetch, fetchCycles]);

  // ── CRÉER UN CYCLE ──────────────────────────────────────────
  const createCycle = useCallback(async (cycleData) => {
    setLoading(true);
    try {
      const newCycle = await cycleService.createCycle(cycleData);
      // Ajoute le nouveau cycle en tête de liste
      setCycles(prev => [newCycle, ...prev]);
      toast.success('Cycle enregistré ! Prédictions mises à jour. 🌸');
      return newCycle;
    } catch (err) {
      toast.error(err.userMessage || 'Erreur lors de l\'enregistrement');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── MODIFIER UN CYCLE ───────────────────────────────────────
  const updateCycle = useCallback(async (id, updates) => {
    try {
      const updated = await cycleService.updateCycle(id, updates);
      setCycles(prev => prev.map(c => c.id === id ? updated : c));
      toast.success('Cycle mis à jour.');
      return updated;
    } catch (err) {
      toast.error(err.userMessage || 'Erreur lors de la mise à jour');
      throw err;
    }
  }, []);

  // ── SUPPRIMER UN CYCLE ──────────────────────────────────────
  const deleteCycle = useCallback(async (id) => {
    try {
      await cycleService.deleteCycle(id);
      setCycles(prev => prev.filter(c => c.id !== id));
      toast.success('Cycle supprimé.');
    } catch (err) {
      toast.error(err.userMessage || 'Erreur lors de la suppression');
      throw err;
    }
  }, []);

  return {
    cycles,
    loading,
    error,
    pagination,
    createCycle,
    updateCycle,
    deleteCycle,
    refetch: fetchCycles,
  };
}

// ── HOOK TABLEAU DE BORD ────────────────────────────────────
// Hook séparé pour les données du dashboard (chargement unique)
export function useDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cycleService.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  return { dashboard, loading, error, refetch: fetchDashboard };
}

// ── HOOK PRÉDICTIONS ────────────────────────────────────────
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