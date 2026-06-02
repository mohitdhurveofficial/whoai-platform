'use client';

import { useState, useEffect } from 'react';
import { RoleGuard } from '@/components/ui/RoleGuard';

interface Risk {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  severity: string;
  score: number;
  status: string;
  createdAt: string;
}

interface RiskFormData {
  title: string;
  description: string;
  severity: string;
  score: number;
  status: string;
}

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [formData, setFormData] = useState<RiskFormData>({
    title: '', description: '', severity: 'MEDIUM', score: 0.0, status: 'OPEN'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/risks');
      if (!res.ok) throw new Error('Failed to fetch risks');
      const data: Risk[] = await res.json();
      setRisks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/risks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ title: '', description: '', severity: 'MEDIUM', score: 0.0, status: 'OPEN' });
    fetchRisks();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Risks</h1>
      
      <RoleGuard allowedRoles={['ADMIN', 'COMPLIANCE_OFFICER']}>
        <form onSubmit={handleSubmit} className="space-y-4 mb-8 bg-gray-50 p-6 rounded shadow-sm">
          <input placeholder="Risk Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="border p-2 block w-full rounded bg-white" />
          <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="border p-2 block w-full rounded bg-white" />
          
          <label className="block text-sm text-gray-700">Severity</label>
          <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})} className="border p-2 block w-full rounded bg-white">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          
          <label className="block text-sm text-gray-700">Status</label>
          <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="border p-2 block w-full rounded bg-white">
            <option value="OPEN">Open</option>
            <option value="MITIGATED">Mitigated</option>
            <option value="CLOSED">Closed</option>
          </select>
          
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition">Create Risk</button>
        </form>
      </RoleGuard>

      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-500">Loading live risks...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : risks.length === 0 ? (
          <p className="text-gray-500">No risks have been logged yet.</p>
        ) : risks.map((risk) => (
          <div key={risk.id} className="border p-4 rounded shadow-sm bg-white">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{risk.title}</h2>
              <span className={`px-2 py-1 text-xs font-bold text-white rounded tracking-wide ${risk.severity === 'CRITICAL' ? 'bg-red-700' : risk.severity === 'HIGH' ? 'bg-red-500' : risk.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-emerald-500'}`}>
                {risk.severity}
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-3">
              Status: <span className="font-medium text-gray-700">{risk.status}</span> | Created: {new Date(risk.createdAt).toLocaleDateString()}
            </p>
            <p className="text-gray-800 leading-relaxed">{risk.description ?? 'No description available'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}