import { useState, useEffect, useCallback } from "react";

export interface Agent {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "QUARANTINED" | "TERMINATED";
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/agents");
        const data = await res.json();
        if (!active) return;
        if (data.success) {
          setAgents(data.agents);
        } else {
          setError(data.error);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load agents");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const deleteAgent = async (id: string) => {
    try {
      const res = await fetch(`/api/agents/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAgents((prev) => prev.filter((a) => a.id !== id));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to delete agent" };
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agent");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/agents/${id}`);
        const data = await res.json();
        if (!active) return;
        if (data.success) {
          setAgent(data.agent);
        } else {
          setError(data.error);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load agent");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  return { agent, loading, error, fetchAgent };
}
