import { useState, useEffect, useCallback } from "react";

export interface Agent {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "QUARANTINED" | "TERMINATED";
  pauseReason?: string | null;
  pausedAt?: string | null;
  pausedBy?: string | null;
  dailyBudget: number;
  monthlyBudget: number;
  currentDailySpend: number;
  currentMonthlySpend: number;
  organizationId: string;
  createdAt: string;
  clientId?: string;
  scopes?: string[];
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/agents");
      const data = await res.json();
      if (data.success) {
        setAgents(data.agents);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const deleteAgent = async (id: string) => {
    try {
      const res = await fetch(`/api/agents/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAgents((prev) => prev.filter((a) => a.id !== id));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { agents, loading, error, fetchAgents, deleteAgent };
}

export function useAgent(id: string) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/agents/${id}`);
      const data = await res.json();
      if (data.success) {
        setAgent(data.agent);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchAgent();
  }, [id, fetchAgent]);

  return { agent, loading, error, fetchAgent };
}
