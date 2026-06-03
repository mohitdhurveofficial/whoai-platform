'use client';

import { useState, useCallback, useEffect } from 'react';

interface Decision {
  id: string;
  title: string;
  description?: string;
  AgentId?: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  confidenceScore?: number;
  status: string;
}

interface DecisionFormData {
  title: string;
  description: string;
  AgentId: string;
  riskScore: number;
  confidenceScore: number;
  status: string;
}

export default function DecisionsPage() {

  const [decisions, setDecisions] = useState<Decision[]>([]);

  const [formData, setFormData] = useState<DecisionFormData>({
    title: '', description: '', AgentId: '', riskScore: 0, confidenceScore: 0, status: ''
  });

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      const res = await fetch('/api/decisions');
      const data = await res.json();
      if (!ignore && Array.isArray(data)) {
        setDecisions(data);
      }
    }
    void loadData();
    return () => { ignore = true; };
  }, []);

  const fetchDecisions = useCallback(async () => {
    const res = await fetch('/api/decisions');
    const data = await res.json();
    if (Array.isArray(data)) {
      setDecisions(data);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ title: '', description: '', AgentId: '', riskScore: 0, confidenceScore: 0, status: '' });
    fetchDecisions();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Decisions</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8 bg-gray-50 p-6 rounded shadow-sm">
        <input placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="border p-2 block w-full rounded" />
        <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="border p-2 block w-full rounded" />
        <input placeholder="AI Worker ID" value={formData.AgentId} onChange={e => setFormData({...formData, AgentId: e.target.value})} required className="border p-2 block w-full rounded" />
        <label className="block text-sm text-gray-700">Risk Score (0-100)</label>
        <input type="number" min="0" max="100" placeholder="Risk Score" value={formData.riskScore} onChange={e => setFormData({...formData, riskScore: Number(e.target.value)})} required className="border p-2 block w-full rounded" />
        <label className="block text-sm text-gray-700">Confidence Score</label>
        <input type="number" step="0.01" placeholder="Confidence Score" value={formData.confidenceScore} onChange={e => setFormData({...formData, confidenceScore: Number(e.target.value)})} required className="border p-2 block w-full rounded" />
        <input placeholder="Status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} required className="border p-2 block w-full rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Decision</button>
      </form>

      <div className="space-y-4">
        {decisions.map((decision) => (
          <div key={decision.id} className="border p-4 rounded shadow-sm bg-white">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{decision.title}</h2>
              <span className={`px-2 py-1 text-sm font-bold text-white rounded ${decision.riskLevel === 'HIGH' ? 'bg-red-500' : decision.riskLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                Risk: {decision.riskLevel}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-2">AI Worker: {decision.AgentId ?? 'N/A'} | Status: {decision.status} | Confidence: {decision.confidenceScore ?? 'N/A'} | Raw Score: {decision.riskScore}</p>
            <p className="text-gray-800">{decision.description ?? 'No description available'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}