export function calculateRiskLevel(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (riskScore <= 30) return 'LOW';
  if (riskScore <= 70) return 'MEDIUM';
  return 'HIGH';
}